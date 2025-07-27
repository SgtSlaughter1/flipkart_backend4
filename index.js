require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Import and use auth and cart routes
const { router: authRoutes, authenticateJWT } = require("./auth");
const cartRoutes = require("./cart");
app.use(authRoutes);
app.use(cartRoutes);

const productSchema = new mongoose.Schema(
  {
    name: String,
    price: Number,
    description: String,
    imageUrl: String,
    category: { type: String, required: true },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
module.exports.Product = Product;

// Routes
app.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/categories", async (req, res) => {
  try {
    const categories = await Product.distinct("category");
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/product/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/products/category/:category", async (req, res) => {
  try {
    const category = req.params.category.toLowerCase();
    const products = await Product.find({ category });
    res.json(products);
  } catch (error) {
    console.error("Category fetch error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/seed-products", async (req, res) => {
  try {
    const products = [
      {
        name: "iPhone 14 Pro",
        price: 1299,
        description: "Apple's flagship phone with A16 Bionic chip.",
        imageUrl: "https://example.com/images/iphone14pro.jpg",
        category: "smartphones",
      },
      {
        name: "Samsung Galaxy S23 Ultra",
        price: 1199,
        description: "High-end Android phone with 200MP camera.",
        imageUrl: "https://example.com/images/galaxys23ultra.jpg",
        category: "smartphones",
      },
      {
        name: "MacBook Pro 16-inch",
        price: 2399,
        description: "Powerful laptop with M2 Pro chip.",
        imageUrl: "https://example.com/images/macbookpro16.jpg",
        category: "laptops",
      },
      {
        name: "Dell XPS 15",
        price: 1899,
        description: "Premium Windows laptop with OLED display.",
        imageUrl: "https://example.com/images/dellxps15.jpg",
        category: "laptops",
      },
      {
        name: "Sony WH-1000XM5",
        price: 399,
        description: "Industry-leading noise cancelling headphones.",
        imageUrl: "https://example.com/images/sonywh1000xm5.jpg",
        category: "electronics",
      },
      {
        name: "iPad Pro 12.9",
        price: 1099,
        description: "Large, powerful tablet with M2 chip.",
        imageUrl: "https://example.com/images/ipadpro12.jpg",
        category: "electronics",
      },
      {
        name: "Apple Watch Ultra",
        price: 799,
        description: "Durable smartwatch for extreme sports.",
        imageUrl: "https://example.com/images/applewatchultra.jpg",
        category: "electronics",
      },
      {
        name: "Google Pixel 7",
        price: 599,
        description: "Google’s flagship phone with Tensor G2 chip.",
        imageUrl: "https://example.com/images/pixel7.jpg",
        category: "smartphones",
      },
      {
        name: "Bose QuietComfort Earbuds II",
        price: 299,
        description: "Premium noise-cancelling earbuds.",
        imageUrl: "https://example.com/images/boseqc2.jpg",
        category: "electronics",
      },
      {
        name: "Logitech MX Master 3S",
        price: 99,
        description: "Advanced productivity mouse with silent clicks.",
        imageUrl: "https://example.com/images/mxmaster3s.jpg",
        category: "electronics",
      },
    ];

    await Product.deleteMany(); // optional: clean before seeding
    await Product.insertMany(products);
    res.status(201).json({
      success: true,
      message: "Seeded 10 products into the database.",
      count: products.length,
    });
  } catch (err) {
    console.error("Seeding error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to seed products",
      error: err.message,
    });
  }
});

// ✅ Connect and start server only if DB is live

const MONGO_URI =
  "mongodb+srv://habeebabdulsalam86:sJDlWEc7Nmhr7ixu@cluster0.i7jailt.mongodb.net/ecommerce";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas");
    app.listen(8080, () => {
      console.log("🚀 Server is running on http://localhost:8080");
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });
