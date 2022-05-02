import Container from './components/Container.js';
import Results from './components/Results.js';
import Home from './components/Home.js';

import './App.css';
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

const App = () => {

  const [currentState, setCurrentState] = useState('Team');

  return (
    <Router>
      <Routes>
          <Route path="/newquery" element={<Container currentState={[currentState, setCurrentState]}/>} />
          <Route path="/query/*" element={<Results currentState={[currentState, setCurrentState]}/>} />
          <Route path="/home" element={<Home/>} />
      </Routes>
    </Router>
  );
};

export default App;
