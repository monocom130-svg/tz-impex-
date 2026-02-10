import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import type { Profile, Address } from '../../types/database';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, Package, Clock, LogOut, ChevronRight, Plus, Tag, Award } from 'lucide-react';

interface Order {
    id: string;
    created_at: string;
    total_amount: number;
    status: string;
}

const UserProfile = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddAddress, setShowAddAddress] = useState(false);
    const [newAddress, setNewAddress] = useState({
        full_name: '',
        phone: '',
        address_line1: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'Bangladesh'
    });

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        setLoading(true);
        try {
            await Promise.all([getProfile(), getAddresses(), getOrders()]);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getProfile = async () => {
        const { data } = await supabase.from('profiles').select('*').eq('id', user!.id).single();
        if (data) setProfile(data);
    };

    const getAddresses = async () => {
        const { data } = await supabase.from('addresses').select('*').eq('user_id', user!.id).order('is_default', { ascending: false });
        if (data) setAddresses(data);
    };

    const getOrders = async () => {
        const { data } = await supabase.from('orders').select('*').eq('user_id', user!.id).order('created_at', { ascending: false });
        if (data) setOrders(data);
    };

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    }



    const handleAddAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { error } = await supabase.from('addresses').insert([{
                ...newAddress,
                user_id: user!.id,
                is_default: addresses.length === 0
            }]);

            if (error) throw error;

            setShowAddAddress(false);
            setNewAddress({ full_name: '', phone: '', address_line1: '', city: '', state: '', postal_code: '', country: 'Bangladesh' });
            getAddresses();
            alert('Address added successfully!');
        } catch (error) {
            console.error('Error adding address:', error);
            alert('Failed to add address.');
        }
    };

    if (loading) return <div className="p-8">Loading profile...</div>;

    return (
        <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-10">
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">My Universe</h1>
                <button onClick={handleSignOut} className="flex items-center space-x-2 text-red-600 hover:text-red-800 font-bold uppercase text-xs tracking-widest border-2 border-red-50 px-4 py-2 rounded-xl hover:bg-red-50 transition-all">
                    <LogOut size={16} />
                    <span>Sign Out</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Overview */}
                <div className="space-y-6">
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col items-center text-center">
                        <div className="w-24 h-24 bg-indigo-600 rounded-3xl rotate-3 flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-indigo-100 mb-6">
                            <span className="-rotate-3">{profile?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}</span>
                        </div>
                        <h2 className="text-2xl font-black text-gray-900">{profile?.full_name || 'Premium Member'}</h2>
                        <p className="text-gray-500 font-medium">{user?.email}</p>
                    </div>

                    {/* Loyalty Points Card */}
                    <div className="bg-gradient-to-br from-indigo-700 to-purple-800 rounded-3xl p-8 text-white shadow-xl shadow-indigo-100 relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="flex items-center space-x-2 mb-2">
                                <Award className="text-yellow-400" size={20} />
                                <p className="text-indigo-100 text-[10px] font-black uppercase tracking-[0.2em]">Loyalty Balance</p>
                            </div>
                            <h3 className="text-5xl font-black tracking-tighter">{profile?.loyalty_points || 0} <span className="text-lg font-bold text-indigo-200">PTS</span></h3>

                            <div className="mt-8 space-y-4">
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] font-bold uppercase text-indigo-200">Silver Tier</span>
                                    <span className="text-[10px] font-bold uppercase text-indigo-100">Next: Gold (100 pts)</span>
                                </div>
                                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full transition-all duration-1000"
                                        style={{ width: `${Math.min(((profile?.loyalty_points || 0) / 100) * 100, 100)}%` }}
                                    ></div>
                                </div>
                                <p className="text-[9px] text-center text-indigo-200 font-medium italic">"Earn 1 point for every $10 spent"</p>
                            </div>
                        </div>
                        <Tag className="absolute -bottom-6 -right-6 text-white/5 group-hover:scale-110 transition-transform duration-700" size={160} />
                    </div>
                </div>

                {/* Right Column: Dynamic Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Orders Section */}
                    <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                            <h2 className="text-xl font-black text-gray-900 flex items-center space-x-2">
                                <Package className="text-indigo-600" size={24} />
                                <span>Recent Orders</span>
                            </h2>
                            <Link to="/" className="text-indigo-600 font-bold text-xs uppercase tracking-widest hover:underline">Shop More</Link>
                        </div>
                        <div className="p-0">
                            {orders.length === 0 ? (
                                <div className="p-12 text-center">
                                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <Clock className="text-gray-300" size={32} />
                                    </div>
                                    <p className="text-gray-400 font-medium">No orders yet.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-50">
                                    {orders.map(order => (
                                        <div key={order.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-gray-50/50 transition-colors">
                                            <div className="space-y-1">
                                                <p className="font-black text-gray-900 uppercase text-xs tracking-wider">Order #{order.id.slice(0, 8)}</p>
                                                <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                                            </div>
                                            <div className="mt-4 md:mt-0 flex items-center space-x-8">
                                                <div className="text-right">
                                                    <p className="text-sm font-black text-indigo-600">${order.total_amount.toFixed(2)}</p>
                                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                                        order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                                <ChevronRight className="text-gray-300" size={20} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Address Section */}
                    <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-black text-gray-900 flex items-center space-x-2">
                                <MapPin className="text-indigo-600" size={24} />
                                <span>Shipping Vault</span>
                            </h2>
                            <button
                                onClick={() => setShowAddAddress(!showAddAddress)}
                                className="bg-gray-50 text-gray-900 p-2 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                            >
                                <Plus size={20} />
                            </button>
                        </div>

                        {showAddAddress && (
                            <form onSubmit={handleAddAddress} className="mb-8 p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100 animate-in zoom-in-95 duration-200">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input required placeholder="Full Name" value={newAddress.full_name} onChange={e => setNewAddress({ ...newAddress, full_name: e.target.value })} className="bg-white border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                                    <input required placeholder="Phone" value={newAddress.phone} onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })} className="bg-white border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                                    <input required placeholder="Address Line" value={newAddress.address_line1} onChange={e => setNewAddress({ ...newAddress, address_line1: e.target.value })} className="bg-white border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none md:col-span-2" />
                                    <input required placeholder="City" value={newAddress.city} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} className="bg-white border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                                    <input required placeholder="State" value={newAddress.state} onChange={e => setNewAddress({ ...newAddress, state: e.target.value })} className="bg-white border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                                </div>
                                <div className="mt-4 flex justify-end space-x-3">
                                    <button type="button" onClick={() => setShowAddAddress(false)} className="text-gray-500 font-bold text-xs uppercase px-4 py-2 hover:bg-gray-100 rounded-xl">Cancel</button>
                                    <button type="submit" className="bg-indigo-600 text-white font-black text-xs uppercase tracking-widest px-6 py-2 rounded-xl shadow-lg shadow-indigo-100">Save Securely</button>
                                </div>
                            </form>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {addresses.map(addr => (
                                <div key={addr.id} className="p-6 rounded-2xl border border-gray-100 bg-gray-50/30 flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-gray-900">{addr.full_name}</p>
                                        <p className="text-[10px] text-gray-500 font-medium uppercase mt-1">{addr.address_line1}, {addr.city}</p>
                                    </div>
                                    {addr.is_default && <span className="text-[8px] font-black uppercase tracking-widest bg-indigo-600 text-white px-2 py-0.5 rounded-lg">Default</span>}
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
