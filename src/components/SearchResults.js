import React from 'react';

const SearchResults = ({ results, onAddToList, isLoading }) => {
  // Function to capitalize the first letter of each word
  const capitalizeWords = (str) => {
    return str
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (isLoading) {
    return (
      <div className="w-full flex justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No results found. Try a different search term.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {results.map((item) => (
        <div 
          key={item.id} 
          className="rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
        >
          <div className="relative">
            {item.image ? (
              <img 
                src={`https://spoonacular.com/cdn/ingredients_500x500/${item.image}`} 
                alt={item.name} 
                className="w-full h-48 object-cover"
              />
            ) : (
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">No image available</span>
              </div>
            )}
            
            {/* Rating and Time indicators */}
            <div className="absolute bottom-2 left-2 flex items-center space-x-4">
              <div className="flex items-center bg-white bg-opacity-90 rounded-full px-2 py-1">
                <svg className="h-4 w-4 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
                <span className="text-xs font-medium">5</span>
              </div>
              <div className="flex items-center bg-white bg-opacity-90 rounded-full px-2 py-1">
                <svg className="h-4 w-4 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span className="text-xs font-medium">15min</span>
              </div>
            </div>
          </div>
          
          <div className="p-4">
            <h3 className="font-semibold text-lg text-gray-800">{capitalizeWords(item.name)}</h3>
            {item.aisle && <p className="text-sm text-gray-600 mt-1">Aisle: {capitalizeWords(item.aisle)}</p>}
            
            <button
              onClick={() => onAddToList(item)}
              className="mt-3 w-full bg-green-500 text-white py-2 px-3 rounded-lg hover:bg-green-600 transition-colors"
            >
              Add to List
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SearchResults; 