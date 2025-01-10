// SelectionPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import "./SelectionPage.css";

const SelectionPage = () => {
  const navigate = useNavigate();

  const handleSelection = (category) => {
    navigate(`/items?category=${category}`);
  };

  return (
    <div className="container">
      <h1>Exclusive Experiences</h1>
      <h5>Earn by doing simple tasks honestly</h5>
      <div className="grid">
        <div className="card" onClick={() => handleSelection('veg')}>
          <div className="card-title">Veg</div>
          <div className="card-description">Earn by doing simple tasks honestly</div>
          <div className="card-arrow">&rarr;</div>
        </div>
        <div className="card" onClick={() => handleSelection('non-veg')}>
          <div className="card-title">Non Veg</div>
          <div className="card-description">Earn by doing simple tasks honestly</div>
          <div className="card-arrow">&rarr;</div>
        </div>
        <div className="card" onClick={() => handleSelection('drinks')}>
          <div className="card-title">Drinks</div>
          <div className="card-description">Earn by doing simple tasks honestly</div>
          <div className="card-arrow">&rarr;</div>
        </div>
        <div className="card" onClick={() => handleSelection('icecream')}>
          <div className="card-title">Ice Creams</div>
          <div className="card-description">Earn by doing simple tasks honestly</div>
          <div className="card-arrow">&rarr;</div>
        </div>
      </div>
    </div>
  );
};

export default SelectionPage;
