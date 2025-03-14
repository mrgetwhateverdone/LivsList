const GROCERY_LIST_KEY = 'livslist_grocery_items';
const GROCERY_LISTS_KEY = 'livslist_grocery_lists';

// Get all grocery lists
export const getAllLists = () => {
  try {
    const lists = localStorage.getItem(GROCERY_LISTS_KEY);
    if (!lists) {
      // Initialize with a default list if none exists
      const defaultList = { id: 'default', name: 'My Grocery List', items: [] };
      saveLists([defaultList]);
      return [defaultList];
    }
    return JSON.parse(lists);
  } catch (error) {
    console.error('Error getting grocery lists from localStorage:', error);
    return [{ id: 'default', name: 'My Grocery List', items: [] }];
  }
};

// Save all grocery lists
export const saveLists = (lists) => {
  try {
    localStorage.setItem(GROCERY_LISTS_KEY, JSON.stringify(lists));
  } catch (error) {
    console.error('Error saving grocery lists to localStorage:', error);
  }
};

// Create a new list
export const createList = (name) => {
  try {
    const lists = getAllLists();
    const newList = {
      id: `list_${Date.now()}`,
      name,
      items: []
    };
    
    const updatedLists = [...lists, newList];
    saveLists(updatedLists);
    return updatedLists;
  } catch (error) {
    console.error('Error creating new list:', error);
    return getAllLists();
  }
};

// Delete a list
export const deleteList = (listId) => {
  try {
    const lists = getAllLists();
    // Don't allow deleting the default list
    if (listId === 'default') return lists;
    
    const updatedLists = lists.filter(list => list.id !== listId);
    saveLists(updatedLists);
    return updatedLists;
  } catch (error) {
    console.error('Error deleting list:', error);
    return getAllLists();
  }
};

// For backward compatibility
export const getGroceryList = () => {
  try {
    // First check if we have the old format
    const oldItems = localStorage.getItem(GROCERY_LIST_KEY);
    
    if (oldItems) {
      // Migrate old items to new format
      const parsedItems = JSON.parse(oldItems);
      const lists = getAllLists();
      const defaultList = lists.find(list => list.id === 'default');
      
      if (defaultList) {
        defaultList.items = parsedItems;
        saveLists(lists);
        // Remove old format
        localStorage.removeItem(GROCERY_LIST_KEY);
        return parsedItems;
      }
    }
    
    // Otherwise get items from the default list
    const lists = getAllLists();
    const defaultList = lists.find(list => list.id === 'default');
    return defaultList ? defaultList.items : [];
  } catch (error) {
    console.error('Error getting grocery list from localStorage:', error);
    return [];
  }
};

// For backward compatibility
export const saveGroceryList = (items) => {
  try {
    const lists = getAllLists();
    const defaultList = lists.find(list => list.id === 'default');
    
    if (defaultList) {
      defaultList.items = items;
      saveLists(lists);
    }
  } catch (error) {
    console.error('Error saving grocery list to localStorage:', error);
  }
};

export const addItemToList = (item, listId = 'default') => {
  try {
    const lists = getAllLists();
    const targetList = lists.find(list => list.id === listId);
    
    if (!targetList) return getGroceryList();
    
    // Check if item already exists in the list
    const exists = targetList.items.some(existingItem => existingItem.id === item.id);
    
    if (!exists) {
      // Add timestamp to item if it doesn't have one
      const itemWithTimestamp = {
        ...item,
        timestamp: item.timestamp || Date.now()
      };
      
      targetList.items = [...targetList.items, itemWithTimestamp];
      saveLists(lists);
      
      // For backward compatibility
      if (listId === 'default') {
        return targetList.items;
      }
    }
    
    return listId === 'default' ? targetList.items : getGroceryList();
  } catch (error) {
    console.error('Error adding item to grocery list:', error);
    return getGroceryList();
  }
};

export const removeItemFromList = (itemId, listId = 'default') => {
  try {
    const lists = getAllLists();
    const targetList = lists.find(list => list.id === listId);
    
    if (!targetList) return getGroceryList();
    
    targetList.items = targetList.items.filter(item => item.id !== itemId);
    saveLists(lists);
    
    return listId === 'default' ? targetList.items : getGroceryList();
  } catch (error) {
    console.error('Error removing item from grocery list:', error);
    return getGroceryList();
  }
}; 