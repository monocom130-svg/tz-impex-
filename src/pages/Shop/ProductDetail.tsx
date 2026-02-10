import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Product, Review } from '../../types/database';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Star, ShoppingBag, ShieldCheck, Truck, RotateCcw, MessageSquare, Plus, Zap } from 'lucide-react';

const ProductDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [product, setProduct] = useState<Product | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
    const [submittingReview, setSubmittingReview] = useState(false);

    const { addToCart } = useCart();

    useEffect(() => {
        if (id) {
            fetchProduct(id);
            fetchReviews(id);
        }
    }, [id]);

    const fetchProduct = async (productId: string) => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*, category:categories(name)')
                .eq('id', productId)
                .single();

            if (error) throw error;
            setProduct(data);
            if (data.images && data.images.length > 0) {
                setSelectedImage(data.images[0]);
            }
        } catch (error) {
            console.error('Error fetching product:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchReviews = async (productId: string) => {
        const { data } = await supabase
            .from('reviews')
            .select('*, user:profiles(full_name)')
            .eq('product_id', productId)
            .order('created_at', { ascending: false });
        if (data) setReviews(data as any);
    };

    const handleAddToCart = () => {
        if (product) {
            addToCart(product);
            alert('Added to cart!');
        }
    };

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            alert('Please login to leave a review.');
            return;
        }
        setSubmittingReview(true);
        try {
            const { error } = await supabase
                .from('reviews')
                .insert([{
                    user_id: user.id,
                    product_id: id,
                    rating: newReview.rating,
                    comment: newReview.comment
                }]);
            if (error) throw error;
            setNewReview({ rating: 5, comment: '' });
            fetchReviews(id!);
            alert('Review submitted! Thank you.');
        } catch (error) {
            console.error('Error submitting review:', error);
            alert('Failed to submit review.');
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center">Loading product detail...</div>;
    if (!product) return <div className="p-8 text-center">Product not found.</div>;

    const isOnFlashSale = product.is_flash_sale && product.flash_sale_price && (
        !product.flash_sale_end || new Date(product.flash_sale_end) > new Date()
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col lg:flex-row gap-16">
                {/* Left: Image Gallery */}
                <div className="lg:w-1/2 space-y-6">
                    <div className="aspect-square bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex items-center justify-center relative">
                        {isOnFlashSale && (
                            <div className="absolute top-6 left-6 z-10 bg-red-600 text-white px-4 py-2 rounded-2xl flex items-center space-x-2 font-black shadow-lg">
                                <Zap size={18} className="fill-white" />
                                <span>FLASH SALE</span>
                            </div>
                        )}
                        {selectedImage ? (
                            <img src={selectedImage} alt={product.name} className="w-full h-full object-contain p-8 hover:scale-110 transition-transform duration-500" />
                        ) : (
                            <div className="text-gray-300">No Image Available</div>
                        )}
                    </div>
                    {product.images && product.images.length > 1 && (
                        <div className="grid grid-cols-4 gap-4">
                            {product.images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImage(img)}
                                    className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all ${selectedImage === img ? 'border-indigo-600' : 'border-gray-100 hover:border-gray-200'}`}
                                >
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right: Product Info */}
                <div className="lg:w-1/2 space-y-8">
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2 text-indigo-600 text-xs font-black uppercase tracking-widest">
                            <Link to="/products" className="hover:underline">Shop</Link>
                            <span>/</span>
                            <span>{product.category?.name}</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight">{product.name}</h1>
                        <div className="flex items-center space-x-4">
                            <div className="flex text-yellow-400">
                                {[1, 2, 3, 4, 5].map(i => <Star key={i} size={20} fill={i <= 4 ? "currentColor" : "none"} />)}
                            </div>
                            <span className="text-sm text-gray-400 font-bold underline decoration-dotted underline-offset-4">{reviews.length} Customer Reviews</span>
                        </div>
                    </div>

                    <div className="p-8 bg-gray-50 rounded-3xl space-y-6">
                        <div className="flex items-baseline space-x-4">
                            {isOnFlashSale ? (
                                <>
                                    <span className="text-5xl font-black text-red-600 tracking-tighter">${product.flash_sale_price}</span>
                                    <span className="text-xl text-gray-400 line-through font-medium">${product.price}</span>
                                </>
                            ) : (
                                <span className="text-5xl font-black text-gray-900 tracking-tighter">${product.price}</span>
                            )}
                        </div>

                        <p className="text-gray-600 leading-relaxed font-medium">{product.description}</p>

                        <div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row gap-4">
                            <div className="flex-1 flex items-center space-x-4">
                                <div className="flex-1 h-14 bg-white rounded-2xl border-2 border-gray-100 flex items-center justify-around px-4">
                                    <button className="text-2xl font-bold text-gray-300 hover:text-indigo-600 transition-colors">-</button>
                                    <span className="font-black text-gray-900">01</span>
                                    <button className="text-2xl font-bold text-gray-300 hover:text-indigo-600 transition-colors">+</button>
                                </div>
                            </div>
                            <button
                                onClick={handleAddToCart}
                                disabled={product.stock === 0}
                                className="flex-[2] h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center space-x-3 font-black text-lg hover:bg-indigo-700 hover:shadow-2xl shadow-indigo-100 transition-all disabled:bg-gray-200"
                            >
                                <ShoppingBag size={20} />
                                <span>{product.stock === 0 ? 'Out of Stock' : 'Secure Checkout'}</span>
                            </button>
                        </div>
                        {product.stock > 0 && (
                            <p className="text-center text-[10px] uppercase font-black tracking-widest text-green-600">
                                {product.stock} units currently in warehouse
                            </p>
                        )}
                    </div>

                    {/* Trust Badges */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
                        <div className="flex items-start space-x-3">
                            <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600"><ShieldCheck size={20} /></div>
                            <div><p className="text-xs font-black">2 Year Warranty</p><p className="text-[10px] text-gray-400">Official TZ Protection</p></div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <div className="bg-green-50 p-2 rounded-lg text-green-600"><Truck size={20} /></div>
                            <div><p className="text-xs font-black">Express Shipping</p><p className="text-[10px] text-gray-400">Arrives in 48 hours</p></div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <div className="bg-purple-50 p-2 rounded-lg text-purple-600"><RotateCcw size={20} /></div>
                            <div><p className="text-xs font-black">Easy Returns</p><p className="text-[10px] text-gray-400">30-day money back</p></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reviews Section */}
            <div className="mt-24 max-w-4xl mx-auto">
                <div className="flex items-center space-x-4 mb-12">
                    <MessageSquare className="text-indigo-600" size={32} />
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Customer Intelligence</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {/* Write a Review */}
                    <div className="md:col-span-1">
                        <div className="bg-white rounded-3xl p-6 border-2 border-gray-50 shadow-sm sticky top-24">
                            <h3 className="text-lg font-black mb-6 flex items-center space-x-2">
                                <Plus size={18} className="text-indigo-600" />
                                <span>Write a Review</span>
                            </h3>
                            {user ? (
                                <form onSubmit={handleSubmitReview} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-400 italic">Target Rating</label>
                                        <div className="flex text-yellow-400">
                                            {[1, 2, 3, 4, 5].map(i => (
                                                <Star
                                                    key={i}
                                                    size={24}
                                                    className="cursor-pointer hover:scale-125 transition-transform"
                                                    fill={i <= newReview.rating ? "currentColor" : "none"}
                                                    onClick={() => setNewReview({ ...newReview, rating: i })}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-400 italic">Your Message</label>
                                        <textarea
                                            value={newReview.comment}
                                            onChange={e => setNewReview({ ...newReview, comment: e.target.value })}
                                            className="w-full h-32 bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                            placeholder="Tell us your experience..."
                                            required
                                        ></textarea>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={submittingReview}
                                        className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-sm uppercase hover:bg-black transition-all shadow-lg shadow-indigo-100"
                                    >
                                        {submittingReview ? 'Transmitting...' : 'Post Intelligence'}
                                    </button>
                                </form>
                            ) : (
                                <div className="text-center py-6">
                                    <p className="text-gray-400 text-sm mb-4">You must be logged in to leave a review.</p>
                                    <Link to="/login" className="text-indigo-600 font-bold hover:underline">Login Now</Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Review List */}
                    <div className="md:col-span-2 space-y-8">
                        {reviews.length === 0 ? (
                            <div className="text-center py-16 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                                <p className="text-gray-400 font-medium italic">No reviews yet. Be the first to share your experience!</p>
                            </div>
                        ) : (
                            reviews.map(review => (
                                <div key={review.id} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <p className="font-black text-gray-900">{review.user?.full_name || 'Verified User'}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{new Date(review.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <div className="flex text-yellow-400">
                                            {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} fill={i <= review.rating ? "currentColor" : "none"} />)}
                                        </div>
                                    </div>
                                    <p className="text-gray-600 leading-relaxed font-medium italic">"{review.comment}"</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
