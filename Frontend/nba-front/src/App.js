import Container from './components/Container.js';
import Results from './components/Results.js';
import Login from './components/Login.js';

import './App.css';
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

const App = () => {

  const [currentState, setCurrentState] = useState('Home');

  return (
    <Router>
      <Routes>
          <Route path="/newquery" element={<Container currentState={[currentState, setCurrentState]}/>} />
          <Route path="/query/*" element={<Results currentState={[currentState, setCurrentState]}/>} />
          <Route path="/home" element={<Container currentState={[currentState, setCurrentState]}/>} />
          <Route path="/login" element={<Container currentState={[currentState, setCurrentState]}/>} />
          <Route path="/signup" element={<Container currentState={[currentState, setCurrentState]}/>} />
      </Routes>
    </Router>
  );
};

export default App;
