import React, { useState, useEffect, useRef } from 'react';

const MyLists = ({ items, onRemoveItem }) => {
  const [groceryItems, setGroceryItems] = useState([]);
  const [sortOption, setSortOption] = useState('dateAdded');
  const [checkedItems, setCheckedItems] = useState({});
  const [lists, setLists] = useState([{ id: 'default', name: 'My Grocery List', default: true }]);
  const [activeListId, setActiveListId] = useState('default');
  const [showNewListModal, setShowNewListModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const printRef = useRef();

  // Add timestamp to items if they don't have one
  useEffect(() => {
    const itemsWithTimestamp = items.map(item => {
      if (!item.timestamp) {
        return { ...item, timestamp: item.timestamp || Date.now() };
      }
      return item;
    });
    setGroceryItems(itemsWithTimestamp);
    
    // Initialize checked state from localStorage
    const savedCheckedState = localStorage.getItem('livslist_checked_items');
    if (savedCheckedState) {
      setCheckedItems(JSON.parse(savedCheckedState));
    }
    
    // Load saved lists from localStorage
    const savedLists = localStorage.getItem('livslist_saved_lists');
    if (savedLists) {
      setLists(JSON.parse(savedLists));
    }
    
    // Load active list ID from localStorage
    const savedActiveListId = localStorage.getItem('livslist_active_list');
    if (savedActiveListId) {
      setActiveListId(savedActiveListId);
    }
  }, [items]);

  // Save checked state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('livslist_checked_items', JSON.stringify(checkedItems));
  }, [checkedItems]);
  
  // Save lists to localStorage when they change
  useEffect(() => {
    localStorage.setItem('livslist_saved_lists', JSON.stringify(lists));
  }, [lists]);
  
  // Save active list ID to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('livslist_active_list', activeListId);
  }, [activeListId]);

  const handleCheckItem = (itemId) => {
    setCheckedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };
  
  const handleCreateNewList = () => {
    if (!newListName.trim()) return;
    
    const newList = {
      id: `list-${Date.now()}`,
      name: newListName.trim(),
      default: false
    };
    
    setLists(prev => [...prev, newList]);
    setActiveListId(newList.id);
    setNewListName('');
    setShowNewListModal(false);
  };
  
  const handleDeleteList = (listId) => {
    // Don't allow deleting the default list
    if (listId === 'default') return;
    
    setLists(prev => prev.filter(list => list.id !== listId));
    
    // If the active list is deleted, switch to the default list
    if (activeListId === listId) {
      setActiveListId('default');
    }
  };

  const getSortedItems = () => {
    const itemsCopy = [...groceryItems];
    
    switch (sortOption) {
      case 'dateAdded':
        return itemsCopy.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      case 'alphabetical':
        return itemsCopy.sort((a, b) => a.name.localeCompare(b.name));
      case 'foodType':
        return itemsCopy.sort((a, b) => {
          const aAisle = a.aisle || 'Other';
          const bAisle = b.aisle || 'Other';
          return aAisle.localeCompare(bAisle);
        });
      default:
        return itemsCopy;
    }
  };

  // Function to capitalize the first letter of each word
  const capitalizeWords = (str) => {
    return str
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Group items by aisle/food type when sorted by food type
  const getGroupedItems = () => {
    if (sortOption !== 'foodType') {
      return { 'All Items': getSortedItems() };
    }

    return getSortedItems().reduce((acc, item) => {
      const aisle = item.aisle || 'Other';
      if (!acc[aisle]) {
        acc[aisle] = [];
      }
      acc[aisle].push(item);
      return acc;
    }, {});
  };

  const handlePrint = () => {
    const activeList = lists.find(list => list.id === activeListId) || lists[0];
    const printContent = document.createElement('div');
    printContent.innerHTML = `
      <html>
        <head>
          <title>Liv's List - ${activeList.name}</title>
          <style>
            body {
              font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
              padding: 20px;
              max-width: 800px;
              margin: 0 auto;
            }
            h1 {
              color: #4ade80;
              border-bottom: 2px solid #4ade80;
              padding-bottom: 10px;
            }
            .list-group {
              margin-bottom: 20px;
            }
            .list-group-header {
              background-color: #f9fafb;
              padding: 8px 12px;
              font-weight: bold;
              margin-top: 15px;
            }
            .list-item {
              padding: 8px 12px;
              border-bottom: 1px solid #e5e7eb;
              display: flex;
              align-items: center;
            }
            .checkbox {
              width: 16px;
              height: 16px;
              border: 2px solid #d1d5db;
              border-radius: 4px;
              margin-right: 12px;
            }
            .item-name {
              font-weight: 500;
            }
            .item-aisle {
              font-size: 12px;
              color: #6b7280;
              margin-top: 4px;
            }
            .checked {
              text-decoration: line-through;
              color: #9ca3af;
            }
            .print-date {
              text-align: right;
              font-size: 12px;
              color: #6b7280;
              margin-top: 30px;
            }
          </style>
        </head>
        <body>
          <h1>Liv's List - ${activeList.name}</h1>
          <div>
            ${Object.entries(getGroupedItems()).map(([group, groupItems]) => `
              <div class="list-group">
                ${sortOption === 'foodType' ? `<div class="list-group-header">${capitalizeWords(group)}</div>` : ''}
                ${groupItems.map(item => `
                  <div class="list-item">
                    <div class="checkbox"></div>
                    <div>
                      <div class="item-name ${checkedItems[item.id] ? 'checked' : ''}">${capitalizeWords(item.name)}</div>
                      ${item.aisle ? `<div class="item-aisle">${capitalizeWords(item.aisle)}</div>` : ''}
                    </div>
                  </div>
                `).join('')}
              </div>
            `).join('')}
          </div>
          <div class="print-date">Printed on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</div>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent.innerHTML);
    printWindow.document.close();
    printWindow.focus();
    
    // Print after a short delay to ensure styles are loaded
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const groupedItems = getGroupedItems();
  const activeList = lists.find(list => list.id === activeListId) || lists[0];

  if (groceryItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">My Lists</h1>
            <button
              onClick={() => setShowNewListModal(true)}
              className="px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Create New List
            </button>
          </div>
          
          <div className="mt-4 flex space-x-2 overflow-x-auto pb-2">
            {lists.map(list => (
              <button
                key={list.id}
                onClick={() => setActiveListId(list.id)}
                className={`px-4 py-2 rounded-full whitespace-nowrap ${
                  activeListId === list.id
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {list.name}
                {!list.default && activeListId === list.id && (
                  <span 
                    className="ml-2 text-white hover:text-red-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteList(list.id);
                    }}
                  >
                    ×
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
        
        <div className="text-center py-8 text-gray-500">
          Your grocery list is empty. Search for items to add them to your list.
        </div>
        
        {showNewListModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Create New List</h2>
              <input
                type="text"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="Enter list name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 mb-4"
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowNewListModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateNewList}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                  disabled={!newListName.trim()}
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">My Lists</h1>
          <button
            onClick={() => setShowNewListModal(true)}
            className="px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Create New List
          </button>
        </div>
        
        <div className="flex space-x-2 overflow-x-auto pb-2 mb-4">
          {lists.map(list => (
            <button
              key={list.id}
              onClick={() => setActiveListId(list.id)}
              className={`px-4 py-2 rounded-full whitespace-nowrap ${
                activeListId === list.id
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {list.name}
              {!list.default && activeListId === list.id && (
                <span 
                  className="ml-2 text-white hover:text-red-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteList(list.id);
                  }}
                >
                  ×
                </span>
              )}
            </button>
          ))}
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div className="mb-4 sm:mb-0">
            <h2 className="text-xl font-semibold text-gray-800">{activeList.name}</h2>
            <p className="text-gray-600">{groceryItems.length} items in your list</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print List
            </button>
            
            <div className="flex items-center">
              <label htmlFor="sort" className="mr-2 text-sm font-medium text-gray-700">
                Sort by:
              </label>
              <select
                id="sort"
                value={sortOption}
                onChange={handleSortChange}
                className="bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="dateAdded">Date Added (Newest First)</option>
                <option value="alphabetical">Alphabetical (A-Z)</option>
                <option value="foodType">Food Type</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden" ref={printRef}>
        {Object.entries(groupedItems).map(([group, groupItems]) => (
          <div key={group} className="border-b last:border-b-0">
            {sortOption === 'foodType' && (
              <div className="bg-gray-50 px-4 py-3">
                <h3 className="font-semibold text-gray-800">{capitalizeWords(group)}</h3>
              </div>
            )}
            
            <ul className="divide-y divide-gray-200">
              {groupItems.map((item) => (
                <li 
                  key={`${item.id}-${item.timestamp}`} 
                  className={`px-4 py-4 flex items-center transition-colors ${
                    checkedItems[item.id] ? 'bg-green-50' : ''
                  }`}
                >
                  <div className="mr-3">
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        className="form-checkbox h-5 w-5 text-green-500 rounded border-gray-300 focus:ring-green-500"
                        checked={!!checkedItems[item.id]}
                        onChange={() => handleCheckItem(item.id)}
                      />
                    </label>
                  </div>
                  
                  <div className="flex-1 flex items-center">
                    {item.image && (
                      <img 
                        src={`https://spoonacular.com/cdn/ingredients_100x100/${item.image}`} 
                        alt={item.name} 
                        className="w-12 h-12 object-cover rounded-full mr-4"
                      />
                    )}
                    
                    <div className="flex-1">
                      <h3 className={`font-medium ${checkedItems[item.id] ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                        {capitalizeWords(item.name)}
                      </h3>
                      
                      <div className="flex flex-wrap items-center mt-1">
                        {item.aisle && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full mr-2 mb-1">
                            {capitalizeWords(item.aisle)}
                          </span>
                        )}
                        
                        <span className="text-xs text-gray-500 mb-1">
                          Added {new Date(item.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4 flex items-center">
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      aria-label={`Remove ${item.name}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      
      {Object.values(checkedItems).some(Boolean) && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setCheckedItems({})}
            className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 mr-2"
          >
            Uncheck All
          </button>
          <button
            onClick={() => {
              const itemsToRemove = Object.entries(checkedItems)
                .filter(([_, isChecked]) => isChecked)
                .map(([id]) => id);
              
              itemsToRemove.forEach(id => onRemoveItem(id));
              setCheckedItems({});
            }}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Remove Checked Items
          </button>
        </div>
      )}
      
      {showNewListModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create New List</h2>
            <input
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="Enter list name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowNewListModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNewList}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={!newListName.trim()}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyLists; 