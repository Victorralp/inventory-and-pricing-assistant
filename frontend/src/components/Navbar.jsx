import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiHome, FiList, FiDollarSign, FiUser, FiLogOut, FiBarChart2 } from 'react-icons/fi';
import useAuthStore from '../store/authStore';
import { logoutUser } from '../services/authService';
import toast from 'react-hot-toast';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user, isPremium, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutUser();
      logout();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <FiHome className="text-green-600 text-2xl" />
              <span className="text-xl font-bold text-gray-800">
                Nigeria <span className="text-green-600">Property</span> Hub
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-gray-700 hover:text-green-600 transition-colors"
            >
              Home
            </Link>
            <Link
              to="/properties"
              className="text-gray-700 hover:text-green-600 transition-colors"
            >
              Properties
            </Link>
            <Link
              to="/mortgage"
              className="text-gray-700 hover:text-green-600 transition-colors"
            >
              Mortgage
            </Link>
            {isPremium && (
              <Link
                to="/analytics"
                className="text-gray-700 hover:text-green-600 transition-colors flex items-center"
              >
                <FiBarChart2 className="mr-1" />
                Analytics
              </Link>
            )}
            <Link
              to="/contact"
              className="text-gray-700 hover:text-green-600 transition-colors"
            >
              Contact
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/dashboard"
                  className="flex items-center text-gray-700 hover:text-green-600 transition-colors"
                >
                  <FiUser className="mr-1" />
                  {user?.displayName || 'Dashboard'}
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center text-red-600 hover:text-red-700 transition-colors"
                >
                  <FiLogOut className="mr-1" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-green-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-green-600"
            >
              {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className="block px-3 py-2 text-gray-700 hover:bg-green-50 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/properties"
              className="block px-3 py-2 text-gray-700 hover:bg-green-50 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              Properties
            </Link>
            <Link
              to="/mortgage"
              className="block px-3 py-2 text-gray-700 hover:bg-green-50 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              Mortgage
            </Link>
            {isPremium && (
              <Link
                to="/analytics"
                className="block px-3 py-2 text-gray-700 hover:bg-green-50 rounded-md"
                onClick={() => setIsOpen(false)}
              >
                Analytics
              </Link>
            )}
            <Link
              to="/contact"
              className="block px-3 py-2 text-gray-700 hover:bg-green-50 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              Contact
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="block px-3 py-2 text-gray-700 hover:bg-green-50 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 text-gray-700 hover:bg-green-50 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 bg-green-600 text-white rounded-md text-center"
                  onClick={() => setIsOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
