//server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

mongoose
  .connect("mongodb+srv://Waitplay:Waitplay@cluster0.u4tx7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

const productSchema = new mongoose.Schema({
  title: String,
  description: String,
  detailedDescription: String,
  image: String,
  isVeg: Boolean,
  price: Number,
  halfPrice: Number,
  fullPrice: Number,
  specialItems: [String],
  category: String,
  type: String // Added type field for Veg/Non-Veg filtering
});

const Product = mongoose.model('Product', productSchema);

// Fetch products with optional filter by type
app.get('/products', async (req, res) => {
  try {
    const { type, category } = req.query;
    let filter = {};
    
    if (type) filter.type = type;
    if (category) filter.category = category; // Add category filtering
    
    const products = await Product.find(filter);
    res.json(products);
  } catch (err) {
    res.status(500).send('Server error: ' + err.message);
  }
});

// Fetch unique categories based on type
app.get('/categories', async (req, res) => {
  try {
    const { type } = req.query; // Get type from query parameters
    let filter = {};

    if (type) {
      filter.type = type.toLowerCase(); // Apply filter only if type is specified
    }

    const categories = await Product.distinct('category', filter); // Get distinct categories based on filter
    res.json(categories);
  } catch (err) {
    res.status(500).send('Server error: ' + err.message);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
