import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const ProtectedRoute = ({ children, requirePremium = false }) => {
  const { isAuthenticated, isPremium } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requirePremium && !isPremium) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Premium Feature
          </h2>
          <p className="text-gray-600 mb-6">
            This feature is only available for premium users. Upgrade your
            account to access investor analytics and advanced insights.
          </p>
          <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors">
            Upgrade to Premium
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
