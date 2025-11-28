import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  FiMapPin,
  FiBed,
  FiBath,
  FiMaximize,
  FiHeart,
  FiMail,
  FiPhone,
  FiArrowLeft,
} from 'react-icons/fi';
import { getPropertyById, calculateAIRentPrediction } from '../services/propertyService';
import { sendPropertyInquiryEmail } from '../services/emailService';
import usePropertyStore from '../store/propertyStore';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [inquiryData, setInquiryData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const { favorites, addFavorite, removeFavorite } = usePropertyStore();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    loadProperty();
  }, [id]);

  const loadProperty = async () => {
    setLoading(true);
    try {
      const data = await getPropertyById(id);
      setProperty(data);
    } catch (error) {
      console.error('Error loading property:', error);
      toast.error('Failed to load property details');
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = () => {
    if (!isAuthenticated) {
      toast.error('Please login to save favorites');
      return;
    }

    if (favorites.includes(id)) {
      removeFavorite(id);
      toast.success('Removed from favorites');
    } else {
      addFavorite(id);
      toast.success('Added to favorites');
    }
  };

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    try {
      await sendPropertyInquiryEmail({
        ...inquiryData,
        propertyId: id,
        propertyTitle: property.title,
      });
      toast.success('Inquiry sent successfully!');
      setShowInquiryForm(false);
      setInquiryData({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      toast.error('Failed to send inquiry');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Property Not Found
          </h2>
          <button
            onClick={() => navigate('/properties')}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            Back to Listings
          </button>
        </div>
      </div>
    );
  }

  const aiPrediction = calculateAIRentPrediction(property);
  const isFavorite = favorites.includes(id);
  const images = property.images || ['https://via.placeholder.com/800x600'];

  return (
    <>
      <Helmet>
        <title>{property.title} - Nigeria Property Hub</title>
        <meta name="description" content={property.description} />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-green-600 mb-6"
          >
            <FiArrowLeft className="mr-2" />
            Back to Listings
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-lg shadow-lg overflow-hidden"
              >
                <img
                  src={images[selectedImage]}
                  alt={property.title}
                  className="w-full h-96 object-cover"
                />
                <div className="flex gap-2 p-4 overflow-x-auto">
                  {images.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt={`View ${index + 1}`}
                      onClick={() => setSelectedImage(index)}
                      className={`w-20 h-20 object-cover rounded cursor-pointer ${
                        selectedImage === index
                          ? 'ring-2 ring-green-600'
                          : 'opacity-60'
                      }`}
                    />
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-lg p-6 mt-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {property.title}
                    </h1>
                    <p className="text-gray-600 flex items-center">
                      <FiMapPin className="mr-2" />
                      {property.location}
                    </p>
                  </div>
                  <button
                    onClick={toggleFavorite}
                    className={`p-3 rounded-full ${
                      isFavorite
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                    } hover:scale-110 transition-transform`}
                  >
                    <FiHeart fill={isFavorite ? 'currentColor' : 'none'} size={24} />
                  </button>
                </div>

                <div className="flex items-center gap-6 text-gray-700 mb-6">
                  {property.bedrooms && (
                    <span className="flex items-center text-lg">
                      <FiBed className="mr-2" />
                      {property.bedrooms} Bedrooms
                    </span>
                  )}
                  {property.bathrooms && (
                    <span className="flex items-center text-lg">
                      <FiBath className="mr-2" />
                      {property.bathrooms} Bathrooms
                    </span>
                  )}
                  {property.size && (
                    <span className="flex items-center text-lg">
                      <FiMaximize className="mr-2" />
                      {property.size} sqm
                    </span>
                  )}
                </div>

                <div className="border-t pt-6 mb-6">
                  <h2 className="text-xl font-semibold mb-4">Description</h2>
                  <p className="text-gray-700 leading-relaxed">
                    {property.description || 'No description available.'}
                  </p>
                </div>

                <div className="border-t pt-6">
                  <h2 className="text-xl font-semibold mb-4">Features</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {property.features?.map((feature, index) => (
                      <div key={index} className="flex items-center text-gray-700">
                        <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                        {feature}
                      </div>
                    )) || <p className="text-gray-600">No features listed</p>}
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-lg shadow-lg p-6 sticky top-24"
              >
                <div className="mb-6">
                  <p className="text-gray-600 mb-2">Price</p>
                  <p className="text-4xl font-bold text-gray-900">
                    ₦{property.price?.toLocaleString()}
                  </p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    AI Fair Rent Prediction
                  </h3>
                  <p className="text-2xl font-bold text-green-600 mb-1">
                    ₦{aiPrediction.monthlyRent.toLocaleString()}/month
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    ₦{aiPrediction.yearlyRent.toLocaleString()}/year
                  </p>
                  <p className="text-xs text-gray-500">
                    {(aiPrediction.confidence * 100).toFixed(0)}% confidence based
                    on location, size, and market data
                  </p>
                </div>

                {!showInquiryForm ? (
                  <div className="space-y-3">
                    <button
                      onClick={() => setShowInquiryForm(true)}
                      className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                    >
                      <FiMail className="mr-2" />
                      Send Inquiry
                    </button>
                    <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
                      <FiPhone className="mr-2" />
                      Call Agent
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleInquirySubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        required
                        value={inquiryData.name}
                        onChange={(e) =>
                          setInquiryData({ ...inquiryData, name: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        required
                        value={inquiryData.email}
                        onChange={(e) =>
                          setInquiryData({ ...inquiryData, email: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        required
                        value={inquiryData.phone}
                        onChange={(e) =>
                          setInquiryData({ ...inquiryData, phone: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Message
                      </label>
                      <textarea
                        required
                        rows="4"
                        value={inquiryData.message}
                        onChange={(e) =>
                          setInquiryData({ ...inquiryData, message: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Send
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowInquiryForm(false)}
                        className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PropertyDetails;
