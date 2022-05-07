import Container from './components/Container.js';
import Results from './components/Results.js';
import Login from './components/Login.js';
import { useEffect } from 'react';

import './App.css';
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

const App = () => {

  const [currentState, setCurrentState] = useState('Home');

  useEffect(() => {
    if (window.location.href.includes("login")) {
      setCurrentState("Login");
    }
    if (window.location.href.includes("signup")) {
      setCurrentState("Signup");
    }
    if (window.location.href.includes("newquery") && currentState === "Home") {
      setCurrentState("Team");
    }
    if (window.location.href.includes("myqueries")) {
      setCurrentState("Queries");
    }
  }, [window.location.href])


  return (
    <Router>
      <Routes>
          <Route path="/newquery" element={<Container currentState={[currentState, setCurrentState]}/>} />
          <Route path="/myqueries" element={<Container currentState={[currentState, setCurrentState]}/>} />
          <Route path="/query/*" element={<Results currentState={[currentState, setCurrentState]}/>} />
          <Route path="/login" element={<Container currentState={[currentState, setCurrentState]}/>} />
          <Route path="/signup" element={<Container currentState={[currentState, setCurrentState]}/>} />
          <Route path="/*" element={<Container currentState={[currentState, setCurrentState]}/>} />
      </Routes>
    </Router>
  );
};

export default App;
