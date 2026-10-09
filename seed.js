const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./config/db");
const Product = require("./models/Product");

const products = [
  {
    name: "Classic Oversized Shirt",
    category: "Fashion",
    gender: "Male",
    price: 1499,
    oldPrice: 1999,
    rating: 4.8,
    reviews: 124,
    image:
      "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=700&q=80",
    badge: "BESTSELLER",
    description:
      "A premium oversized shirt designed for everyday comfort and modern style.",
    stock: 45,
    featured: true,
  },

  {
    name: "Minimal Leather Sneakers",
    category: "Footwear",
    gender: "Unisex",
    price: 2299,
    oldPrice: 2999,
    rating: 4.7,
    reviews: 86,
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=80",
    badge: "NEW",
    description:
      "Minimal everyday sneakers combining comfort, clean design and versatility.",
    stock: 32,
    featured: true,
  },

  {
    name: "Premium Wireless Headphones",
    category: "Electronics",
    gender: "Unisex",
    price: 3499,
    oldPrice: 4499,
    rating: 4.9,
    reviews: 213,
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=80",
    badge: "POPULAR",
    description:
      "Premium wireless headphones with immersive audio and a comfortable fit.",
    stock: 28,
    featured: true,
  },

  {
    name: "Modern Ceramic Table Lamp",
    category: "Home & Living",
    gender: "Unisex",
    price: 1299,
    oldPrice: 1799,
    rating: 4.6,
    reviews: 67,
    image:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=700&q=80",
    badge: "SALE",
    description:
      "A modern ceramic table lamp designed to add warmth and character to your home.",
    stock: 19,
    featured: true,
  },
];

const seedProducts = async () => {
  try {
    await connectDB();

    await Product.deleteMany();

    await Product.insertMany(products);

    console.log("Products seeded successfully.");

    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);

    process.exit(1);
  }
};

seedProducts();