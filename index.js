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

app.get("/product/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
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
      },
      {
        name: "Samsung Galaxy S23 Ultra",
        price: 1199,
        description: "High-end Android phone with 200MP camera.",
        imageUrl: "https://example.com/images/galaxys23ultra.jpg",
      },
      {
        name: "MacBook Pro 16-inch",
        price: 2399,
        description: "Powerful laptop with M2 Pro chip.",
        imageUrl: "https://example.com/images/macbookpro16.jpg",
      },
      {
        name: "Dell XPS 15",
        price: 1899,
        description: "Premium Windows laptop with OLED display.",
        imageUrl: "https://example.com/images/dellxps15.jpg",
      },
      {
        name: "Sony WH-1000XM5",
        price: 399,
        description: "Industry-leading noise cancelling headphones.",
        imageUrl: "https://example.com/images/sonywh1000xm5.jpg",
      },
      {
        name: "iPad Pro 12.9",
        price: 1099,
        description: "Large, powerful tablet with M2 chip.",
        imageUrl: "https://example.com/images/ipadpro12.jpg",
      },
      {
        name: "Apple Watch Ultra",
        price: 799,
        description: "Durable smartwatch for extreme sports.",
        imageUrl: "https://example.com/images/applewatchultra.jpg",
      },
      {
        name: "Google Pixel 7",
        price: 599,
        description: "Google’s flagship phone with Tensor G2 chip.",
        imageUrl: "https://example.com/images/pixel7.jpg",
      },
      {
        name: "Bose QuietComfort Earbuds II",
        price: 299,
        description: "Premium noise-cancelling earbuds.",
        imageUrl: "https://example.com/images/boseqc2.jpg",
      },
      {
        name: "Logitech MX Master 3S",
        price: 99,
        description: "Advanced productivity mouse with silent clicks.",
        imageUrl: "https://example.com/images/mxmaster3s.jpg",
      },
    ];

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
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
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
