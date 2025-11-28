import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  FiHeart,
  FiFileText,
  FiSettings,
  FiTrendingUp,
  FiMapPin,
} from 'react-icons/fi';
import { getPropertyById } from '../services/propertyService';
import { getUserMortgageApplications } from '../services/mortgageService';
import usePropertyStore from '../store/propertyStore';
import useAuthStore from '../store/authStore';

const UserDashboard = () => {
  const [favoriteProperties, setFavoriteProperties] = useState([]);
  const [applications, setApplications] = useState([]);
  const [activeTab, setActiveTab] = useState('favorites');
  const { favorites } = usePropertyStore();
  const { user, isPremium } = useAuthStore();

  useEffect(() => {
    loadFavorites();
    loadApplications();
  }, [favorites]);

  const loadFavorites = async () => {
    const properties = await Promise.all(
      favorites.map((id) => getPropertyById(id))
    );
    setFavoriteProperties(properties.filter((p) => p !== null));
  };

  const loadApplications = async () => {
    if (user) {
      const apps = await getUserMortgageApplications(user.uid);
      setApplications(apps);
    }
  };

  const tabs = [
    { id: 'favorites', label: 'Favorite Properties', icon: <FiHeart /> },
    { id: 'applications', label: 'Mortgage Applications', icon: <FiFileText /> },
    { id: 'settings', label: 'Settings', icon: <FiSettings /> },
  ];

  return (
    <>
      <Helmet>
        <title>Dashboard - Nigeria Property Hub</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="bg-green-600 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.displayName}!</h1>
            <p className="text-green-100">
              Manage your properties, applications, and preferences
            </p>
            {isPremium && (
              <span className="inline-block mt-4 bg-yellow-500 text-gray-900 px-4 py-2 rounded-full text-sm font-semibold">
                <FiTrendingUp className="inline mr-1" />
                Premium Member
              </span>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-lg mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center px-6 py-4 text-sm font-medium ${
                      activeTab === tab.id
                        ? 'border-b-2 border-green-600 text-green-600'
                        : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'favorites' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Your Favorite Properties
                  </h2>

                  {favoriteProperties.length === 0 ? (
                    <div className="text-center py-12">
                      <FiHeart className="text-6xl text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">
                        You haven't saved any properties yet
                      </p>
                      <Link
                        to="/properties"
                        className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Browse Properties
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {favoriteProperties.map((property) => (
                        <div
                          key={property.id}
                          className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                        >
                          <img
                            src={
                              property.images?.[0] ||
                              'https://via.placeholder.com/400x300'
                            }
                            alt={property.title}
                            className="w-full h-48 object-cover"
                          />
                          <div className="p-4">
                            <h3 className="font-semibold text-gray-900 mb-2">
                              {property.title}
                            </h3>
                            <p className="text-gray-600 text-sm mb-3 flex items-center">
                              <FiMapPin className="mr-1" />
                              {property.location}
                            </p>
                            <div className="flex justify-between items-center">
                              <span className="text-xl font-bold text-green-600">
                                ₦{property.price?.toLocaleString()}
                              </span>
                              <Link
                                to={`/properties/${property.id}`}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                              >
                                View
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'applications' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Your Mortgage Applications
                  </h2>

                  {applications.length === 0 ? (
                    <div className="text-center py-12">
                      <FiFileText className="text-6xl text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">
                        You haven't submitted any mortgage applications yet
                      </p>
                      <Link
                        to="/mortgage"
                        className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Explore Mortgage Options
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {applications.map((app) => (
                        <div
                          key={app.id}
                          className="border border-gray-200 rounded-lg p-6"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-semibold text-gray-900 text-lg">
                                {app.bank}
                              </h3>
                              <p className="text-gray-600 text-sm">
                                Applied on{' '}
                                {new Date(app.createdAt.seconds * 1000).toLocaleDateString()}
                              </p>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                app.status === 'approved'
                                  ? 'bg-green-100 text-green-800'
                                  : app.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Loan Amount:</span>
                              <p className="font-semibold">
                                ₦{app.amount?.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-600">Monthly Income:</span>
                              <p className="font-semibold">
                                ₦{app.monthlyIncome?.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Account Settings
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Profile Information
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Display Name
                          </label>
                          <input
                            type="text"
                            value={user?.displayName || ''}
                            disabled
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                          </label>
                          <input
                            type="email"
                            value={user?.email || ''}
                            disabled
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Subscription
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Current Plan:{' '}
                        <span className="font-semibold">
                          {isPremium ? 'Premium' : 'Free'}
                        </span>
                      </p>
                      {!isPremium && (
                        <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
                          Upgrade to Premium
                        </button>
                      )}
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Notifications
                      </h3>
                      <div className="space-y-3">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            defaultChecked
                            className="mr-3 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                          />
                          <span className="text-gray-700">
                            Email notifications for new properties
                          </span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            defaultChecked
                            className="mr-3 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                          />
                          <span className="text-gray-700">
                            Mortgage application updates
                          </span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            className="mr-3 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                          />
                          <span className="text-gray-700">
                            Weekly market insights (Premium)
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserDashboard;
