import React, { useState, useEffect } from 'react';

const Header = ({ onNavigate }) => {
  const [scrolled, setScrolled] = useState(false);
  const [activePage, setActivePage] = useState('home');
  
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
      setActivePage('home');
    } else {
      window.location.reload();
    }
  };
  
  const handleNavigate = (page) => {
    if (onNavigate) {
      onNavigate(page);
      setActivePage(page);
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
            <div className="relative transform transition-transform duration-300 group-hover:scale-110">
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
                <circle cx="18.75" cy="6.75" r="2.25" fill="#4ade80" className="animate-pulse" />
              </svg>
            </div>
            <div className="ml-2">
              <h1 className="text-2xl font-extrabold bg-gradient-to-r from-green-500 to-green-400 bg-clip-text text-transparent tracking-tight group-hover:from-green-600 group-hover:to-green-500 transition-all duration-300">
                Liv's List
              </h1>
              <div className="flex items-center">
                <div className="h-0.5 w-2 bg-green-500 mr-1 group-hover:w-3 transition-all duration-300"></div>
                <p className="text-xs text-gray-500 font-medium">Smart Shopping Assistant</p>
              </div>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-2">
            <NavButton 
              label="Home" 
              icon={
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7m-7-7v14" />
                </svg>
              }
              isActive={activePage === 'home'} 
              onClick={() => handleNavigate('home')} 
            />
            <NavButton 
              label="My Lists" 
              icon={
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              }
              isActive={activePage === 'lists'} 
              onClick={() => handleNavigate('lists')} 
            />
            <NavButton 
              label="Store Locator" 
              icon={
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
              isActive={activePage === 'storeLocator'} 
              onClick={() => handleNavigate('storeLocator')} 
            />
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

// Navigation button component
const NavButton = ({ label, icon, isActive, onClick }) => {
  return (
    <button 
      className={`px-3 py-2 rounded-full text-sm font-medium flex items-center transition-all duration-200 ${
        isActive 
          ? 'bg-green-100 text-green-700 shadow-sm' 
          : 'text-gray-600 hover:text-green-500 hover:bg-green-50'
      }`}
      onClick={onClick}
    >
      {icon}
      {label}
      {isActive && (
        <span className="ml-1 w-1.5 h-1.5 rounded-full bg-green-500"></span>
      )}
    </button>
  );
};

export default Header; 