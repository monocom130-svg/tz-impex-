import { Link } from 'react-router-dom';
import { Package, Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-white border-t border-gray-200 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="space-y-4">
                        <Link to="/" className="flex items-center space-x-2">
                            <div className="bg-indigo-600 p-1.5 rounded-lg">
                                <Package className="text-white" size={20} />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                T-Z IMPEX
                            </span>
                        </Link>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            Premium e-commerce platform dedicated to providing the best shopping experience for high-quality products.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-400 hover:text-indigo-600 transition-colors"><Facebook size={20} /></a>
                            <a href="#" className="text-gray-400 hover:text-indigo-600 transition-colors"><Twitter size={20} /></a>
                            <a href="#" className="text-gray-400 hover:text-indigo-600 transition-colors"><Instagram size={20} /></a>
                        </div>
                    </div>

                    {/* Shop */}
                    <div>
                        <h3 className="text-gray-900 font-bold mb-4 uppercase text-xs tracking-wider">Shop</h3>
                        <ul className="space-y-3">
                            <li><Link to="/" className="text-gray-500 hover:text-indigo-600 text-sm">All Products</Link></li>
                            <li><Link to="/cart" className="text-gray-500 hover:text-indigo-600 text-sm">Shopping Cart</Link></li>
                            <li><Link to="/profile" className="text-gray-500 hover:text-indigo-600 text-sm">Track Order</Link></li>
                            <li><Link to="/" className="text-gray-500 hover:text-indigo-600 text-sm">New Arrivals</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="text-gray-900 font-bold mb-4 uppercase text-xs tracking-wider">Support</h3>
                        <ul className="space-y-3">
                            <li><a href="#" className="text-gray-500 hover:text-indigo-600 text-sm">Help Center</a></li>
                            <li><a href="#" className="text-gray-500 hover:text-indigo-600 text-sm">Return Policy</a></li>
                            <li><a href="#" className="text-gray-500 hover:text-indigo-600 text-sm">Shipping Info</a></li>
                            <li><a href="#" className="text-gray-500 hover:text-indigo-600 text-sm">Terms & Conditions</a></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-gray-900 font-bold mb-4 uppercase text-xs tracking-wider">Contact</h3>
                        <ul className="space-y-3">
                            <li className="flex items-center space-x-3 text-gray-500 text-sm">
                                <Mail size={18} className="text-indigo-600" />
                                <span>support@tzimpex.com</span>
                            </li>
                            <li className="flex items-center space-x-3 text-gray-500 text-sm">
                                <Phone size={18} className="text-indigo-600" />
                                <span>+880 1234 567890</span>
                            </li>
                            <li className="flex items-center space-x-3 text-gray-500 text-sm">
                                <MapPin size={18} className="text-indigo-600" />
                                <span>123 Market St, Dhaka, BD</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-gray-400 text-xs text-center">
                    <p>© {new Date().getFullYear()} T-Z IMPEX. All rights reserved.</p>
                    <div className="flex space-x-6">
                        <a href="#" className="hover:text-indigo-600">Privacy Policy</a>
                        <a href="#" className="hover:text-indigo-600">Cookie Policy</a>
                        <a href="#" className="hover:text-indigo-600">Secure Payment</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
