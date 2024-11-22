import React from 'react';

const CartItem = ({ item, removeItem }) => {
  return (
    <div>
      <h4>{item.service}</h4>
      <p>Price: ${item.price}</p>
      <p>Quantity: {item.amount}</p>
      <button onClick={() => removeItem(item.id)}>Remove</button>
    </div>
  );
};

export default CartItem;