# Liv's List - Smart Grocery Shopping Assistant

A React application for creating and managing grocery lists using the Spoonacular API.

## Features

- Search for grocery items using the Spoonacular API
- Add items to your grocery list
- Remove items from your grocery list
- Grocery list is saved in local storage
- Items are grouped by aisle for easier shopping
- API rate limiting to respect Spoonacular's free tier limits
- Warning when approaching the daily API point limit

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/livslist.git
   cd livslist
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Add your Spoonacular API key:
   - Sign up for a free Spoonacular API key at [https://spoonacular.com/food-api](https://spoonacular.com/food-api)
   - Open `src/services/api.js` and replace `'your-api-key-here'` with your actual API key

4. Start the development server:
   ```
   npm start
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## API Usage

This application uses the Spoonacular API with the following limitations on the free tier:
- 150 points per day
- 1 request per second

Each search request costs 1 point. The application tracks your API usage and warns you when you're approaching the daily limit.

## Technologies Used

- React
- Tailwind CSS
- Axios
- Spoonacular API

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Powered by [Spoonacular API](https://spoonacular.com/food-api)
