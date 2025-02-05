const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');  // Import HTTP module
const { Server } = require('socket.io');  // Import Socket.io
const { v4: uuidv4 } = require('uuid');


dotenv.config();

const app = express();

const server = http.createServer(app);  // Create HTTP Server
app.use(cors());
app.use(express.json());

const io = new Server(server, {
  cors: {
      origin: '*',  // Allow frontend access
      methods: ['GET', 'POST']
  }
});

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

// ✅ Define Cart Schema
const cartSchema = new mongoose.Schema({
  cartID: { type: String, unique: true },
  users: [String],  // Store user session IDs
  items: [
      {
          productId: String,
          title: String,
          type: String,
          price: Number,
          quantity: Number
      }
  ]
});

const Cart = mongoose.model('Cart', cartSchema);

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

let carts = {};

// API to Create a Cart and Generate a Unique ID
app.post("/create-cart", (req, res) => {
  const cartID = uuidv4(); // Generate unique ID
  carts[cartID] = { items: [], users: [] };
  res.json({ cartID, message: "Cart created successfully" });
});


// API to Join a Cart
app.post("/join-cart", (req, res) => {
  const { cartID } = req.body;
  if (!carts[cartID]) {
      return res.status(404).json({ message: "Cart not found" });
  }
  res.json({ message: "Joined cart successfully", cartID, items: carts[cartID].items });
});

// WebSocket Logic for Real-Time Updates
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("joinCart", (cartID) => {
      socket.join(cartID);
      console.log(`User ${socket.id} joined cart ${cartID}`);
  });

  socket.on("add-item", ({ cartID, item }) => {
    console.log(`Item added: ${item} in cart ${cartID}`);
    
    if(cartID==null)cartID="Vigi"
    carts[cartID].items.push(item);

    console.log(carts[cartID]);
    io.to(cartID).emit("cartUpdated", carts[cartID]);
});

socket.on("remove-item", ({ cartID, itemID }) => {
    console.log(`Item removed: ${itemID} from cart ${cartID}`);

    // Remove the item from the cart in the carts object
    carts[cartID].items = carts[cartID].items.filter(item => item.productId !== itemID);

    // Broadcast the removal to everyone in the same cart
    io.to(cartID).emit("cartUpdated", carts[cartID]);
});

  socket.on("disconnect", () => {
      console.log("A user disconnected:", socket.id);
  });
});


const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
