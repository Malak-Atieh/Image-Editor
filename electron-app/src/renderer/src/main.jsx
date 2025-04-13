import React from 'react';
import { HashRouter as Router} from "react-router-dom";
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import store from "./redux/store.js"
import { Provider } from 'react-redux';

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <div className="p-4 max-w-7xl mx-auto">
      <Router>
        <App />
      </Router>
    </div>
  </Provider>
)
