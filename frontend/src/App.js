import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SelectionPage from './pages/SelectionPage.js';
import ItemsPage from './pages/ItemPage.js';
import WaitPlay from './pages/waitplay.js';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SelectionPage />} />
        <Route path="/items" element={<ItemsPage />} />
        <Route path="/waitplay" element={<WaitPlay/>}/>
      </Routes>
    </Router>
  );
}

export default App;