import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { FiTrendingUp, FiDollarSign, FiHome, FiMapPin } from 'react-icons/fi';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('6months');

  const priceTrends = [
    { month: 'Jan', lagos: 45000000, abuja: 35000000, portharcourt: 25000000 },
    { month: 'Feb', lagos: 46500000, abuja: 36000000, portharcourt: 26000000 },
    { month: 'Mar', lagos: 48000000, abuja: 37000000, portharcourt: 26500000 },
    { month: 'Apr', lagos: 49000000, abuja: 38000000, portharcourt: 27000000 },
    { month: 'May', lagos: 50000000, abuja: 39000000, portharcourt: 28000000 },
    { month: 'Jun', lagos: 52000000, abuja: 40000000, portharcourt: 29000000 },
  ];

  const propertyTypes = [
    { name: 'Apartments', value: 45, color: '#10b981' },
    { name: 'Detached', value: 25, color: '#3b82f6' },
    { name: 'Semi-Detached', value: 15, color: '#f59e0b' },
    { name: 'Duplex', value: 10, color: '#ef4444' },
    { name: 'Others', value: 5, color: '#8b5cf6' },
  ];

  const demandData = [
    { location: 'Lekki', demand: 85 },
    { location: 'Victoria Island', demand: 90 },
    { location: 'Ikoyi', demand: 80 },
    { location: 'Yaba', demand: 75 },
    { location: 'Ajah', demand: 70 },
    { location: 'Ikeja', demand: 78 },
  ];

  const stats = [
    {
      icon: <FiTrendingUp className="text-3xl" />,
      label: 'Avg. Price Growth',
      value: '+12.5%',
      change: 'vs last year',
      color: 'green',
    },
    {
      icon: <FiDollarSign className="text-3xl" />,
      label: 'Avg. Property Price',
      value: '₦42.5M',
      change: 'Lagos region',
      color: 'blue',
    },
    {
      icon: <FiHome className="text-3xl" />,
      label: 'Properties Listed',
      value: '12,450',
      change: '+850 this month',
      color: 'yellow',
    },
    {
      icon: <FiMapPin className="text-3xl" />,
      label: 'Top Location',
      value: 'Lekki',
      change: 'Highest demand',
      color: 'purple',
    },
  ];

  return (
    <>
      <Helmet>
        <title>Analytics Dashboard - Nigeria Property Hub</title>
        <meta
          name="description"
          content="Premium analytics and market insights for property investors in Nigeria"
        />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold mb-2">Analytics Dashboard</h1>
            <p className="text-green-100">
              Premium insights and market trends for property investors
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-lg p-6"
              >
                <div
                  className={`inline-block p-3 rounded-lg bg-${stat.color}-100 text-${stat.color}-600 mb-4`}
                >
                  {stat.icon}
                </div>
                <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-500">{stat.change}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Price Trends by Location
                </h2>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                >
                  <option value="3months">Last 3 Months</option>
                  <option value="6months">Last 6 Months</option>
                  <option value="1year">Last Year</option>
                </select>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={priceTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `₦${value.toLocaleString()}`} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="lagos"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Lagos"
                  />
                  <Line
                    type="monotone"
                    dataKey="abuja"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Abuja"
                  />
                  <Line
                    type="monotone"
                    dataKey="portharcourt"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    name="Port Harcourt"
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Property Type Distribution
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={propertyTypes}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {propertyTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-lg p-6 mb-8"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Property Demand by Location
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={demandData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="location" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="demand" fill="#10b981" name="Demand Score" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Market Insights
              </h2>
              <div className="space-y-4">
                <div className="border-l-4 border-green-600 pl-4">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Rising Demand in Lekki
                  </h3>
                  <p className="text-sm text-gray-600">
                    Property prices in Lekki have increased by 15% in the last
                    quarter due to infrastructure development.
                  </p>
                </div>
                <div className="border-l-4 border-blue-600 pl-4">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Affordable Housing Push
                  </h3>
                  <p className="text-sm text-gray-600">
                    Government initiatives are making properties in Abuja suburbs
                    more accessible to middle-income earners.
                  </p>
                </div>
                <div className="border-l-4 border-yellow-600 pl-4">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Mortgage Rate Trends
                  </h3>
                  <p className="text-sm text-gray-600">
                    Average mortgage rates have stabilized at 14.5%, making home
                    ownership more predictable.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Investment Recommendations
              </h2>
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <FiTrendingUp className="text-green-600 text-xl mr-3 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        High Growth Potential
                      </h3>
                      <p className="text-sm text-gray-600">
                        Consider properties in Ajah and Sangotedo areas for
                        long-term appreciation.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <FiHome className="text-blue-600 text-xl mr-3 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        Stable Rental Income
                      </h3>
                      <p className="text-sm text-gray-600">
                        2-3 bedroom apartments in Ikeja offer consistent rental
                        yields of 6-8% annually.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <FiDollarSign className="text-yellow-600 text-xl mr-3 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        Emerging Markets
                      </h3>
                      <p className="text-sm text-gray-600">
                        Epe and Ibeju-Lekki are emerging as affordable investment
                        destinations with high potential.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Analytics;
