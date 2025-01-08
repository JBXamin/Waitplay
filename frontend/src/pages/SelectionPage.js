// SelectionPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const SelectionPage = () => {
  const navigate = useNavigate();

  const handleSelection = (category) => {
    navigate(`/items?category=${category}`);
  };

  return (
    <div>
      <h1>Select Category</h1>
      <button onClick={() => handleSelection('veg')}>Veg</button>
      <button onClick={() => handleSelection('non-veg')}>Non-Veg</button>
      <button onClick={() => handleSelection('drinks')}>Drinks</button>
      <button onClick={() => handleSelection('icecream')}>Ice Cream</button>
    </div>
  );
};

export default SelectionPage;
