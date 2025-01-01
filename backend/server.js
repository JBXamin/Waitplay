const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB connection error:', err));

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
});

const Product = mongoose.model('Product', productSchema);

// API Endpoint
app.get('/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).send('Server error: ' + err.message);
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));