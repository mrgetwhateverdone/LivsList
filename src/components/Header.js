import React, { useState, useEffect } from 'react';

const Header = ({ onNavigate }) => {
  const [scrolled, setScrolled] = useState(false);
  
  // Add scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const refreshPage = () => {
    if (onNavigate) {
      onNavigate('home');
    } else {
      window.location.reload();
    }
  };

  return (
    <header className={`py-4 px-4 sticky top-0 z-10 transition-all duration-300 ${
      scrolled ? 'shadow-md bg-white' : 'bg-white'
    }`}>
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          <div 
            className="flex items-center cursor-pointer group" 
            onClick={refreshPage}
            aria-label="Go to home page"
          >
            <div className="relative">
              <svg 
                className="w-9 h-9 text-green-500 group-hover:text-green-600 transition-colors" 
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path 
                  d="M4.5 3.75a3 3 0 013-3h9a3 3 0 013 3v16.5a.75.75 0 01-1.5 0V3.75a1.5 1.5 0 00-1.5-1.5h-9a1.5 1.5 0 00-1.5 1.5v16.5a.75.75 0 01-1.5 0V3.75z" 
                  fill="currentColor"
                />
                <path 
                  d="M9 6.75a.75.75 0 000 1.5h6a.75.75 0 000-1.5H9z" 
                  fill="currentColor"
                />
                <path 
                  fillRule="evenodd" 
                  clipRule="evenodd" 
                  d="M7.5 12.75a3 3 0 013-3h3a3 3 0 013 3v6.75a.75.75 0 01-.75.75h-7.5a.75.75 0 01-.75-.75v-6.75zm3-1.5a1.5 1.5 0 00-1.5 1.5v6h6v-6a1.5 1.5 0 00-1.5-1.5h-3z" 
                  fill="currentColor"
                />
                <circle cx="18.75" cy="6.75" r="2.25" fill="#4ade80" />
              </svg>
            </div>
            <div className="ml-2">
              <h1 className="text-2xl font-extrabold bg-gradient-to-r from-green-500 to-green-400 bg-clip-text text-transparent tracking-tight">
                Liv's List
              </h1>
              <div className="flex items-center">
                <div className="h-0.5 w-2 bg-green-500 mr-1"></div>
                <p className="text-xs text-gray-500 font-medium">Smart Shopping Assistant</p>
              </div>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-1">
            <button 
              className="text-gray-600 hover:text-green-500 px-2 py-1 text-sm font-medium transition-colors"
              onClick={() => onNavigate ? onNavigate('home') : null}
            >
              Home
            </button>
            <button 
              className="text-gray-600 hover:text-green-500 px-2 py-1 text-sm font-medium transition-colors"
              onClick={() => onNavigate ? onNavigate('lists') : null}
            >
              My Lists
            </button>
            <button 
              className="text-gray-600 hover:text-green-500 px-2 py-1 text-sm font-medium transition-colors"
              onClick={() => onNavigate ? onNavigate('storeLocator') : null}
            >
              Grocery Store Locator
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 