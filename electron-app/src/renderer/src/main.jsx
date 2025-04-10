import React from 'react';
import { HashRouter as Router} from "react-router-dom";
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
ReactDOM.createRoot(document.getElementById('root')).render(
  <div className="p-4 max-w-7xl mx-auto">
    <Router>
      <App />
    </Router>
  </div>
)
