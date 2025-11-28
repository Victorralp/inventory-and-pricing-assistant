import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  FiDollarSign,
  FiPercent,
  FiCalendar,
  FiCheckCircle,
  FiAlertCircle,
} from 'react-icons/fi';
import {
  calculateMortgage,
  matchMortgage,
  getNigerianMortgageBanks,
  applyForMortgage,
} from '../services/mortgageService';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const MortgageServices = () => {
  const [mortgageData, setMortgageData] = useState({
    principal: 10000000,
    interestRate: 15,
    years: 20,
  });
  const [calculation, setCalculation] = useState(null);
  const [userProfile, setUserProfile] = useState({
    monthlyIncome: 500000,
    creditScore: 650,
    employmentType: 'formal',
    downPayment: 2000000,
  });
  const [matchedProducts, setMatchedProducts] = useState([]);
  const [showMatcher, setShowMatcher] = useState(false);
  const [banks] = useState(getNigerianMortgageBanks());
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    handleCalculate();
  }, []);

  const handleCalculate = () => {
    const result = calculateMortgage(
      mortgageData.principal,
      mortgageData.interestRate,
      mortgageData.years
    );
    setCalculation(result);
  };

  const handleMatch = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to use the mortgage matcher');
      return;
    }

    const matches = await matchMortgage(userProfile);
    setMatchedProducts(matches);
    setShowMatcher(true);
  };

  const handleApply = async (bank) => {
    if (!isAuthenticated) {
      toast.error('Please login to apply for a mortgage');
      return;
    }

    try {
      await applyForMortgage({
        userId: user.uid,
        bank: bank.name,
        amount: mortgageData.principal,
        ...userProfile,
      });
      toast.success('Mortgage application submitted successfully!');
    } catch (error) {
      toast.error('Failed to submit application');
    }
  };

  return (
    <>
      <Helmet>
        <title>Mortgage Services - Nigeria Property Hub</title>
        <meta
          name="description"
          content="Find the best mortgage options in Nigeria. Calculate monthly payments and match with the right mortgage products from Nigerian banks."
        />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="bg-green-600 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold mb-4">Mortgage Services</h1>
            <p className="text-xl text-green-100">
              Find affordable mortgage solutions tailored to the Nigerian market
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-lg shadow-lg p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Mortgage Calculator
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loan Amount (₦)
                  </label>
                  <div className="relative">
                    <FiDollarSign className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="number"
                      value={mortgageData.principal}
                      onChange={(e) =>
                        setMortgageData({
                          ...mortgageData,
                          principal: parseInt(e.target.value),
                        })
                      }
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Interest Rate (%)
                  </label>
                  <div className="relative">
                    <FiPercent className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="number"
                      step="0.1"
                      value={mortgageData.interestRate}
                      onChange={(e) =>
                        setMortgageData({
                          ...mortgageData,
                          interestRate: parseFloat(e.target.value),
                        })
                      }
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loan Term (Years)
                  </label>
                  <div className="relative">
                    <FiCalendar className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="number"
                      value={mortgageData.years}
                      onChange={(e) =>
                        setMortgageData({
                          ...mortgageData,
                          years: parseInt(e.target.value),
                        })
                      }
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    />
                  </div>
                </div>

                <button
                  onClick={handleCalculate}
                  className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                >
                  Calculate
                </button>
              </div>

              {calculation && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Calculation Results
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Monthly Payment:</span>
                      <span className="font-bold text-gray-900">
                        ₦{calculation.monthlyPayment.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Total Payment:</span>
                      <span className="font-bold text-gray-900">
                        ₦{calculation.totalPayment.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Total Interest:</span>
                      <span className="font-bold text-red-600">
                        ₦{calculation.totalInterest.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-lg shadow-lg p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Mortgage Matching Tool
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Income (₦)
                  </label>
                  <input
                    type="number"
                    value={userProfile.monthlyIncome}
                    onChange={(e) =>
                      setUserProfile({
                        ...userProfile,
                        monthlyIncome: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Credit Score (300-850)
                  </label>
                  <input
                    type="number"
                    value={userProfile.creditScore}
                    onChange={(e) =>
                      setUserProfile({
                        ...userProfile,
                        creditScore: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employment Type
                  </label>
                  <select
                    value={userProfile.employmentType}
                    onChange={(e) =>
                      setUserProfile({
                        ...userProfile,
                        employmentType: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  >
                    <option value="formal">Formal Employment</option>
                    <option value="self-employed">Self-Employed</option>
                    <option value="business">Business Owner</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Down Payment (₦)
                  </label>
                  <input
                    type="number"
                    value={userProfile.downPayment}
                    onChange={(e) =>
                      setUserProfile({
                        ...userProfile,
                        downPayment: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  />
                </div>

                <button
                  onClick={handleMatch}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  Find Matching Mortgages
                </button>
              </div>

              {showMatcher && matchedProducts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FiCheckCircle className="text-green-600 mr-2" />
                    {matchedProducts.length} Matches Found
                  </h3>
                  <div className="space-y-3">
                    {matchedProducts.slice(0, 3).map((product, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {product.bank}
                            </p>
                            <p className="text-sm text-gray-600">
                              Rate: {product.rate}%
                            </p>
                          </div>
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            {product.matchScore}% Match
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Nigerian Mortgage Banks
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {banks.map((bank, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  <h3 className="font-semibold text-gray-900 mb-3">
                    {bank.name}
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">Interest Rate:</span>{' '}
                      {bank.interestRate}%
                    </p>
                    <p>
                      <span className="font-medium">Max Tenure:</span>{' '}
                      {bank.maxTenure} years
                    </p>
                    <p>
                      <span className="font-medium">Min Down Payment:</span>{' '}
                      {bank.minDownPayment}%
                    </p>
                  </div>
                  <button
                    onClick={() => handleApply(bank)}
                    className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    Apply Now
                  </button>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-8">
            <div className="flex items-start">
              <FiAlertCircle className="text-blue-600 text-2xl mr-4 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Important Information
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li>
                    • NMRC and FMBN offer the lowest interest rates for
                    qualifying Nigerian citizens
                  </li>
                  <li>
                    • Most banks require a minimum of 10-30% down payment
                  </li>
                  <li>
                    • Your monthly mortgage payment should not exceed 30% of your
                    gross income
                  </li>
                  <li>
                    • Mortgage approval depends on credit history, employment
                    status, and income verification
                  </li>
                  <li>
                    • Processing time typically ranges from 4-12 weeks
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MortgageServices;
