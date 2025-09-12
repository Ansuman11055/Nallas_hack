import React from 'react';
import Dashboard from './components/Dashboard/Dashboard';
import CacheBuster from './components/CacheBuster';
import './App.css';

function App() {
  return (
    <CacheBuster>
      <div className="App">
        <Dashboard />
      </div>
    </CacheBuster>
  );
}

export default App;
