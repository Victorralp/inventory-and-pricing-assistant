import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin, FiFacebook, FiTwitter, FiInstagram, FiLinkedin } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">
              Nigeria Property Hub
            </h3>
            <p className="text-sm mb-4">
              Addressing Nigeria's housing deficit with AI-powered property
              listings and mortgage solutions.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-green-500 transition-colors">
                <FiFacebook size={20} />
              </a>
              <a href="#" className="hover:text-green-500 transition-colors">
                <FiTwitter size={20} />
              </a>
              <a href="#" className="hover:text-green-500 transition-colors">
                <FiInstagram size={20} />
              </a>
              <a href="#" className="hover:text-green-500 transition-colors">
                <FiLinkedin size={20} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="hover:text-green-500 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/properties" className="hover:text-green-500 transition-colors">
                  Properties
                </Link>
              </li>
              <li>
                <Link to="/mortgage" className="hover:text-green-500 transition-colors">
                  Mortgage Services
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-green-500 transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-green-500 transition-colors">
                  Buyer's Guide
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-green-500 transition-colors">
                  Renter's Guide
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-green-500 transition-colors">
                  Investment Tips
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-green-500 transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Contact Info</h4>
            <ul className="space-y-3">
              <li className="flex items-start">
                <FiMapPin className="mr-2 mt-1 flex-shrink-0" />
                <span className="text-sm">
                  123 Herbert Macaulay Way, Yaba, Lagos, Nigeria
                </span>
              </li>
              <li className="flex items-center">
                <FiPhone className="mr-2" />
                <span className="text-sm">+234 800 123 4567</span>
              </li>
              <li className="flex items-center">
                <FiMail className="mr-2" />
                <span className="text-sm">info@nigeriapropertyhub.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>
            &copy; {new Date().getFullYear()} Nigeria Property Hub. All rights
            reserved.
          </p>
          <div className="mt-2 space-x-4">
            <a href="#" className="hover:text-green-500 transition-colors">
              Privacy Policy
            </a>
            <span>|</span>
            <a href="#" className="hover:text-green-500 transition-colors">
              Terms of Service
            </a>
            <span>|</span>
            <a href="#" className="hover:text-green-500 transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
