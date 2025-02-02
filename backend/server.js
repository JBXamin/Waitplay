const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const crypto = require('crypto');
const QRCode = require('qrcode');
const http = require('http'); // Required for integrating Socket.IO
const { Server } = require('socket.io'); // Socket.IO integration
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
const server = http.createServer(app); // Create HTTP server for Socket.IO
const io = new Server(server); // Initialize Socket.IO

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

//cart schema
const cartSchema = new mongoose.Schema({
  cartId: { type: String, unique: true, required: true }, // Unique identifier for the cart
  createdBy: { type: String, required: true }, // User who created the cart
  users: [{ type: String }], // List of users who joined the cart
  items: [
    {
      itemName: String,
      quantity: Number,
      addedBy: String,
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

const Cart = mongoose.model('Cart', cartSchema);

app.use((req, res, next) => {
  console.log(`Received ${req.method} request at ${req.url}`);
  console.log('Request Params:', req.params);
  console.log('Request Body:', req.body);
  next();
});


// Listen for Socket.IO connections
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Join a specific cart room
  socket.on('join-cart', (cartId) => {
    socket.join(cartId);
    console.log(`User joined cart room: ${cartId}`);
  });

  socket.on('cart-updated', (updatedCart) => {
    if (updatedCart.cartId === joinCartId) {
      setCartData(updatedCart); // Sync cart data
      setCart(updatedCart.items); // Sync items in the local cart
    }
  });

  socket.on('update-cart', async (data) => {
    const { cartId, item } = data;

    try {
      const cart = await Cart.findOne({ cartId });
      if (!cart) {
        console.error('Cart not found:', cartId);
        return;
      }

      const existingItem = cart.items.find((i) => i.itemName === item.itemName);
      if (existingItem) {
        existingItem.quantity = item.quantity;
      } else {
        cart.items.push(item);
      }

      await cart.save();
      io.to(cartId).emit('cart-updated', cart); // Broadcast the updated cart
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  });
  

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

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

// Create a new cart and generate QR code
app.post('/create-cart', async (req, res) => {
  try {
    const { userId } = req.body;
    const cartId = crypto.randomBytes(4).toString('hex'); // Generate a unique cart ID

    const newCart = new Cart({
      cartId,
      createdBy: userId,
      users: [userId], // Add the creator as the first user
    });

    await newCart.save();

    const qrCode = await QRCode.toDataURL(cartId);
    res.status(201).json({ cartId, qrCode });
  } catch (error) {
    res.status(500).json({ message: 'Error creating cart', error: error.message });
  }
});

// Join an existing cart
// In the /join-cart API endpoint
app.post('/join-cart', async (req, res) => {
  try {
    const { cartId, userId } = req.body;

    const cart = await Cart.findOne({ cartId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    if (!cart.users.includes(userId)) {
      cart.users.push(userId);
      await cart.save();
    }

    // Notify other users in the cart room
    io.to(cartId).emit('cart-updated', cart);

    // Add the user to the Socket.IO room
    io.emit('join-cart', { cartId, userId });

    res.status(200).json({ message: 'Successfully joined the cart', cartId });
  } catch (error) {
    res.status(500).json({ message: 'Error joining cart', error: error.message });
  }
});

app.post('/cart/:cartId/add-item', async (req, res) => {
  const { cartId } = req.params;
  if (!cartId) {
      console.error('Cart ID is missing in the request.');
      return res.status(400).json({ message: 'Cart ID is required.' });
  }

  try {
      const { itemName, quantity, addedBy } = req.body;

      const cart = await Cart.findOne({ cartId });
      if (!cart) {
          console.error(`Cart not found for ID: ${cartId}`);
          return res.status(404).json({ message: 'Cart not found' });
      }

      // Process the cart update
      const existingItem = cart.items.find((item) => item.itemName === itemName);
      if (existingItem) {
          existingItem.quantity += quantity;
      } else {
          cart.items.push({ itemName, quantity, addedBy });
      }

      await cart.save();
      io.to(cartId).emit('cart-updated', cart); // Notify other users in the cart
      res.status(200).json({ message: 'Item added to cart', cart });
  } catch (error) {
      console.error('Error adding item to cart:', error.message);
      res.status(500).json({ message: 'Error adding item to cart', error: error.message });
  }
});



// Retrieve cart details
app.get('/cart/:cartId', async (req, res) => {
  try {
    const { cartId } = req.params;

    const cart = await Cart.findOne({ cartId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cart', error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
