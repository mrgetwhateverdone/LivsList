import React from 'react';

const Footer = ({ apiPointsUsed }) => {
  return (
    <footer className="mt-auto py-4 border-t border-gray-100">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        <div>
          <p className="text-sm text-gray-600">
            &copy; {new Date().getFullYear()} Liv's List
          </p>
        </div>
        <div className="flex items-center mt-2 md:mt-0">
          {apiPointsUsed > 0 && (
            <p className="text-sm text-gray-600 mr-4">
              API Points Used: {apiPointsUsed}/150
              {apiPointsUsed > 120 && (
                <span className="ml-2 text-red-500 font-semibold">
                  Warning: Approaching daily limit!
                </span>
              )}
            </p>
          )}
          <a
            href="https://spoonacular.com/food-api"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-green-500 hover:text-green-600 font-medium"
          >
            Powered by Spoonacular
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 