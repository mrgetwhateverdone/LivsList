import React, { useState } from 'react';

const SearchResults = ({ results, onAddToList, isLoading, lists }) => {
  // State to track which item is having its list selection modal open
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Function to capitalize the first letter of each word
  const capitalizeWords = (str) => {
    return str
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Function to handle adding to a specific list
  const handleAddToList = (item, listId = null) => {
    // If we have multiple lists and no list is specified, show the list selection
    if (lists && lists.length > 1 && !listId) {
      setSelectedItem(item);
    } else {
      // Otherwise add directly to the default list or specified list
      onAddToList(item, listId);
      setSelectedItem(null);
    }
  };

  // List selection modal
  const ListSelectionModal = () => {
    if (!selectedItem) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
        <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl animate-slideUp">
          <h3 className="text-lg font-semibold mb-4">Select a List</h3>
          <p className="text-gray-600 mb-4">Choose which list to add "{capitalizeWords(selectedItem.name)}" to:</p>
          
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {lists && lists.map(list => (
              <button
                key={list.id}
                onClick={() => handleAddToList(selectedItem, list.id)}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-green-50 transition-colors flex items-center"
              >
                <span className="w-2 h-2 rounded-full bg-green-500 mr-3"></span>
                <span>{list.name}</span>
              </button>
            ))}
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={() => setSelectedItem(null)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => handleAddToList(selectedItem, lists[0].id)}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Add to Default List
            </button>
          </div>
        </div>
      </div>
    );
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
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((item) => (
          <div 
            key={item.id} 
            className="rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-white group"
          >
            <div className="relative overflow-hidden">
              {item.image ? (
                <img 
                  src={`https://spoonacular.com/cdn/ingredients_500x500/${item.image}`} 
                  alt={item.name} 
                  className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">No image available</span>
                </div>
              )}
              
              {/* Rating and Time indicators */}
              <div className="absolute bottom-2 left-2 flex items-center space-x-4">
                <div className="flex items-center bg-white bg-opacity-90 rounded-full px-2 py-1 shadow-sm">
                  <svg className="h-4 w-4 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs font-medium">5</span>
                </div>
                <div className="flex items-center bg-white bg-opacity-90 rounded-full px-2 py-1 shadow-sm">
                  <svg className="h-4 w-4 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs font-medium">15min</span>
                </div>
              </div>
              
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold text-lg text-gray-800 group-hover:text-green-600 transition-colors duration-300">{capitalizeWords(item.name)}</h3>
              {item.aisle && <p className="text-sm text-gray-600 mt-1">Aisle: {capitalizeWords(item.aisle)}</p>}
              
              <button
                onClick={() => handleAddToList(item)}
                className="mt-3 w-full bg-green-500 text-white py-2 px-3 rounded-lg hover:bg-green-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 relative overflow-hidden add-to-list-btn"
              >
                <span className="relative z-10">Add to List</span>
                <div className="absolute inset-0 color-shift-bg opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Render the list selection modal */}
      <ListSelectionModal />
    </>
  );
};

export default SearchResults; 