import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { TrendingUp, ShoppingBag, Users, DollarSign, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';

interface Stats {
    totalOrders: number;
    totalRevenue: number;
    totalUsers: number;
    activeProducts: number;
}

const AdminDashboard = () => {
    const [stats, setStats] = useState<Stats>({
        totalOrders: 0,
        totalRevenue: 0,
        totalUsers: 0,
        activeProducts: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const [orders, products, profiles] = await Promise.all([
                supabase.from('orders').select('total_amount', { count: 'exact' }),
                supabase.from('products').select('id', { count: 'exact' }).eq('is_active', true),
                supabase.from('profiles').select('id', { count: 'exact' })
            ]);

            const revenue = orders.data?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;

            setStats({
                totalOrders: orders.count || 0,
                totalRevenue: revenue,
                totalUsers: profiles.count || 0,
                activeProducts: products.count || 0
            });
        } catch (error) {
            console.error('Error fetching admin stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="h-64 flex items-center justify-center font-black text-indigo-600 animate-pulse">SYNCING ANALYTICS...</div>;

    const cards = [
        { title: 'Total Revenue', value: `$${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50', trend: '+12.5%', isUp: true },
        { title: 'Total Orders', value: stats.totalOrders.toString(), icon: ShoppingBag, color: 'text-indigo-600', bg: 'bg-indigo-50', trend: '+8.2%', isUp: true },
        { title: 'Active Products', value: stats.activeProducts.toString(), icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50', trend: '-2.1%', isUp: false },
        { title: 'Total Customers', value: stats.totalUsers.toString(), icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+5.4%', isUp: true },
    ];

    return (
        <div className="space-y-8 pb-10">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Intelligence Hub</h1>
                    <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest mt-1 italic">Real-time platform performance</p>
                </div>
                <div className="flex bg-gray-100 p-1 rounded-xl">
                    <button className="px-4 py-2 bg-white rounded-lg shadow-sm text-xs font-black uppercase tracking-widest">Global</button>
                    <button className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-widest">Local</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                        <div className="flex justify-between items-start mb-6">
                            <div className={`${card.bg} ${card.color} p-4 rounded-2xl group-hover:scale-110 transition-transform`}>
                                <card.icon size={24} />
                            </div>
                            <div className={`flex items-center space-x-1 ${card.isUp ? 'text-green-600' : 'text-red-500'} text-[10px] font-black`}>
                                {card.isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                <span>{card.trend}</span>
                            </div>
                        </div>
                        <h3 className="text-gray-400 font-bold uppercase text-[10px] tracking-wider mb-1">{card.title}</h3>
                        <p className="text-3xl font-black text-gray-900 tracking-tighter">{card.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity simulation */}
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8">
                    <div className="flex justify-between items-center mb-10">
                        <h2 className="text-xl font-black text-gray-900 flex items-center space-x-3">
                            <Activity className="text-indigo-600" size={24} />
                            <span>System Throughput</span>
                        </h2>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Last 24 Hours</span>
                    </div>
                    <div className="h-64 flex items-end space-x-2">
                        {[40, 70, 45, 90, 65, 85, 30, 60, 95, 55, 75, 50].map((h, i) => (
                            <div key={i} className="flex-1 bg-indigo-50 rounded-t-xl relative group hover:bg-indigo-600 transition-colors" style={{ height: `${h}%` }}>
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded text-[8px] font-black opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    {Math.round(h * 1.5)} TX/s
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 flex justify-between text-[10px] font-black text-gray-300 uppercase tracking-tighter">
                        <span>00:00</span>
                        <span>06:00</span>
                        <span>12:00</span>
                        <span>18:00</span>
                        <span>23:59</span>
                    </div>
                </div>

                <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                    <div className="relative z-10">
                        <h2 className="text-xl font-black mb-2 uppercase tracking-tight">Platform Growth</h2>
                        <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-8">Quarterly Forecast</p>

                        <div className="space-y-6">
                            {[
                                { l: 'Direct', v: 65, c: 'bg-indigo-500' },
                                { l: 'Referral', v: 25, c: 'bg-blue-400' },
                                { l: 'Organic', v: 10, c: 'bg-indigo-300' }
                            ].map((item, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                        <span>{item.l}</span>
                                        <span>{item.v}%</span>
                                    </div>
                                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                        <div className={`h-full ${item.c} rounded-full`} style={{ width: `${item.v}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button className="mt-10 w-full bg-white text-gray-900 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-50 transition-all active:scale-95">
                            Generate Report
                        </button>
                    </div>
                    <DollarSign className="absolute -bottom-10 -left-10 text-white/5 group-hover:scale-125 transition-transform duration-1000" size={240} />
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;
