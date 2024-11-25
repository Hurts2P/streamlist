import React, { useState } from "react";
import productData from "../data/data";
import "./Cartcss.css"; // Add this import

const Cart = ({ cart, setCart }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const taxRate = 0.08;
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.amount, 0);
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const addToCart = (product) => {
    const exists = cart.find((item) => item.id === product.id);
    if (exists) {
      updateQuantity(product.id, 1);
      return;
    }

    if (cart.length > 0) {
      setModalMessage("You can only purchase one plan at a time.");
      setModalVisible(true);
      return;
    }

    setCart([...cart, { ...product, amount: 1 }]);
  };

  const updateQuantity = (id, amount) => {
    const item = cart.find((item) => item.id === id);
    if (item) {
      setCart(
        cart.map((item) =>
          item.id === id
            ? { ...item, amount: Math.max(1, item.amount + amount) }
            : item
        )
      );
    }
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  return (
    <div className="cart-container">
      <h1 className="cart-title">Welcome to Your Cart</h1>
      <p className="cart-subtitle">Your one-stop solution for managing subscriptions.</p>

      <h2 className="section-title">Available Subscriptions</h2>
      <div className="products-grid">
        {productData.map((product) => (
          <div key={product.id} className="product-card">
            <h3 className="product-title">{product.service}</h3>
            <p className="product-info">{product.serviceInfo}</p>
            <p className="product-price">Price: ${product.price}</p>
            <img
              src={product.img}
              alt={product.service}
              className="product-image"
            />
            <button className="add-to-cart-btn" onClick={() => addToCart(product)}>
              Add to Cart
            </button>
          </div>
        ))}
      </div>

      <h2 className="section-title">Your Cart Items</h2>
      <div className="cart-items">
        {cart.length === 0 ? (
          <p className="empty-cart">Your cart is empty.</p>
        ) : (
          cart.map((item) => (
            <div key={item.id} className="cart-item">
              <img
                src={item.img}
                alt={item.service}
                className="cart-item-image"
              />
              <div className="cart-item-details">
                <h3 className="cart-item-title">{item.service}</h3>
                <p className="cart-item-info">{item.serviceInfo}</p>
                <p className="cart-item-price">Price: ${item.price}</p>
                <div className="quantity-controls">
                  <button 
                    className="quantity-btn"
                    onClick={() => updateQuantity(item.id, -1)}
                  >
                    -
                  </button>
                  <span className="quantity">{item.amount}</span>
                  <button 
                    className="quantity-btn"
                    onClick={() => updateQuantity(item.id, 1)}
                  >
                    +
                  </button>
                </div>
                <button 
                  className="remove-btn"
                  onClick={() => removeFromCart(item.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {cart.length > 0 && (
        <div className="cart-summary">
          <h3 className="summary-title">Cart Summary</h3>
          <div className="summary-details">
            <p>
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </p>
            <p>
              <span>Tax (8%):</span>
              <span>${tax.toFixed(2)}</span>
            </p>
            <p className="total">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </p>
          </div>
        </div>
      )}

      {modalVisible && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Unable to Purchase</h2>
            <p>{modalMessage}</p>
            <button className="modal-close-btn" onClick={closeModal}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;