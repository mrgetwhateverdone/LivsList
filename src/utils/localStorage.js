const GROCERY_LIST_KEY = 'livslist_grocery_items';

export const getGroceryList = () => {
  try {
    const items = localStorage.getItem(GROCERY_LIST_KEY);
    return items ? JSON.parse(items) : [];
  } catch (error) {
    console.error('Error getting grocery list from localStorage:', error);
    return [];
  }
};

export const saveGroceryList = (items) => {
  try {
    localStorage.setItem(GROCERY_LIST_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Error saving grocery list to localStorage:', error);
  }
};

export const addItemToList = (item) => {
  try {
    const currentList = getGroceryList();
    
    // Check if item already exists in the list
    const exists = currentList.some(existingItem => existingItem.id === item.id);
    
    if (!exists) {
      // Add timestamp to item if it doesn't have one
      const itemWithTimestamp = {
        ...item,
        timestamp: item.timestamp || Date.now()
      };
      
      const newList = [...currentList, itemWithTimestamp];
      saveGroceryList(newList);
      return newList;
    }
    
    return currentList;
  } catch (error) {
    console.error('Error adding item to grocery list:', error);
    return getGroceryList();
  }
};

export const removeItemFromList = (itemId) => {
  try {
    const currentList = getGroceryList();
    const newList = currentList.filter(item => item.id !== itemId);
    saveGroceryList(newList);
    return newList;
  } catch (error) {
    console.error('Error removing item from grocery list:', error);
    return getGroceryList();
  }
}; 