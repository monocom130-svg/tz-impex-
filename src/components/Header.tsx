import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, X, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Header = () => {
    const { user, signOut } = useAuth();
    const { items } = useCart();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <header className="bg-white shadow-sm sticky top-0 z-50">
            {/* Top Bar */}
            <div className="bg-indigo-600 text-white py-2 text-center text-xs font-medium">
                Free Shipping on orders over $50! Use code FLASH20 for 20% off.
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <div className="bg-indigo-600 p-1.5 rounded-lg">
                            <Package className="text-white" size={24} />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            T-Z IMPEX
                        </span>
                    </Link>

                    {/* Search Bar - Desktop */}
                    <div className="hidden md:flex flex-1 max-w-md mx-8">
                        <form onSubmit={handleSearch} className="relative w-full">
                            <input
                                type="text"
                                placeholder="Search for products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            />
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        </form>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-6">
                        <Link to="/" className="text-gray-600 hover:text-indigo-600 font-medium">Shop</Link>

                        <Link to="/cart" className="relative text-gray-600 hover:text-indigo-600 transition-colors">
                            <ShoppingCart size={24} />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-white">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {user ? (
                            <div className="relative group">
                                <button className="flex items-center space-x-1 text-gray-600 hover:text-indigo-600 font-medium transition-colors">
                                    <User size={24} />
                                    <span className="max-w-[100px] truncate">{user.email?.split('@')[0]}</span>
                                </button>
                                <div className="absolute right-0 w-48 mt-2 py-2 bg-white rounded-md shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-2 group-hover:translate-y-0">
                                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600">My Profile</Link>
                                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600">Order History</Link>
                                    <div className="border-t border-gray-100 my-1"></div>
                                    <button onClick={handleSignOut} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Sign Out</button>
                                </div>
                            </div>
                        ) : (
                            <Link to="/login" className="bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700 transition-colors shadow-sm font-medium">
                                Sign In
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center space-x-4">
                        <Link to="/cart" className="relative text-gray-600">
                            <ShoppingCart size={24} />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600">
                            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 py-4 px-4 space-y-4 animate-in slide-in-from-top duration-300">
                    <form onSubmit={handleSearch} className="relative">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full"
                        />
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    </form>
                    <nav className="flex flex-col space-y-3">
                        <Link to="/" onClick={() => setIsMenuOpen(false)} className="text-gray-700 font-medium">Shop</Link>
                        {user ? (
                            <>
                                <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="text-gray-700 font-medium">My Profile</Link>
                                <button onClick={handleSignOut} className="text-left text-red-600 font-medium">Sign Out</button>
                            </>
                        ) : (
                            <Link to="/login" onClick={() => setIsMenuOpen(false)} className="text-indigo-600 font-medium">Sign In</Link>
                        )}
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Header;
