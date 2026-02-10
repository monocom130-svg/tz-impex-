import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Package, MapPin, CheckCircle, Truck, Navigation, Clock } from 'lucide-react';

interface Order {
    id: string;
    created_at: string;
    total_amount: number;
    status: string;
    delivery_method: string;
    shipping_address: {
        full_name: string;
        phone: string;
        address_line1: string;
        city: string;
    };
}

const RiderPortal = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchAssignedOrders();
        }
    }, [user]);

    const fetchAssignedOrders = async () => {
        setLoading(true);
        try {
            // For MVP, we'll show all 'pending' or 'processing' orders as "available for pickup"
            // or we could assume a rider_id field exists (not yet in schema, but we can simulate by fetching 'processing' ones)
            const { data, error } = await supabase
                .from('orders')
                .select('*, shipping_address:addresses(*)')
                .in('status', ['processing', 'shipped'])
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data as any);
        } catch (error) {
            console.error('Error fetching rider orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (orderId: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', orderId);

            if (error) throw error;
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
            alert(`Order status updated to ${newStatus}`);
        } catch (error) {
            console.error('Error updating order status:', error);
            alert('Failed to update status');
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center font-black text-indigo-600 animate-pulse">BOOTING RIDER OS...</div>;

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
            <header className="flex justify-between items-center mb-10">
                <div className="flex items-center space-x-3">
                    <div className="bg-indigo-600 p-3 rounded-2xl shadow-xl shadow-indigo-900/40">
                        <Truck size={28} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black italic tracking-tighter">RIDER PORTAL</h1>
                        <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">{user?.email}</p>
                    </div>
                </div>
                <div className="bg-gray-800 px-4 py-2 rounded-xl flex items-center space-x-2 border border-gray-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Online</span>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {orders.length === 0 ? (
                    <div className="col-span-full h-64 flex flex-col items-center justify-center bg-gray-800 rounded-3xl border-2 border-dashed border-gray-700">
                        <Package className="text-gray-600 mb-4" size={48} />
                        <p className="text-gray-500 font-bold uppercase tracking-widest">No Active Routes</p>
                    </div>
                ) : (
                    orders.map(order => (
                        <div key={order.id} className="bg-gray-800 rounded-3xl p-6 border border-gray-700 hover:border-indigo-500 transition-all group overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-4">
                                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${order.status === 'shipped' ? 'bg-indigo-600 text-white' : 'bg-yellow-500 text-black'
                                    }`}>
                                    {order.status}
                                </span>
                            </div>

                            <div className="flex items-center space-x-4 mb-6">
                                <div className="bg-gray-700 p-4 rounded-2xl">
                                    <Package className="text-indigo-400" size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Order ID</p>
                                    <h3 className="font-black text-lg tracking-tight">#{order.id.slice(0, 8)}</h3>
                                </div>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="flex items-start space-x-3">
                                    <MapPin className="text-red-500 mt-1" size={18} />
                                    <div>
                                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Delivery Address</p>
                                        <p className="font-bold text-sm text-gray-300">{order.shipping_address?.full_name}</p>
                                        <p className="text-xs text-gray-400">{order.shipping_address?.address_line1}, {order.shipping_address?.city}</p>
                                        <p className="text-indigo-400 text-xs font-black mt-1">{order.shipping_address?.phone}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Clock className="text-indigo-500" size={18} />
                                    <div>
                                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Est. Delivery</p>
                                        <p className="text-xs font-bold text-gray-300">{order.delivery_method === 'express' ? 'Asap (Priority)' : 'Today'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                {order.status === 'processing' && (
                                    <button
                                        onClick={() => updateStatus(order.id, 'shipped')}
                                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center space-x-2 transition-all active:scale-95"
                                    >
                                        <Navigation size={16} />
                                        <span>Start Route</span>
                                    </button>
                                )}
                                {order.status === 'shipped' && (
                                    <button
                                        onClick={() => updateStatus(order.id, 'delivered')}
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center space-x-2 transition-all active:scale-95 shadow-lg shadow-green-900/20"
                                    >
                                        <CheckCircle size={16} />
                                        <span>Confirm Drop</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default RiderPortal;
