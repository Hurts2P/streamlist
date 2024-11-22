import React from 'react';
import productData from '../data/data';

const Subscription = ({ cart, setCart }) => {
  const addToCart = (product) => {
    const exists = cart.find((item) => item.id === product.id);
    if (exists) {
      alert("Item already in cart!");
      return;
    }
    setCart([...cart, { ...product, quantity: 1 }]);
  };

  return (
    <div>
      <h1>Available Subscriptions</h1>
      {productData.map((product) => (
        <div key={product.id}>
          <h3>{product.name}</h3>
          <p>Price: ${product.price}</p>
          <button onClick={() => addToCart(product)}>Add to Cart</button>
        </div>
      ))}
    </div>
  );
};

export default Subscription;
