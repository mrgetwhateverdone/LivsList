import React, { useState, useEffect, useCallback } from 'react';
import { getAppCheckToken } from '../firebase/firebase';

const StoreLocator = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stores, setStores] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [zipCode, setZipCode] = useState('');
  const [searchRadius, setSearchRadius] = useState(10); // miles
  const [mapLoaded, setMapLoaded] = useState(false);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [mapError, setMapError] = useState(false);
  const [apiLoadAttempts, setApiLoadAttempts] = useState(0);
  const [appCheckToken, setAppCheckToken] = useState(null);

  // Get App Check token on component mount
  useEffect(() => {
    const fetchAppCheckToken = async () => {
      try {
        const token = await getAppCheckToken();
        setAppCheckToken(token);
        console.log('App Check token obtained successfully');
      } catch (error) {
        console.error('Error obtaining App Check token:', error);
        setError('Failed to authenticate the application. Please try again later.');
      }
    };

    fetchAppCheckToken();
  }, []);

  // Define getUserLocation as a useCallback to avoid recreating it on every render
  const getUserLocation = useCallback(() => {
    setLoading(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          
          // Add marker for user location
          if (map && window.google && window.google.maps) {
            try {
              new window.google.maps.Marker({
                position: location,
                map: map,
                icon: {
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 10,
                  fillColor: '#4ade80',
                  fillOpacity: 0.7,
                  strokeWeight: 2,
                  strokeColor: '#ffffff'
                },
                title: 'Your Location'
              });
            } catch (err) {
              console.error('Error adding user location marker:', err);
            }
          }
          findNearbyGroceryStores();
        },
        (err) => {
          console.error('Error getting user location:', err);
          setError('Unable to get your location. Please enter a zip code manually.');
          setLoading(false);
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    } else {
      setError('Geolocation is not supported by your browser. Please enter a zip code manually.');
      setLoading(false);
    }
  }, [map]); // Only recreate if map changes

  // Define findNearbyGroceryStores as a useCallback
  const findNearbyGroceryStores = useCallback(() => {
    if (!map || !userLocation || mapError || !window.google || !window.google.maps || !window.google.maps.places) {
      console.log('Cannot find grocery stores: Missing required objects', {
        map: !!map,
        userLocation: !!userLocation,
        mapError,
        googleMaps: !!(window.google && window.google.maps),
        places: !!(window.google && window.google.maps && window.google.maps.places)
      });
      return;
    }
    
    setLoading(true);
    setStores([]);
    
    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    setMarkers([]);
    
    try {
      const service = new window.google.maps.places.PlacesService(map);
      
      const request = {
        location: userLocation,
        radius: searchRadius * 1609.34, // Convert miles to meters
        type: ['grocery_or_supermarket', 'supermarket']
      };
      
      service.nearbySearch(request, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          // Sort results by distance
          const sortedResults = results.sort((a, b) => {
            const distanceA = window.google.maps.geometry.spherical.computeDistanceBetween(
              userLocation, 
              a.geometry.location
            );
            const distanceB = window.google.maps.geometry.spherical.computeDistanceBetween(
              userLocation, 
              b.geometry.location
            );
            return distanceA - distanceB;
          });
          
          // Process results
          const storeData = sortedResults.map(place => {
            // Calculate distance in miles
            const distance = window.google.maps.geometry.spherical.computeDistanceBetween(
              userLocation,
              place.geometry.location
            ) / 1609.34; // Convert meters to miles
            
            // Create a marker for this place
            const marker = new window.google.maps.Marker({
              position: place.geometry.location,
              map: map,
              title: place.name,
              animation: window.google.maps.Animation.DROP
            });
            
            // Add click listener to marker
            const infoWindow = new window.google.maps.InfoWindow({
              content: `
                <div class="p-2">
                  <h3 class="font-bold">${place.name}</h3>
                  <p>${place.vicinity}</p>
                  <p>${distance.toFixed(2)} miles away</p>
                  <p>Rating: ${place.rating ? place.rating + '/5' : 'N/A'}</p>
                </div>
              `
            });
            
            marker.addListener('click', () => {
              infoWindow.open(map, marker);
            });
            
            // Add marker to markers array
            setMarkers(prev => [...prev, marker]);
            
            return {
              id: place.place_id,
              name: place.name,
              address: place.vicinity,
              distance: distance.toFixed(2),
              rating: place.rating,
              open: place.opening_hours?.open_now,
              location: place.geometry.location,
              photos: place.photos,
              marker: marker
            };
          });
          
          setStores(storeData);
          setLoading(false);
        } else {
          console.error('Error finding nearby stores:', status);
          setError('Failed to find grocery stores near you. Please try again later.');
          setLoading(false);
        }
      });
    } catch (err) {
      console.error('Error in findNearbyGroceryStores:', err);
      setError('An error occurred while searching for grocery stores. Please try again.');
      setLoading(false);
    }
  }, [map, userLocation, mapError, markers, searchRadius]); // Include all dependencies

  // Load Google Maps API with App Check token
  useEffect(() => {
    if (window.google && window.google.maps) {
      setMapLoaded(true);
      setMapError(false);
      return;
    }

    // Remove any existing Google Maps scripts to avoid conflicts
    const existingScripts = document.querySelectorAll('script[src*="maps.googleapis.com/maps/api/js"]');
    existingScripts.forEach(script => {
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }
    });

    const loadGoogleMapsAPI = () => {
      try {
        console.log('Loading Google Maps API with App Check...');
        // Create script element
        const googleMapScript = document.createElement('script');
        
        // Use the actual API key, not a placeholder
        const apiKey = 'AIzaSyDT8UDmVh5ra1cRv07sfAWlTkfUnPD_w3I';
        
        // Add a specific error handler for the Google Maps API
        window.gm_authFailure = () => {
          console.error('Google Maps authentication error - API key may be invalid or restricted');
          setMapError(true);
          setError('Google Maps authentication failed. The API key may be invalid or restricted.');
          setLoading(false);
        };
        
        // Log the full URL for debugging (without exposing the key in production)
        console.log(`Loading Google Maps with libraries: places,geometry`);
        
        // Initialize Google Maps Settings with App Check token
        window.initGoogleMapsCallback = () => {
          console.log('Google Maps API loaded successfully');
          
          // Set up App Check token for Google Maps
          if (window.google && window.google.maps) {
            try {
              const { Settings } = window.google.maps;
              if (Settings) {
                Settings.getInstance().fetchAppCheckToken = async () => {
                  // Refresh token if needed
                  try {
                    const token = await getAppCheckToken();
                    console.log('Successfully fetched App Check token for Google Maps');
                    return token;
                  } catch (error) {
                    console.error('Error fetching App Check token for Google Maps:', error);
                    return null;
                  }
                };
                console.log('App Check token integration with Google Maps successful');
              }
            } catch (err) {
              console.error('Error setting up App Check with Google Maps:', err);
            }
            
            // Initialize the map
            initializeMap();
          }
        };
        
        // Set the script source with callback
        googleMapScript.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&callback=initGoogleMapsCallback`;
        googleMapScript.async = true;
        googleMapScript.defer = true;
        
        // Add error handling
        googleMapScript.onerror = () => {
          console.error('Failed to load Google Maps script');
          setMapError(true);
          setError('Failed to load Google Maps. Please check your internet connection and try again.');
          setLoading(false);
          setApiLoadAttempts(prev => prev + 1);
        };
        
        // Append the script to the document
        document.head.appendChild(googleMapScript);
      } catch (error) {
        console.error('Error in loadGoogleMapsAPI:', error);
        setMapError(true);
        setError(`Error loading Google Maps: ${error.message}`);
        setLoading(false);
      }
    };

    // Only load the API if we have an App Check token or if we've tried too many times
    if (appCheckToken || apiLoadAttempts > 2) {
      loadGoogleMapsAPI();
    }
  }, [appCheckToken, apiLoadAttempts]);

  // Initialize map when API is loaded
  useEffect(() => {
    if (mapLoaded && !map) {
      initializeMap();
    }
  }, [mapLoaded, map]);

  // Initialize map
  const initializeMap = () => {
    try {
      if (!window.google || !window.google.maps) {
        console.error('Google Maps not loaded yet');
        return;
      }
      
      console.log('Initializing map...');
      
      // Create map instance
      const mapOptions = {
        center: { lat: 37.7749, lng: -122.4194 }, // Default to San Francisco
        zoom: 12,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      };
      
      const mapInstance = new window.google.maps.Map(
        document.getElementById('map'),
        mapOptions
      );
      
      setMap(mapInstance);
      
      // Get user location after map is initialized
      getUserLocation();
    } catch (err) {
      console.error('Error initializing map:', err);
      setMapError(true);
      setError('Failed to initialize the map. Please refresh the page and try again.');
    }
  };

  // Handle zip code search
  const handleZipCodeSearch = (e) => {
    e.preventDefault();
    
    if (!zipCode.trim()) {
      setError('Please enter a valid zip code');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    // Use Geocoding API to convert zip code to coordinates
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: zipCode, componentRestrictions: { country: 'US' } }, (results, status) => {
      if (status === window.google.maps.GeocoderStatus.OK && results[0]) {
        const location = results[0].geometry.location;
        setUserLocation({ lat: location.lat(), lng: location.lng() });
        
        // Center map on the new location
        if (map) {
          map.setCenter(location);
          map.setZoom(12);
          
          // Add marker for the location
          new window.google.maps.Marker({
            position: location,
            map: map,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: '#4ade80',
              fillOpacity: 0.7,
              strokeWeight: 2,
              strokeColor: '#ffffff'
            },
            title: `Location: ${zipCode}`
          });
        }
        
        findNearbyGroceryStores();
      } else {
        console.error('Geocoding error:', status);
        setError('Could not find location for this zip code. Please try another one.');
        setLoading(false);
      }
    });
  };

  // Group stores by distance
  const getStoreGroups = () => {
    const groups = {
      nearby: [],
      medium: [],
      far: []
    };
    
    stores.forEach(store => {
      const distance = parseFloat(store.distance);
      if (distance <= 2) {
        groups.nearby.push(store);
      } else if (distance <= 5) {
        groups.medium.push(store);
      } else {
        groups.far.push(store);
      }
    });
    
    return groups;
  };

  // Get color class based on distance
  const getColorClass = (color) => {
    switch (color) {
      case 'nearby': return 'bg-green-100 border-green-500 text-green-800';
      case 'medium': return 'bg-yellow-100 border-yellow-500 text-yellow-800';
      case 'far': return 'bg-red-100 border-red-500 text-red-800';
      default: return 'bg-gray-100 border-gray-500 text-gray-800';
    }
  };

  // Get color label based on distance
  const getColorLabel = (color) => {
    switch (color) {
      case 'nearby': return 'Nearby (< 2 miles)';
      case 'medium': return 'Medium Distance (2-5 miles)';
      case 'far': return 'Far (> 5 miles)';
      default: return '';
    }
  };

  // Render the component
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Find Grocery Stores Near You</h1>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 relative">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {/* Map and search controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map container */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md overflow-hidden">
          <div id="map" className="w-full h-[400px] lg:h-[600px] relative">
            {/* Loading overlay */}
            {(loading || !mapLoaded) && (
              <div className="absolute inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
                  <p className="text-gray-700">Loading map...</p>
                </div>
              </div>
            )}
            
            {/* Map error overlay */}
            {mapError && (
              <div className="absolute inset-0 bg-red-100 bg-opacity-75 flex items-center justify-center p-6">
                <div className="text-center max-w-md">
                  <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-red-800 mb-2">Map Loading Error</h3>
                  <p className="text-red-700 mb-4">{error || 'There was a problem loading the map. Please refresh the page and try again.'}</p>
                  <button 
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Refresh Page
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Search controls and results */}
        <div className="lg:col-span-1">
          {/* Search form */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Search Options</h2>
            
            <form onSubmit={handleZipCodeSearch} className="mb-6">
              <div className="mb-4">
                <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Zip Code
                </label>
                <div className="flex">
                  <input
                    type="text"
                    id="zipCode"
                    pattern="[0-9]{5}"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    placeholder="Enter zip code"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    className="bg-green-500 text-white px-4 py-2 rounded-r-lg hover:bg-green-600 transition-colors"
                    disabled={loading || !mapLoaded}
                  >
                    Search
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Enter a 5-digit US zip code</p>
              </div>
              
              <div className="mb-4">
                <label htmlFor="searchRadius" className="block text-sm font-medium text-gray-700 mb-1">
                  Search Radius: {searchRadius} miles
                </label>
                <input
                  type="range"
                  id="searchRadius"
                  min="1"
                  max="30"
                  value={searchRadius}
                  onChange={(e) => setSearchRadius(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>1 mile</span>
                  <span>15 miles</span>
                  <span>30 miles</span>
                </div>
              </div>
              
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={getUserLocation}
                  className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  disabled={loading || !mapLoaded}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Use My Location
                </button>
              </div>
            </form>
          </div>
          
          {/* Results list */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              {loading ? 'Searching for stores...' : `Found ${stores.length} Stores`}
            </h2>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
              </div>
            ) : stores.length > 0 ? (
              <div className="max-h-[600px] overflow-y-auto pr-2">
                {Object.entries(getStoreGroups()).map(([color, groupStores]) => (
                  groupStores.length > 0 && (
                    <div key={color} className="mb-6">
                      <h3 className={`text-sm font-medium px-3 py-1 rounded-full inline-block mb-3 ${getColorClass(color)}`}>
                        {getColorLabel(color)}
                      </h3>
                      
                      <div className="space-y-4">
                        {groupStores.map(store => (
                          <div 
                            key={store.id}
                            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow group cursor-pointer"
                            onClick={() => {
                              map.setCenter(store.location);
                              map.setZoom(16);
                              
                              // Open the info window for this store
                              const infoWindow = new window.google.maps.InfoWindow({
                                content: `
                                  <div class="p-2">
                                    <h3 class="font-bold">${store.name}</h3>
                                    <p>${store.address}</p>
                                    <p>${store.distance} miles away</p>
                                    <p>Rating: ${store.rating ? store.rating + '/5' : 'N/A'}</p>
                                  </div>
                                `
                              });
                              
                              infoWindow.open(map, store.marker);
                            }}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-gray-800 group-hover:text-green-600 transition-colors">
                                  {store.name}
                                </h4>
                                <p className="text-sm text-gray-600 mt-1">{store.address}</p>
                                <div className="flex items-center mt-2">
                                  <span className="text-xs font-medium bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                                    {store.distance} miles
                                  </span>
                                  {store.rating && (
                                    <span className="text-xs font-medium bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full ml-2">
                                      ★ {store.rating}
                                    </span>
                                  )}
                                  {store.open !== undefined && (
                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ml-2 ${
                                      store.open 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-red-100 text-red-800'
                                    }`}>
                                      {store.open ? 'Open' : 'Closed'}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <button 
                                className="text-gray-400 hover:text-green-500 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Open in Google Maps
                                  window.open(
                                    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                      store.name + ' ' + store.address
                                    )}&query_place_id=${store.id}`,
                                    '_blank'
                                  );
                                }}
                              >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No stores found. Try adjusting your search radius or location.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreLocator; 