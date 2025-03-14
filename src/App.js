import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import SearchResults from './components/SearchResults';
import GroceryList from './components/GroceryList';
import StoreLocator from './components/StoreLocator';
import MyLists from './components/MyLists';
import Footer from './components/Footer';
import { searchIngredients, getApiPointsUsed } from './services/api';
import { getGroceryList, addItemToList, removeItemFromList } from './utils/localStorage';

function App() {
  const [searchResults, setSearchResults] = useState([]);
  const [groceryList, setGroceryList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiPointsUsed, setApiPointsUsed] = useState(0);
  const [currentPage, setCurrentPage] = useState('home');

  // Load grocery list from localStorage on initial render
  useEffect(() => {
    setGroceryList(getGroceryList());
    setApiPointsUsed(getApiPointsUsed());
  }, []);

  const handleSearch = async (query) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await searchIngredients(query);
      setSearchResults(response.data.results);
      setApiPointsUsed(getApiPointsUsed());
    } catch (err) {
      console.error('Error searching ingredients:', err);
      setError('Failed to search ingredients. Please try again later.');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToList = (item) => {
    const updatedList = addItemToList(item);
    setGroceryList(updatedList);
  };

  const handleRemoveItem = (itemId) => {
    const updatedList = removeItemFromList(itemId);
    setGroceryList(updatedList);
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  // Render the appropriate page content
  const renderPageContent = () => {
    switch (currentPage) {
      case 'storeLocator':
        return <StoreLocator />;
      case 'lists':
        return (
          <MyLists 
            items={groceryList} 
            onRemoveItem={handleRemoveItem} 
          />
        );
      case 'home':
      default:
        return (
          <>
            <SearchBar onSearch={handleSearch} isLoading={isLoading} />
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded my-4">
                {error}
              </div>
            )}

            {/* Search Results Section */}
            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Search Results</h2>
                <button 
                  className="text-green-500 text-sm font-medium"
                  onClick={() => console.log('View all search results')}
                >
                  SEE ALL
                </button>
              </div>
              <SearchResults 
                results={searchResults} 
                onAddToList={handleAddToList} 
                isLoading={isLoading} 
              />
            </div>
            
            {/* Grocery List Section */}
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">My Grocery List</h2>
                <button 
                  className="text-green-500 text-sm font-medium"
                  onClick={() => handleNavigate('lists')}
                >
                  SEE ALL
                </button>
              </div>
              <GroceryList 
                items={groceryList} 
                onRemoveItem={handleRemoveItem} 
              />
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header onNavigate={handleNavigate} />
      <main className="flex-grow container mx-auto px-4 py-4">
        {renderPageContent()}
      </main>
      <Footer apiPointsUsed={apiPointsUsed} />
    </div>
  );
}

export default App;
