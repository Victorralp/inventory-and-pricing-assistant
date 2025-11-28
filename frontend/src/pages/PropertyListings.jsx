import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  FiMapPin,
  FiHeart,
  FiFilter,
  FiX,
  FiHome,
  FiBed,
  FiBath,
} from 'react-icons/fi';
import { getProperties, calculateAIRentPrediction } from '../services/propertyService';
import usePropertyStore from '../store/propertyStore';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const PropertyListings = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const { searchFilters, setSearchFilters, favorites, addFavorite, removeFavorite } =
    usePropertyStore();
  const { isAuthenticated } = useAuthStore();

  const [localFilters, setLocalFilters] = useState(searchFilters);

  useEffect(() => {
    loadProperties();
  }, [searchFilters]);

  const loadProperties = async () => {
    setLoading(true);
    try {
      const data = await getProperties(searchFilters);
      setProperties(data);
    } catch (error) {
      console.error('Error loading properties:', error);
      toast.error('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setLocalFilters({ ...localFilters, [key]: value });
  };

  const applyFilters = () => {
    setSearchFilters(localFilters);
    setShowFilters(false);
  };

  const clearFilters = () => {
    const clearedFilters = {
      location: '',
      priceMin: 0,
      priceMax: 100000000,
      propertyType: '',
      bedrooms: '',
    };
    setLocalFilters(clearedFilters);
    setSearchFilters(clearedFilters);
  };

  const toggleFavorite = (propertyId) => {
    if (!isAuthenticated) {
      toast.error('Please login to save favorites');
      return;
    }

    if (favorites.includes(propertyId)) {
      removeFavorite(propertyId);
      toast.success('Removed from favorites');
    } else {
      addFavorite(propertyId);
      toast.success('Added to favorites');
    }
  };

  const propertyTypes = ['apartment', 'detached', 'semi-detached', 'duplex', 'bungalow'];
  const bedroomOptions = ['1', '2', '3', '4', '5+'];

  return (
    <>
      <Helmet>
        <title>Property Listings - Nigeria Property Hub</title>
        <meta
          name="description"
          content="Browse affordable property listings across Nigeria with AI-powered rent predictions. Find your perfect home today."
        />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="bg-green-600 text-white py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Property Listings
            </h1>
            <p className="text-green-100">
              Find your perfect home from thousands of verified listings
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600">
              {properties.length} properties found
            </p>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FiFilter className="mr-2" />
              Filters
            </button>
          </div>

          {showFilters && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-lg shadow-lg mb-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Filter Properties</h3>
                <button onClick={() => setShowFilters(false)}>
                  <FiX className="text-gray-500 hover:text-gray-700" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={localFilters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    placeholder="e.g., Lagos, Abuja"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Type
                  </label>
                  <select
                    value={localFilters.propertyType}
                    onChange={(e) =>
                      handleFilterChange('propertyType', e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  >
                    <option value="">All Types</option>
                    {propertyTypes.map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bedrooms
                  </label>
                  <select
                    value={localFilters.bedrooms}
                    onChange={(e) =>
                      handleFilterChange('bedrooms', e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  >
                    <option value="">Any</option>
                    {bedroomOptions.map((bed) => (
                      <option key={bed} value={bed}>
                        {bed} Bedroom{bed !== '1' ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range (₦)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={localFilters.priceMin}
                      onChange={(e) =>
                        handleFilterChange('priceMin', parseInt(e.target.value))
                      }
                      placeholder="Min"
                      className="w-1/2 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    />
                    <input
                      type="number"
                      value={localFilters.priceMax}
                      onChange={(e) =>
                        handleFilterChange('priceMax', parseInt(e.target.value))
                      }
                      placeholder="Max"
                      className="w-1/2 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={applyFilters}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Apply Filters
                </button>
                <button
                  onClick={clearFilters}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Clear All
                </button>
              </div>
            </motion.div>
          )}

          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading properties...</p>
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-20">
              <FiHome className="text-6xl text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No properties found
              </h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your filters or search in a different location
              </p>
              <button
                onClick={clearFilters}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => {
                const aiPrediction = calculateAIRentPrediction(property);
                const isFavorite = favorites.includes(property.id);

                return (
                  <motion.div
                    key={property.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                  >
                    <div className="relative">
                      <img
                        src={
                          property.images?.[0] ||
                          'https://via.placeholder.com/400x300'
                        }
                        alt={property.title}
                        className="w-full h-48 object-cover"
                      />
                      <button
                        onClick={() => toggleFavorite(property.id)}
                        className={`absolute top-3 right-3 p-2 rounded-full ${
                          isFavorite
                            ? 'bg-red-500 text-white'
                            : 'bg-white text-gray-600'
                        } hover:scale-110 transition-transform`}
                      >
                        <FiHeart fill={isFavorite ? 'currentColor' : 'none'} />
                      </button>
                      {property.featured && (
                        <span className="absolute top-3 left-3 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          Featured
                        </span>
                      )}
                    </div>

                    <div className="p-5">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {property.title}
                      </h3>
                      <p className="text-gray-600 mb-3 flex items-center">
                        <FiMapPin className="mr-1" />
                        {property.location}
                      </p>

                      <div className="flex items-center gap-4 mb-3 text-gray-600">
                        {property.bedrooms && (
                          <span className="flex items-center">
                            <FiBed className="mr-1" />
                            {property.bedrooms} Bed
                          </span>
                        )}
                        {property.bathrooms && (
                          <span className="flex items-center">
                            <FiBath className="mr-1" />
                            {property.bathrooms} Bath
                          </span>
                        )}
                      </div>

                      <div className="border-t pt-3 mb-3">
                        <p className="text-sm text-gray-600 mb-1">
                          AI Fair Rent Prediction
                        </p>
                        <p className="text-lg font-semibold text-green-600">
                          ₦{aiPrediction.monthlyRent.toLocaleString()}/month
                        </p>
                        <p className="text-xs text-gray-500">
                          {(aiPrediction.confidence * 100).toFixed(0)}% confidence
                        </p>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-gray-900">
                          ₦{property.price?.toLocaleString()}
                        </span>
                        <Link
                          to={`/properties/${property.id}`}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PropertyListings;
