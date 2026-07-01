import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import OverallReport from './pages/OverallReport';
import Home from './pages/Home';

function AppContent({ token, setToken }) {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className={`min-h-screen ${isHome ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      {isHome && (
        <nav className="bg-gray-800 border-b border-gray-700 p-4 shadow-md flex justify-between items-center">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold text-blue-400">Calling Management</h1>
            {token && (
              <div className="flex gap-4">
                <Link to="/" className="hover:text-blue-400 transition-colors font-semibold">Home</Link>
                <Link to="/calling-sheet" className="hover:text-blue-400 transition-colors font-semibold">Calling Sheet</Link>
                <Link to="/report" className="hover:text-blue-400 transition-colors font-semibold">Overall Report</Link>
              </div>
            )}
          </div>
          {token && (
            <button 
              onClick={() => {
                localStorage.removeItem('token');
                setToken(null);
              }}
              className="bg-red-600 hover:bg-red-700 text-white transition-colors px-4 py-2 rounded"
            >
              Logout
            </button>
          )}
        </nav>
      )}
      <div className={`${isHome ? 'container mx-auto p-4' : 'p-0'} max-w-full`}>
        <Routes>
          <Route path="/login" element={!token ? <Login setToken={setToken} /> : <Navigate to="/" />} />
          <Route path="/" element={token ? <Home /> : <Navigate to="/login" />} />
          <Route path="/calling-sheet" element={token ? <Dashboard token={token} /> : <Navigate to="/login" />} />
          <Route path="/report" element={token ? <OverallReport token={token} /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  return (
    <Router>
      <AppContent token={token} setToken={setToken} />
    </Router>
  );
}

export default App;
