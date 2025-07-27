const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

// Cart schema
const Cart = mongoose.model(
  "Cart",
  new mongoose.Schema({
    userId: { type: String, required: true },
    items: [
      {
        productId: { type: String, required: true },
        quantity: { type: Number, required: true },
      },
    ],
    status: { type: String, default: "active" },
    updatedAt: { type: Date, default: Date.now },
  })
);

// Add item to cart
router.post("/cart/add", async (req, res) => {
  try {
    const { productId, quantity = 1, userId } = req.body;

    if (!productId || !userId) {
      return res.status(400).json({
        success: false,
        message: "Product ID and User ID are required.",
      });
    }

    if (isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a positive number.",
      });
    }

    let cart = await Cart.findOne({ userId, status: "active" });

    if (!cart) {
      cart = new Cart({ userId, items: [], status: "active" });
    }

    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId === productId
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += parseInt(quantity);
    } else {
      cart.items.push({ productId, quantity: parseInt(quantity) });
    }

    cart.updatedAt = new Date();
    await cart.save();

    res.status(201).json({
      success: true,
      message: "Item added to cart.",
      data: cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add item to cart.",
      error: error.message,
    });
  }
});

// Get all carts
router.get("/carts", async (req, res) => {
  try {
    const carts = await Cart.find();
    res.status(200).json({
      success: true,
      count: carts.length,
      data: carts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch cart data.",
      error: error.message,
    });
  }
});

// Get cart by user ID
router.get("/cart/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const cart = await Cart.findOne({ userId, status: "active" });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Active cart not found for user.",
      });
    }

    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch user cart.",
      error: error.message,
    });
  }
});

// Remove item from cart
router.delete("/cart/:userId", async (req, res) => {
  try {
    const { productId } = req.body;
    const { userId } = req.params;

    if (!productId || !userId) {
      return res.status(400).json({
        success: false,
        message: "User ID and Product ID are required.",
      });
    }

    const cart = await Cart.findOne({ userId, status: "active" });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Active cart not found for user.",
      });
    }

    const initialLength = cart.items.length;
    cart.items = cart.items.filter((item) => item.productId !== productId);

    if (cart.items.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart.",
      });
    }

    cart.updatedAt = new Date();
    await cart.save();

    res.status(200).json({
      success: true,
      message: "Item removed from cart.",
      data: cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to remove item.",
      error: error.message,
    });
  }
});

module.exports = router;
