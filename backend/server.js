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
  type: String,
});

const Product = mongoose.model('Product', productSchema);

// Fetch products with optional filter by type and category
app.get('/products', async (req, res) => {
  try {
    const { type, category } = req.query;
    let filter = {};

    if (type && type !== 'all') filter.type = type.toLowerCase();
    if (category && category !== 'all') filter.category = category.toLowerCase();

    const products = await Product.find(filter);
    res.json(products);
  } catch (err) {
    res.status(500).send('Server error: ' + err.message);
  }
});

app.get('/categories', async (req, res) => {
  try {
    const { type } = req.query;
    let filter = {};

    if (type && type !== 'all') filter.type = type.toLowerCase();

    const categories = await Product.distinct('category', filter);
    res.json(categories);
  } catch (err) {
    res.status(500).send('Server error: ' + err.message);
  }
});

// Search products by title
app.get('/api/search', async (req, res) => {
  try {
    const query = req.query.q; // Get search query from request
    const results = await Product.find({ title: { $regex: query, $options: 'i' } }); // Case-insensitive search
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching search results', error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
