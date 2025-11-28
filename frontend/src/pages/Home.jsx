import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  FiSearch,
  FiHome,
  FiDollarSign,
  FiTrendingUp,
  FiShield,
  FiMapPin,
  FiCpu,
} from 'react-icons/fi';
import { getFeaturedProperties } from '../services/propertyService';
import usePropertyStore from '../store/propertyStore';

const Home = () => {
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { setSearchFilters } = usePropertyStore();

  useEffect(() => {
    loadFeaturedProperties();
  }, []);

  const loadFeaturedProperties = async () => {
    try {
      const properties = await getFeaturedProperties(6);
      setFeaturedProperties(properties);
    } catch (error) {
      console.error('Error loading featured properties:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchFilters({ location: searchQuery });
    navigate('/properties');
  };

  const features = [
    {
      icon: <FiCpu className="text-4xl text-green-600" />,
      title: 'AI-Powered Rent Prediction',
      description:
        'Get accurate fair rent predictions using advanced AI algorithms tailored for the Nigerian market.',
    },
    {
      icon: <FiHome className="text-4xl text-green-600" />,
      title: 'Affordable Housing Options',
      description:
        'Access thousands of affordable properties across Nigeria, addressing the housing deficit.',
    },
    {
      icon: <FiDollarSign className="text-4xl text-green-600" />,
      title: 'Mortgage Matching Tool',
      description:
        'Connect with the right mortgage products from Nigerian banks based on your profile.',
    },
    {
      icon: <FiTrendingUp className="text-4xl text-green-600" />,
      title: 'Market Analytics',
      description:
        'Premium investors get data-driven insights and market trends for informed decisions.',
    },
    {
      icon: <FiShield className="text-4xl text-green-600" />,
      title: 'Secure Transactions',
      description:
        'Safe and verified property listings with secure payment options.',
    },
    {
      icon: <FiMapPin className="text-4xl text-green-600" />,
      title: 'Nationwide Coverage',
      description:
        'Properties available across all states in Nigeria, from Lagos to Abuja and beyond.',
    },
  ];

  return (
    <>
      <Helmet>
        <title>
          Nigeria Property Hub - AI-Powered Property & Mortgage Marketplace
        </title>
        <meta
          name="description"
          content="Find affordable housing and mortgage solutions in Nigeria. AI-powered rent predictions, mortgage matching, and comprehensive property listings nationwide."
        />
        <meta
          name="keywords"
          content="Nigeria property, real estate Nigeria, affordable housing Nigeria, mortgage Nigeria, rent prediction, property investment Nigeria"
        />
      </Helmet>

      <div className="bg-gradient-to-br from-green-50 to-blue-50">
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
        >
          <div className="text-center mb-12">
            <motion.h1
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              className="text-4xl md:text-6xl font-bold text-gray-900 mb-6"
            >
              Find Your Dream Home in{' '}
              <span className="text-green-600">Nigeria</span>
            </motion.h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Addressing Nigeria's housing deficit with AI-powered property
              listings, fair rent predictions, and personalized mortgage
              solutions.
            </p>

            <motion.form
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              onSubmit={handleSearch}
              className="max-w-3xl mx-auto"
            >
              <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-lg shadow-lg">
                <div className="flex-grow flex items-center">
                  <FiMapPin className="text-gray-400 mr-3 ml-2" />
                  <input
                    type="text"
                    placeholder="Enter location (e.g., Lekki, Abuja, Port Harcourt)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full outline-none text-gray-700"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <FiSearch className="mr-2" />
                  Search Properties
                </button>
              </div>
            </motion.form>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <span className="text-gray-600">Popular:</span>
              {['Lagos', 'Abuja', 'Port Harcourt', 'Ibadan', 'Kano'].map(
                (city) => (
                  <button
                    key={city}
                    onClick={() => {
                      setSearchQuery(city);
                      setSearchFilters({ location: city });
                      navigate('/properties');
                    }}
                    className="text-green-600 hover:underline"
                  >
                    {city}
                  </button>
                )
              )}
            </div>
          </div>
        </motion.section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose Nigeria Property Hub?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Featured Properties
            </h2>
            <Link
              to="/properties"
              className="text-green-600 hover:text-green-700 font-semibold"
            >
              View All →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProperties.map((property) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <img
                  src={property.images?.[0] || 'https://via.placeholder.com/400x300'}
                  alt={property.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {property.title}
                  </h3>
                  <p className="text-gray-600 mb-4 flex items-center">
                    <FiMapPin className="mr-1" />
                    {property.location}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-green-600">
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
            ))}
          </div>
        </section>

        <section className="bg-green-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Find Your Dream Property?
            </h2>
            <p className="text-xl mb-8">
              Join thousands of Nigerians who have found their perfect home
              through our platform.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Link
                to="/properties"
                className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Browse Properties
              </Link>
              <Link
                to="/mortgage"
                className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors"
              >
                Explore Mortgage Options
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;
