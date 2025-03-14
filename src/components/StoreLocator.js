import React, { useState, useEffect, useCallback } from 'react';

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

  // Load Google Maps API
  useEffect(() => {
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps && window.google.maps.places && window.google.maps.geometry) {
      console.log('Google Maps API already loaded');
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
        console.log('Loading Google Maps API...');
        // Create script element
        const googleMapScript = document.createElement('script');
        
        // Use the actual API key, not a placeholder
        const apiKey = 'AIzaSyDT8UDmVh5ra1cRv07sfAWlTkfUnPD_w3I';
        
        googleMapScript.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&callback=initGoogleMapsCallback`;
        googleMapScript.async = true;
        googleMapScript.defer = true;
        
        // Define a global callback function that will be called when the API is loaded
        window.initGoogleMapsCallback = () => {
          console.log('Google Maps API loaded successfully');
          setMapLoaded(true);
          setMapError(false);
        };
        
        // Add event listeners for success and failure
        googleMapScript.addEventListener('load', () => {
          console.log('Script loaded event fired');
        });
        
        googleMapScript.addEventListener('error', (e) => {
          console.error('Failed to load Google Maps API', e);
          setMapError(true);
          setError('Failed to load Google Maps. Please check your internet connection and try again.');
          setLoading(false);
          
          // Try to reload the API if it fails (up to 3 attempts)
          if (apiLoadAttempts < 2) {
            setTimeout(() => {
              setApiLoadAttempts(prev => prev + 1);
              loadGoogleMapsAPI();
            }, 2000);
          }
        });
        
        // Append script to body
        document.body.appendChild(googleMapScript);
      } catch (err) {
        console.error('Error setting up Google Maps:', err);
        setMapError(true);
        setError('Failed to set up Google Maps. Please try again later.');
        setLoading(false);
      }
    };
    
    loadGoogleMapsAPI();
    
    // Cleanup function
    return () => {
      // Remove the callback function
      if (window.initGoogleMapsCallback) {
        delete window.initGoogleMapsCallback;
      }
      
      // Remove any Google Maps scripts
      const scripts = document.querySelectorAll('script[src*="maps.googleapis.com/maps/api/js"]');
      scripts.forEach(script => {
        if (script && script.parentNode) {
          script.parentNode.removeChild(script);
        }
      });
    };
  }, [apiLoadAttempts]);

  // Initialize map once API is loaded
  useEffect(() => {
    if (mapLoaded && !mapError) {
      console.log('Initializing map...');
      initializeMap();
    }
  }, [mapLoaded, mapError]);
  
  // Get user location after map is initialized
  useEffect(() => {
    if (map && mapLoaded && !mapError) {
      console.log('Getting user location...');
      getUserLocation();
    }
  }, [map, mapLoaded, mapError, getUserLocation]);

  // Update map when user location changes
  useEffect(() => {
    if (userLocation && map && !mapError) {
      console.log('User location updated, centering map...');
      map.setCenter(userLocation);
      findNearbyGroceryStores();
    }
  }, [userLocation, map, mapError, findNearbyGroceryStores]); // Added findNearbyGroceryStores as dependency

  const initializeMap = () => {
    try {
      console.log('Setting up map...');
      const mapOptions = {
        zoom: 12,
        center: { lat: 37.7749, lng: -122.4194 }, // Default to San Francisco
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
        zoomControl: true,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      };
      
      const mapElement = document.getElementById('map');
      if (!mapElement) {
        console.error('Map element not found');
        setError('Could not initialize the map. Please refresh the page.');
        setLoading(false);
        return;
      }
      
      const newMap = new window.google.maps.Map(mapElement, mapOptions);
      console.log('Map created successfully');
      setMap(newMap);
    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Failed to load the map. Please try again later.');
      setLoading(false);
    }
  };

  const handleZipCodeSearch = (e) => {
    e.preventDefault();
    
    if (!zipCode.trim() || !/^\d{5}(-\d{4})?$/.test(zipCode)) {
      setError('Please enter a valid 5-digit zip code.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: zipCode + ', USA' }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const location = {
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng()
          };
          setUserLocation(location);
        } else {
          setError('Could not find that zip code. Please try again.');
          setLoading(false);
        }
      });
    } catch (err) {
      console.error('Error in zip code search:', err);
      setError('An error occurred while searching for the zip code. Please try again.');
      setLoading(false);
    }
  };

  // Group stores by color based on distance
  const getStoreGroups = () => {
    if (!stores.length) return [];
    
    // Group stores by color
    const groups = [];
    
    // Less than 1 mile
    const lessThan1 = stores.filter(store => parseFloat(store.distance) <= 1);
    if (lessThan1.length > 0) {
      groups.push({ color: 'green', stores: lessThan1 });
    }
    
    // 1-3 miles
    const oneToThree = stores.filter(store => 
      parseFloat(store.distance) > 1 && parseFloat(store.distance) <= 3
    );
    if (oneToThree.length > 0) {
      groups.push({ color: 'blue', stores: oneToThree });
    }
    
    // 3-5 miles
    const threeToFive = stores.filter(store => 
      parseFloat(store.distance) > 3 && parseFloat(store.distance) <= 5
    );
    if (threeToFive.length > 0) {
      groups.push({ color: 'purple', stores: threeToFive });
    }
    
    // 5-10 miles
    const fiveToTen = stores.filter(store => 
      parseFloat(store.distance) > 5 && parseFloat(store.distance) <= 10
    );
    if (fiveToTen.length > 0) {
      groups.push({ color: 'orange', stores: fiveToTen });
    }
    
    // More than 10 miles
    const moreThanTen = stores.filter(store => parseFloat(store.distance) > 10);
    if (moreThanTen.length > 0) {
      groups.push({ color: 'red', stores: moreThanTen });
    }
    
    return groups;
  };

  const getColorClass = (color) => {
    switch (color) {
      case 'green': return 'bg-green-100 border-green-500 text-green-800';
      case 'blue': return 'bg-blue-100 border-blue-500 text-blue-800';
      case 'purple': return 'bg-purple-100 border-purple-500 text-purple-800';
      case 'orange': return 'bg-orange-100 border-orange-500 text-orange-800';
      case 'red': return 'bg-red-100 border-red-500 text-red-800';
      default: return 'bg-gray-100 border-gray-500 text-gray-800';
    }
  };

  const getColorLabel = (color) => {
    switch (color) {
      case 'green': return 'Less than 1 mile';
      case 'blue': return '1-3 miles';
      case 'purple': return '3-5 miles';
      case 'orange': return '5-10 miles';
      case 'red': return 'More than 10 miles';
      default: return '';
    }
  };

  if (mapError) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg text-center">
          <h2 className="text-xl font-bold mb-2">Google Maps Error</h2>
          <p className="mb-4">We couldn't load the Google Maps service properly. This might be due to:</p>
          <ul className="list-disc text-left inline-block mb-4">
            <li>An issue with the API key</li>
            <li>Network connectivity problems</li>
            <li>Temporary service disruption</li>
          </ul>
          <p>Please try again later or contact support if the problem persists.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Grocery Store Locator</h1>
        <p className="text-gray-600">Find grocery stores near you within a 10-mile radius</p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/3">
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <form onSubmit={handleZipCodeSearch} className="mb-4">
              <div className="mb-4">
                <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Search by Zip Code
                </label>
                <div className="flex">
                  <input
                    type="text"
                    id="zipCode"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    placeholder="Enter a zip code"
                    pattern="^\d{5}(-\d{4})?$"
                    maxLength="10"
                    className="flex-grow px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-500 text-white rounded-r-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                    disabled={loading}
                  >
                    {loading ? 'Searching...' : 'Search'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Example: 94103</p>
              </div>
              
              <div className="mb-4">
                <label htmlFor="radius" className="block text-sm font-medium text-gray-700 mb-1">
                  Search Radius: {searchRadius} miles
                </label>
                <input
                  type="range"
                  id="radius"
                  min="1"
                  max="10"
                  value={searchRadius}
                  onChange={(e) => setSearchRadius(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              
              <button
                type="button"
                onClick={getUserLocation}
                className="w-full px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center justify-center"
                disabled={loading}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Use My Current Location
              </button>
            </form>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            
            <div className="mb-4">
              <h3 className="font-semibold text-gray-800 mb-2">Distance Legend</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-sm">Less than 1 mile</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
                  <span className="text-sm">1-3 miles</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-purple-500 mr-2"></div>
                  <span className="text-sm">3-5 miles</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-orange-500 mr-2"></div>
                  <span className="text-sm">5-10 miles</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
                  <span className="text-sm">More than 10 miles</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-lg">Nearby Grocery Stores</h2>
            </div>
            
            {loading ? (
              <div className="p-6 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
              </div>
            ) : stores.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                {error ? error : 'No grocery stores found nearby. Try increasing the search radius or searching a different location.'}
              </div>
            ) : (
              <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                {getStoreGroups().map((group, groupIndex) => (
                  <div key={groupIndex} className={`border-l-4 ${getColorClass(group.color)}`}>
                    <div className={`px-4 py-2 font-medium ${getColorClass(group.color)}`}>
                      {getColorLabel(group.color)}
                    </div>
                    {group.stores.map(store => (
                      <div 
                        key={store.id} 
                        className="p-4 hover:bg-gray-50 cursor-pointer"
                        onClick={() => {
                          if (map && store.location) {
                            map.setCenter(store.location);
                            map.setZoom(15);
                            if (store.marker) {
                              window.google.maps.event.trigger(store.marker, 'click');
                            }
                          }
                        }}
                      >
                        <h3 className="font-semibold text-gray-800">{store.name}</h3>
                        <p className="text-sm text-gray-600">{store.address}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm font-medium text-green-600">{store.distance} miles</span>
                          {store.rating && (
                            <div className="flex items-center">
                              <svg className="w-4 h-4 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <span className="text-sm text-gray-600">{store.rating}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="w-full md:w-2/3">
          <div className="bg-white rounded-lg shadow-md overflow-hidden h-[700px]">
            {!mapLoaded ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading map...</p>
                </div>
              </div>
            ) : (
              <div id="map" className="w-full h-full"></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreLocator; 