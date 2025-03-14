import React from 'react';

const GroceryList = ({ items, onRemoveItem }) => {
  // Function to capitalize the first letter of each word
  const capitalizeWords = (str) => {
    return str
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Your grocery list is empty. Search for items to add them to your list.
      </div>
    );
  }

  // Group items by aisle
  const groupedItems = items.reduce((acc, item) => {
    const aisle = item.aisle || 'Other';
    if (!acc[aisle]) {
      acc[aisle] = [];
    }
    acc[aisle].push(item);
    return acc;
  }, {});

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Object.entries(groupedItems).map(([aisle, aisleItems]) => (
        <div key={aisle} className="rounded-lg overflow-hidden shadow-md">
          <div className="bg-gray-50 px-4 py-3 border-b">
            <h3 className="font-semibold text-lg text-gray-800">{capitalizeWords(aisle)}</h3>
          </div>
          
          <div className="p-4">
            <ul className="divide-y divide-gray-200">
              {aisleItems.map((item) => (
                <li 
                  key={`${item.id}-${Date.now()}`} 
                  className="py-3 flex justify-between items-center"
                >
                  <div className="flex items-center">
                    {item.image && (
                      <img 
                        src={`https://spoonacular.com/cdn/ingredients_100x100/${item.image}`} 
                        alt={item.name} 
                        className="w-10 h-10 object-cover rounded-full mr-3"
                      />
                    )}
                    <span className="font-medium text-gray-800">{capitalizeWords(item.name)}</span>
                  </div>
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                    aria-label={`Remove ${item.name}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GroceryList; 