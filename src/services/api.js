import axios from 'axios';

// Replace with your actual API key
const API_KEY = '44ad0de355d649d4b105e15cb02d9b34';
const BASE_URL = 'https://api.spoonacular.com';

// Create a queue for API requests to ensure we don't exceed rate limits
class RequestQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
  }

  enqueue(request) {
    return new Promise((resolve, reject) => {
      this.queue.push({
        request,
        resolve,
        reject
      });
      
      if (!this.processing) {
        this.processQueue();
      }
    });
  }

  async processQueue() {
    if (this.queue.length === 0) {
      this.processing = false;
      return;
    }

    this.processing = true;
    const { request, resolve, reject } = this.queue.shift();

    try {
      // Execute the request
      const response = await request();
      resolve(response);
    } catch (error) {
      reject(error);
    }

    // Wait 1 second before processing the next request (to respect rate limit)
    setTimeout(() => {
      this.processQueue();
    }, 1000);
  }
}

const requestQueue = new RequestQueue();

// Create an axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  params: {
    apiKey: API_KEY
  }
});

// Add response interceptor to track API points used
api.interceptors.response.use(
  (response) => {
    // Extract API usage information from headers
    const pointsUsed = parseInt(response.headers['x-api-quota-used'] || '0');
    const pointsRemaining = parseInt(response.headers['x-api-quota-left'] || '0');
    
    // Store API usage in localStorage
    localStorage.setItem('spoonacular_points_used', pointsUsed);
    localStorage.setItem('spoonacular_points_remaining', pointsRemaining);
    
    return response;
  },
  (error) => {
    // Handle rate limiting errors
    if (error.response && error.response.status === 429) {
      console.error('Rate limit exceeded. Please try again later.');
    }
    return Promise.reject(error);
  }
);

// API methods
export const searchIngredients = async (query) => {
  return requestQueue.enqueue(() => 
    api.get('/food/ingredients/search', {
      params: {
        query,
        number: 10,
        metaInformation: true
      }
    })
  );
};

export const getApiPointsUsed = () => {
  return parseInt(localStorage.getItem('spoonacular_points_used') || '0');
};

export default api; 