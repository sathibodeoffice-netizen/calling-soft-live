import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <div className="mb-8">
        <img 
          src="/agent.png" 
          alt="Call Center Agent" 
          className="w-64 h-64 md:w-80 md:h-80 object-contain mx-auto drop-shadow-xl"
        />
      </div>
      
      <h1 className="text-4xl md:text-5xl font-extrabold text-blue-400 mb-4">
        Welcome to Calling Management
      </h1>
      
      <p className="text-lg md:text-xl text-gray-300 max-w-2xl mb-8">
        Manage your daily calls, edit logs, and view overall reports seamlessly. 
        Select an option below to get started.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Link 
          to="/calling-sheet" 
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-transform transform hover:scale-105 text-lg"
        >
          Go to Calling Sheet
        </Link>
        
        <Link 
          to="/report" 
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-transform transform hover:scale-105 text-lg"
        >
          View Overall Report
        </Link>
      </div>
    </div>
  );
}

export default Home;
