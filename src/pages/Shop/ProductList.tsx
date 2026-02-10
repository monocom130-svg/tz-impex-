import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Product, Category } from '../../types/database';
import { Link, useSearchParams } from 'react-router-dom';
import { Filter, ShoppingCart, Search, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const ProductList = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [searchParams] = useSearchParams();
    const categoryParam = searchParams.get('category');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryParam);
    const searchQuery = searchParams.get('search');
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const { data: catData } = await supabase.from('categories').select('*');
                if (catData) setCategories(catData);

                let query = supabase.from('products').select('*').eq('is_active', true);
                if (selectedCategory) query = query.eq('category_id', selectedCategory);
                if (searchQuery) query = query.ilike('name', `%${searchQuery}%`);

                const { data: prodData, error } = await query;
                if (error) throw error;
                setProducts(prodData || []);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [selectedCategory, searchQuery]);

    useEffect(() => {
        if (categoryParam) setSelectedCategory(categoryParam);
    }, [categoryParam]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col md:flex-row justify-between items-baseline mb-12 gap-4">
                <div>
                    <h1 className="text-5xl font-black text-gray-900 tracking-tight">Gallery</h1>
                    <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest mt-1 italic">Discover the TZ IMPEX collection</p>
                </div>
                {searchQuery && (
                    <div className="flex items-center space-x-3 bg-indigo-50 px-4 py-2 rounded-2xl border border-indigo-100">
                        <Search size={14} className="text-indigo-600" />
                        <span className="text-sm font-bold text-indigo-900">"{searchQuery}"</span>
                        <Link to="/products" className="text-indigo-400 hover:text-indigo-600 transition-colors"><X size={14} /></Link>
                    </div>
                )}
            </div>

            <div className="flex flex-col lg:flex-row gap-12">
                {/* Modern Sidebar */}
                <div className="w-full lg:w-64 flex-shrink-0 space-y-8">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm sticky top-24">
                        <div className="flex items-center space-x-2 mb-8">
                            <Filter size={20} className="text-indigo-600" />
                            <h3 className="text-lg font-black text-gray-900 tracking-tight uppercase text-xs">Philtres</h3>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-4">Architecture</h4>
                                <ul className="space-y-2">
                                    <li>
                                        <button
                                            onClick={() => setSelectedCategory(null)}
                                            className={`w-full text-left px-4 py-2 rounded-xl text-xs font-bold transition-all ${!selectedCategory ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-500 hover:bg-gray-50'}`}
                                        >
                                            All Domains
                                        </button>
                                    </li>
                                    {categories.map(cat => (
                                        <li key={cat.id}>
                                            <button
                                                onClick={() => setSelectedCategory(cat.id)}
                                                className={`w-full text-left px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedCategory === cat.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-500 hover:bg-gray-50'}`}
                                            >
                                                {cat.name}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Infinity Grid */}
                <div className="flex-1">
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="bg-gray-100 animate-pulse h-80 rounded-[2.5rem]"></div>
                            ))}
                        </div>
                    ) : products.length === 0 ? (
                        <div className="h-96 flex flex-col items-center justify-center bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
                            <Search className="text-gray-300 mb-4" size={48} />
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Void Detected: No Items Found</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {products.map(product => {
                                const isOnFlashSale = product.is_flash_sale && product.flash_sale_price;
                                return (
                                    <Link to={`/products/${product.id}`} key={product.id} className="group flex flex-col h-full bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden">
                                        <div className="aspect-[4/5] overflow-hidden bg-gray-50 relative">
                                            {isOnFlashSale && (
                                                <div className="absolute top-4 left-4 z-10 bg-red-600 text-white text-[8px] font-black px-2 py-1 rounded-lg uppercase tracking-widest shadow-lg">Sale</div>
                                            )}
                                            {product.images && product.images[0] ? (
                                                <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-gray-200">No Image</div>
                                            )}
                                            <div className="absolute bottom-4 right-4 translate-y-12 group-hover:translate-y-0 transition-transform duration-300">
                                                <button
                                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(product); }}
                                                    className="bg-white/90 backdrop-blur-sm p-3 rounded-2xl shadow-xl text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all transform active:scale-95"
                                                >
                                                    <ShoppingCart size={20} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="p-8 flex flex-col flex-grow">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-gray-900 font-black text-sm tracking-tight group-hover:text-indigo-600 transition-colors uppercase truncate">{product.name}</h3>
                                            </div>
                                            <div className="mt-auto pt-4 flex items-baseline space-x-2">
                                                <span className="text-2xl font-black text-gray-900 tracking-tighter sm:text-3xl">
                                                    ${isOnFlashSale ? product.flash_sale_price : product.price}
                                                </span>
                                                {isOnFlashSale && (
                                                    <span className="text-xs text-gray-400 line-through font-bold">${product.price}</span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductList;
