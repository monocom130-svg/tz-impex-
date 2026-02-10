import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Product, Category } from '../../types/database';
import { Link } from 'react-router-dom';
import { ChevronRight, ArrowRight, Zap, ShieldCheck, Truck, RefreshCw, ShoppingCart } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const Home = () => {
    const [flashSaleProducts, setFlashSaleProducts] = useState<Product[]>([]);
    const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();

    const [timeLeft, setTimeLeft] = useState({
        hours: 24,
        minutes: 0,
        seconds: 0
    });

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                let { hours, minutes, seconds } = prev;
                if (seconds > 0) {
                    seconds--;
                } else if (minutes > 0) {
                    minutes--;
                    seconds = 59;
                } else if (hours > 0) {
                    hours--;
                    minutes = 59;
                    seconds = 59;
                }
                return { hours, minutes, seconds };
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const { data: catData } = await supabase.from('categories').select('*').limit(6);
                const { data: flashData } = await supabase.from('products').select('*').eq('is_flash_sale', true).eq('is_active', true).limit(4);
                const { data: trendData } = await supabase.from('products').select('*').eq('is_active', true).order('created_at', { ascending: false }).limit(8);

                if (catData) setCategories(catData);
                if (flashData) setFlashSaleProducts(flashData);
                if (trendData) setTrendingProducts(trendData);
            } catch (error) {
                console.error('Error fetching home data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="space-y-12 pb-16">
            {/* Hero Section */}
            <section className="relative bg-indigo-900 h-[500px] overflow-hidden">
                <div className="absolute inset-0 opacity-40">
                    <img
                        src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=2070"
                        alt="Hero background"
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="relative max-w-7xl mx-auto px-4 h-full flex items-center">
                    <div className="max-w-xl text-white space-y-6">
                        <span className="bg-indigo-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">New Season</span>
                        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
                            Elevate Your <span className="text-indigo-400">Lifestyle</span> With T-Z IMPEX
                        </h1>
                        <p className="text-lg text-indigo-100">
                            Discover our curated collection of premium products. From electronics to fashion, we bring the world to your doorstep.
                        </p>
                        <div className="flex space-x-4">
                            <Link to="/products" className="bg-white text-indigo-900 px-8 py-3 rounded-full font-bold hover:bg-indigo-50 transition-all flex items-center">
                                Shop Now <ArrowRight className="ml-2" size={20} />
                            </Link>
                            <Link to="/products" className="border-2 border-white/30 text-white px-8 py-3 rounded-full font-bold hover:bg-white/10 transition-all">
                                View Categories
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Bar */}
            <section className="max-w-7xl mx-auto px-4 -mt-16 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex items-center space-x-4">
                        <div className="bg-green-50 p-3 rounded-full text-green-600"><Truck size={24} /></div>
                        <div><h4 className="font-bold text-gray-900 text-sm">Free Delivery</h4><p className="text-gray-500 text-xs">Orders over $50</p></div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex items-center space-x-4">
                        <div className="bg-blue-50 p-3 rounded-full text-blue-600"><ShieldCheck size={24} /></div>
                        <div><h4 className="font-bold text-gray-900 text-sm">Secure Payment</h4><p className="text-gray-500 text-xs">100% Protected</p></div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex items-center space-x-4">
                        <div className="bg-purple-50 p-3 rounded-full text-purple-600"><RefreshCw size={24} /></div>
                        <div><h4 className="font-bold text-gray-900 text-sm">Easy Returns</h4><p className="text-gray-500 text-xs">30 Days Guarantee</p></div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex items-center space-x-4">
                        <div className="bg-yellow-50 p-3 rounded-full text-yellow-600"><Zap size={24} /></div>
                        <div><h4 className="font-bold text-gray-900 text-sm">24/7 Support</h4><p className="text-gray-500 text-xs">Dedicated Team</p></div>
                    </div>
                </div>
            </section>

            {/* Categories Highlights */}
            <section className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Shop by Category</h2>
                        <p className="text-gray-500 mt-2">Explore our wide range of categories</p>
                    </div>
                    <Link to="/products" className="text-indigo-600 font-bold hover:underline flex items-center">
                        View All <ChevronRight size={20} />
                    </Link>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
                    {categories.map((cat) => (
                        <Link key={cat.id} to={`/products?category=${cat.id}`} className="group text-center">
                            <div className="aspect-square bg-white rounded-2xl p-6 shadow-sm border border-gray-100 group-hover:shadow-md group-hover:border-indigo-100 transition-all flex items-center justify-center mb-3">
                                <span className="text-gray-900 font-bold group-hover:text-indigo-600 transition-colors uppercase tracking-tight text-xs">{cat.name}</span>
                            </div>
                        </Link>
                    ))}
                    {categories.length === 0 && !loading && [1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="aspect-square bg-gray-100 animate-pulse rounded-2xl"></div>
                    ))}
                </div>
            </section>

            {/* Flash Sale Section */}
            {flashSaleProducts.length > 0 && (
                <section className="max-w-7xl mx-auto px-4">
                    <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-3xl p-8 md:p-12 text-white">
                        <div className="flex flex-col md:flex-row items-center justify-between mb-8">
                            <div className="space-y-4 text-center md:text-left">
                                <div className="flex items-center justify-center md:justify-start space-x-2">
                                    <Zap className="fill-yellow-400 text-yellow-400" size={24} />
                                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">Flash Sale</h2>
                                </div>
                                <div className="flex justify-center md:justify-start space-x-4 font-mono text-2xl font-bold">
                                    <div className="bg-white/20 px-3 py-1 rounded w-16 text-center">{String(timeLeft.hours).padStart(2, '0')}<span className="text-[10px] block font-sans">HRS</span></div>
                                    <div className="bg-white/20 px-3 py-1 rounded w-16 text-center">{String(timeLeft.minutes).padStart(2, '0')}<span className="text-[10px] block font-sans">MIN</span></div>
                                    <div className="bg-white/20 px-3 py-1 rounded w-16 text-center">{String(timeLeft.seconds).padStart(2, '0')}<span className="text-[10px] block font-sans">SEC</span></div>
                                </div>
                            </div>
                            <Link to="/products" className="mt-8 md:mt-0 bg-white text-red-600 px-10 py-4 rounded-full font-black hover:shadow-xl transition-all uppercase tracking-widest text-sm">
                                View Full Sale
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {flashSaleProducts.map(product => (
                                <div key={product.id} className="bg-white rounded-2xl p-4 group relative">
                                    <div className="absolute top-2 left-2 z-10 bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded-lg">
                                        -{Math.round(((product.price - (product.flash_sale_price || 0)) / product.price) * 100)}%
                                    </div>
                                    <div className="aspect-square rounded-xl overflow-hidden bg-gray-50 mb-4">
                                        <img src={product.images?.[0] || 'https://via.placeholder.com/150'} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    </div>
                                    <h3 className="text-gray-900 font-bold text-xs truncate mb-2">{product.name}</h3>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-red-600 font-black text-lg">${product.flash_sale_price}</span>
                                        <span className="text-gray-400 line-through text-xs font-medium">${product.price}</span>
                                    </div>
                                    <button
                                        onClick={() => addToCart(product)}
                                        className="mt-3 w-full bg-gray-900 text-white py-2 rounded-lg text-xs font-bold hover:bg-black transition-colors"
                                    >
                                        Add to Cart
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Trending Products */}
            <section className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Trending Now</h2>
                        <p className="text-gray-500 mt-2">Check out this week's most popular items</p>
                    </div>
                    <Link to="/products" className="text-indigo-600 font-bold hover:underline flex items-center">
                        View Shop <ChevronRight size={20} />
                    </Link>
                </div>
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="bg-gray-100 animate-pulse h-64 rounded-2xl"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {trendingProducts.map((product) => (
                            <Link to={`/products/${product.id}`} key={product.id} className="group">
                                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 group-hover:shadow-lg transition-all">
                                    <div className="aspect-square rounded-xl overflow-hidden bg-gray-50 mb-4 relative">
                                        {product.is_flash_sale && (
                                            <div className="absolute top-2 left-2 z-10 bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase">Sale</div>
                                        )}
                                        {product.images?.[0] ? (
                                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300">No Image</div>
                                        )}
                                    </div>
                                    <h3 className="text-gray-900 font-bold text-sm truncate">{product.name}</h3>
                                    <div className="mt-2 flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-indigo-600 font-extrabold">${product.is_flash_sale ? product.flash_sale_price : product.price}</span>
                                            {product.is_flash_sale && <span className="text-[10px] text-gray-400 line-through">${product.price}</span>}
                                        </div>
                                        <button
                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(product); }}
                                            className="bg-indigo-50 p-2 rounded-lg text-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors"
                                        >
                                            <ShoppingCart size={16} />
                                        </button>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default Home;
