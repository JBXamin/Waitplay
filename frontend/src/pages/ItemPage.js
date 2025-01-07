import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import './ItemPage.css';

const ItemsPage = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [cart, setCart] = useState([]);
    const [quantityState, setQuantityState] = useState({});
    const [showOrderSummary, setShowOrderSummary] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isManualScroll, setIsManualScroll] = useState(false);
    const [activeFilters, setActiveFilters] = useState(['All']); // Default to "All" selected
    const bannerRef = useRef(null);
    const queryParams = new URLSearchParams(location.search);
    const category = queryParams.get('category');
    const type = queryParams.get('category') || 'all';

    useEffect(() => {
        axios.get('http://localhost:5000/products')
            .then((response) => setProducts(response.data))
            .catch((error) => console.error('Error fetching products:', error));

        axios.get('http://localhost:5000/categories')
            .then((response) => setCategories(response.data))
            .catch((error) => console.error('Error fetching categories:', error));
    }, []);

    useEffect(() => {
        axios
            .get(`http://localhost:5000/products?type=${type}&category=${category}`)
            .then((response) => setProducts(response.data))
            .catch((error) => console.error('Error fetching products:', error));
    
        axios
            .get(`http://localhost:5000/categories?type=${type}`)
            .then((response) => setCategories(response.data))
            .catch((error) => console.error('Error fetching categories:', error));
    }, [type, category]);

    useEffect(() => {
        let interval;

        if (!isManualScroll) {
            interval = setInterval(() => {
                if (bannerRef.current) {
                    const banners = Array.from(bannerRef.current.children);
                    const firstChild = banners.shift();
                    bannerRef.current.appendChild(firstChild);
                }
            }, 3000);
        }

        return () => clearInterval(interval);
    }, [isManualScroll]);

    const handleManualScroll = () => {
        setIsManualScroll(true);
        setTimeout(() => setIsManualScroll(false), 10000);
    };

    const handleQuantityChange = (productId, type, delta) => {
        setQuantityState((prevState) => {
            const key = `${productId}-${type}`;
            const newQuantity = Math.max((prevState[key] || 0) + delta, 0);

            if (newQuantity === 0) {
                setCart((prevCart) => prevCart.filter(item => !(item._id === productId && item.type === type)));
            } else {
                setCart((prevCart) => {
                    const existingProduct = prevCart.find(
                        (item) => item._id === productId && item.type === type
                    );
                    if (existingProduct) {
                        return prevCart.map((item) =>
                            item._id === productId && item.type === type
                                ? { ...item, quantity: newQuantity }
                                : item
                        );
                    } else {
                        const product = products.find((prod) => prod._id === productId);
                        return [
                            ...prevCart,
                            {
                                _id: productId,
                                title: product.title,
                                type,
                                price: type === 'Half' ? product.halfPrice : product.fullPrice,
                                quantity: newQuantity,
                            },
                        ];
                    }
                });
            }

            return { ...prevState, [key]: newQuantity };
        });
    };

    const toggleOrderSummary = () => {
        setShowOrderSummary(!showOrderSummary);
    };

    const showProductDetails = (product) => {
        setSelectedProduct(product);
    };

    const closeProductDetails = () => {
        setSelectedProduct(null);
    };

    const handleFilter = (filter) => {
        if (filter === 'All') {
            setActiveFilters((prevFilters) => 
                prevFilters.includes('All') && prevFilters.length === categories.length + 1
                    ? [] // Deselect all
                    : ['All', ...categories] // Select all
            );
        } else {
            setActiveFilters((prevFilters) => {
                if (prevFilters.includes(filter)) {
                    const updatedFilters = prevFilters.filter((f) => f !== filter);
                    return updatedFilters.length === 0 ? ['All'] : updatedFilters;
                } else {
                    return [...prevFilters.filter((f) => f !== 'All'), filter];
                }
            });
        }
    };

    const filteredProducts = activeFilters.includes('All')
    ? products
    : products.filter((product) => activeFilters.includes(product.category));

    return (
        <div className="app-container">
            <header className="header">
                <div className="logo">PFC Wings</div>
                <div className="search-bar">
                    <input type="text" placeholder="Search for food..." />
                </div>
            </header>

            <div className="banner-container" onTouchStart={handleManualScroll} onMouseDown={handleManualScroll}>
                <div className="banner-carousel" ref={bannerRef}>
                    <div className="banner-item">
                        <img src="https://content.wepik.com/statics/740676612/preview-page0.jpg" alt="Banner 1" className="banner-image" />
                    </div>
                    <div className="banner-item">
                        <img src="https://img.freepik.com/free-vector/flat-design-food-sale-background_23-2149211006.jpg?w=360" alt="Banner 2" className="banner-image" />
                    </div>
                    <div className="banner-item">
                        <img src="https://img.freepik.com/free-vector/flat-design-food-sale-background_23-2149167390.jpg" alt="Banner 3" className="banner-image" />
                    </div>
                </div>
            </div>

            <div className="filter-container">
                <button
                    className={`filter-button ${activeFilters.includes('All') ? 'active' : ''}`}
                    onClick={() => handleFilter('All')}
                >
                    All
                </button>
                {categories.map((category) => (
                    <button
                        key={category}
                        className={`filter-button ${activeFilters.includes(category) ? 'active' : ''}`}
                        onClick={() => handleFilter(category)}
                    >
                        {category}
                    </button>
                ))}
            </div>

            <main className="product-list">
                {filteredProducts.map((product) => (
                    <div className="product-card" key={product._id}>
                        <div className="product-image-container" style={{ width: '200px', height: '200px' }}>
                            <img
                                className="product-image"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                src={product.image}
                                alt={product.title}
                            />
                        </div>
                        <div className="product-details">
                            <div className="product-header">
                                <h3 className="product-title">{product.title}</h3>
                                <span className="product-time">20min</span>
                            </div>
                            <p className="product-description">
                                {product.description} <span className="know-more" onClick={() => showProductDetails(product)}>...more</span>
                            </p>
                            <div className="product-prices">
                                <span className="price">@{product.halfPrice} Half</span>
                                <span className="price">@{product.fullPrice} Full</span>
                            </div>
                            <div className="product-actions">
                                <div
                                    className="quantity-control"
                                    style={{
                                        backgroundColor: quantityState[`${product._id}-Half`] > 0 ? 'rgba(255, 182, 193, 0.8)' : '#f9f9f9',
                                        border: quantityState[`${product._id}-Half`] > 0 ? '1px solid #ff6f61' : '1px solid #ddd',
                                    }}
                                >
                                    <span>Half</span>
                                    <button onClick={() => handleQuantityChange(product._id, 'Half', -1)}>-</button>
                                    <span>{quantityState[`${product._id}-Half`] || 0}</span>
                                    <button onClick={() => handleQuantityChange(product._id, 'Half', 1)}>+</button>
                                </div>
                                <div
                                    className="quantity-control"
                                    style={{
                                        backgroundColor: quantityState[`${product._id}-Full`] > 0 ? 'rgba(173, 216, 230, 0.8)' : '#f9f9f9',
                                        border: quantityState[`${product._id}-Full`] > 0 ? '1px solid #61a6ff' : '1px solid #ddd',
                                    }}
                                >
                                    <span>Full</span>
                                    <button onClick={() => handleQuantityChange(product._id, 'Full', -1)}>-</button>
                                    <span>{quantityState[`${product._id}-Full`] || 0}</span>
                                    <button onClick={() => handleQuantityChange(product._id, 'Full', 1)}>+</button>
                                </div>
                            </div>
                            <textarea
                                className="notes-input"
                                style={{
                                    backgroundColor: cart.find(item => item._id === product._id) ? 'rgba(240, 248, 255, 0.5)' : '#fff',
                                    border: '1px solid #ddd',
                                    width: '100%',
                                    marginTop: '10px',
                                    padding: '10px',
                                    borderRadius: '5px',
                                }}
                                placeholder="Note to chef"
                            ></textarea>
                        </div>
                    </div>
                ))}
            </main>

            {selectedProduct && (
                <div className="popup-overlay">
                    <div className="product-details-popup slide-up">
                        <button onClick={closeProductDetails} className="close-kmore">X</button>
                        <img className="details-image" src={selectedProduct.image} alt={selectedProduct.title} />
                        <div className="details-content">
                            <h3>{selectedProduct.title}</h3>
                            <p className="details-description">{selectedProduct.detailedDescription}</p>
                            <div className="special-items">
                                <h4>Add Special Items</h4>
                                {selectedProduct.specialItems.map((item, index) => (
                                    <button key={index} className="special-item-button">{item}</button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <footer className="cart-footer">
                <div className="cart-container">
                    <img
                        src="https://i.pinimg.com/originals/e2/06/3e/e2063ef31174bff0e81d1bb641b5f3f3.png" 
                        alt="Cart"
                        className="cart-icon"
                    />
                    <span className="cart-badge">{cart.reduce((total, item) => total + item.quantity, 0)}</span>
                </div>
                <button onClick={toggleOrderSummary} className="summary-button">Order Summary ></button>
                <button className="place-order" style={{
                    backgroundColor: cart.length === 0 ? 'grey' : 'darkgreen',
                    color: 'white',
                }}>Play Order</button>
            </footer>

            {showOrderSummary && (
                <div className="order-summary-container">
                    <div className="order-summary slide-up">
                        <div className="order-summary-header">
                            <div className="cart-container">
                                <div className= "new-cart">
                                    <img
                                        src="https://i.pinimg.com/originals/e2/06/3e/e2063ef31174bff0e81d1bb641b5f3f3.png" 
                                        alt="Cart"
                                        className="cart-icon"
                                    />
                                    <span className="cart-badge">{cart.reduce((total, item) => total + item.quantity, 0)}</span>
                                </div>
                            </div>
                            <div className="summary-text">Order Summary </div>
                            <button onClick={toggleOrderSummary} className="close-summary">X</button>
                        </div>
                        <table className="order-list scrollable">
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Quantity</th>
                                    <th>Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cart.map((item, index) => (
                                    <tr key={`${item._id}-${item.type}`} className="order-item">
                                        <td>{index + 1}</td>
                                        <td>{item.title} ({item.type})</td>
                                        <td>{item.quantity}</td>
                                        <td>₹{item.price * item.quantity}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                        <button className="place-order cart" style={{
                        backgroundColor: cart.length === 0 ? 'grey' : 'darkgreen',
                        color: 'white', // Optional for better contrast
                        }}>Play Order</button>      
                </div>
            )}
            
        </div>
    );
};

export default ItemsPage;