import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import Landing from './Landing';
import Configure from './Configure'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/live" element={<Home />} />
        <Route path='/configure' element={<Configure />} />
      </Routes>
    </Router>
  );
}