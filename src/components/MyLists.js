import React, { useState, useEffect, useRef } from 'react';

const MyLists = ({ lists, onRemoveItem, onCreateList, onDeleteList }) => {
  const [sortOption, setSortOption] = useState('dateAdded');
  const [checkedItems, setCheckedItems] = useState({});
  const [activeListId, setActiveListId] = useState('default');
  const [showNewListModal, setShowNewListModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const printRef = useRef();

  // Initialize from localStorage
  useEffect(() => {
    // Initialize checked state from localStorage
    const savedCheckedState = localStorage.getItem('livslist_checked_items');
    if (savedCheckedState) {
      setCheckedItems(JSON.parse(savedCheckedState));
    }
    
    // Load active list ID from localStorage
    const savedActiveListId = localStorage.getItem('livslist_active_list');
    if (savedActiveListId) {
      setActiveListId(savedActiveListId);
    }
  }, []);

  // Save checked state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('livslist_checked_items', JSON.stringify(checkedItems));
  }, [checkedItems]);
  
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
    
    onCreateList(newListName.trim());
    setNewListName('');
    setShowNewListModal(false);
    
    // Find the newly created list and set it as active
    setTimeout(() => {
      const newLists = lists.filter(list => list.name === newListName.trim());
      if (newLists.length > 0) {
        setActiveListId(newLists[0].id);
      }
    }, 100);
  };
  
  const handleDeleteList = (listId) => {
    // Don't allow deleting the default list
    if (listId === 'default') return;
    
    onDeleteList(listId);
    
    // If the active list is deleted, switch to the default list
    if (activeListId === listId) {
      setActiveListId('default');
    }
  };

  const getSortedItems = () => {
    const activeList = lists.find(list => list.id === activeListId) || lists[0];
    const items = activeList?.items || [];
    
    switch (sortOption) {
      case 'dateAdded':
        return [...items].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      case 'alphabetical':
        return [...items].sort((a, b) => a.name.localeCompare(b.name));
      case 'foodType':
        return [...items].sort((a, b) => {
          const aAisle = a.aisle || 'Other';
          const bAisle = b.aisle || 'Other';
          return aAisle.localeCompare(bAisle);
        });
      default:
        return [...items];
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
  const items = getSortedItems();

  if (!lists || lists.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No lists available. Create a new list to get started.
      </div>
    );
  }

  if (items.length === 0) {
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
          
          {/* List tabs */}
          <div className="mt-4 overflow-x-auto pb-2">
            <div className="flex space-x-2">
              {lists.map(list => (
                <button
                  key={list.id}
                  onClick={() => setActiveListId(list.id)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                    activeListId === list.id
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {list.name}
                </button>
              ))}
              <button
                onClick={() => setShowNewListModal(true)}
                className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 whitespace-nowrap"
              >
                + New List
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center py-8 text-gray-500">
            This list is empty. Add items from the search results.
          </div>
        </div>
        
        {/* New List Modal */}
        {showNewListModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">Create New List</h3>
              <input
                type="text"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="List Name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 mb-4"
              />
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowNewListModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateNewList}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
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
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">My Lists</h1>
          <div className="flex space-x-2">
            <button
              onClick={handlePrint}
              className="px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print
              </span>
            </button>
            <button
              onClick={() => setShowNewListModal(true)}
              className="px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Create New List
            </button>
          </div>
        </div>
        
        {/* List tabs */}
        <div className="mt-4 overflow-x-auto pb-2">
          <div className="flex space-x-2">
            {lists.map(list => (
              <button
                key={list.id}
                onClick={() => setActiveListId(list.id)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                  activeListId === list.id
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {list.name}
                {list.id !== 'default' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteList(list.id);
                    }}
                    className="ml-2 text-white hover:text-red-100"
                    aria-label={`Delete ${list.name} list`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </button>
            ))}
            <button
              onClick={() => setShowNewListModal(true)}
              className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 whitespace-nowrap"
            >
              + New List
            </button>
          </div>
        </div>
        
        {/* Sort options */}
        <div className="mt-4 flex justify-end">
          <div className="relative inline-block">
            <select
              value={sortOption}
              onChange={handleSortChange}
              className="block appearance-none bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="dateAdded">Sort by Date Added</option>
              <option value="alphabetical">Sort Alphabetically</option>
              <option value="foodType">Sort by Food Type</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6" ref={printRef}>
        <h2 className="text-xl font-semibold mb-4">{activeList.name}</h2>
        
        {Object.entries(groupedItems).map(([group, groupItems]) => (
          <div key={group} className="mb-6">
            {sortOption === 'foodType' && (
              <h3 className="text-lg font-medium text-gray-700 mb-2 pb-1 border-b">
                {capitalizeWords(group)}
              </h3>
            )}
            
            <ul className="space-y-2">
              {groupItems.map(item => (
                <li 
                  key={item.id} 
                  className="flex items-start p-2 hover:bg-gray-50 rounded-md transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={!!checkedItems[item.id]}
                    onChange={() => handleCheckItem(item.id)}
                    className="form-checkbox mt-1 mr-3"
                  />
                  <div className="flex-1">
                    <span className={`font-medium ${checkedItems[item.id] ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                      {capitalizeWords(item.name)}
                    </span>
                    {item.aisle && (
                      <p className="text-sm text-gray-500 mt-1">
                        Aisle: {capitalizeWords(item.aisle)}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => onRemoveItem(item.id, activeListId)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    aria-label={`Remove ${item.name}`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      
      {/* New List Modal */}
      {showNewListModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Create New List</h3>
            <input
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="List Name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 mb-4"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowNewListModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNewList}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
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