import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Coupon } from '../../types/database';
import { Plus, Trash2, Tag, Calendar, CheckCircle, XCircle } from 'lucide-react';

const CouponList = () => {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newCoupon, setNewCoupon] = useState({
        code: '',
        discount_type: 'percentage' as 'percentage' | 'fixed_amount',
        discount_value: 0,
        min_purchase_amount: 0,
        max_discount_amount: null as number | null,
        start_date: new Date().toISOString().split('T')[0],
        end_date: null as string | null,
        usage_limit: null as number | null,
        is_active: true
    });

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('coupons')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            setCoupons(data || []);
        } catch (error) {
            console.error('Error fetching coupons:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCoupon = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { error } = await supabase.from('coupons').insert([newCoupon]);
            if (error) throw error;
            setShowAddForm(false);
            fetchCoupons();
            alert('Coupon created successfully!');
        } catch (error) {
            console.error('Error creating coupon:', error);
            alert('Failed to create coupon.');
        }
    };

    const toggleCouponStatus = async (id: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase
                .from('coupons')
                .update({ is_active: !currentStatus })
                .eq('id', id);
            if (error) throw error;
            fetchCoupons();
        } catch (error) {
            console.error('Error updating coupon:', error);
        }
    };

    const deleteCoupon = async (id: string) => {
        if (!confirm('Are you sure you want to delete this coupon?')) return;
        try {
            const { error } = await supabase.from('coupons').delete().eq('id', id);
            if (error) throw error;
            fetchCoupons();
        } catch (error) {
            console.error('Error deleting coupon:', error);
        }
    };

    if (loading) return <div className="p-8">Loading coupons...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Coupon Management</h1>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-indigo-700 transition-colors"
                >
                    <Plus size={20} />
                    <span>{showAddForm ? 'Cancel' : 'New Coupon'}</span>
                </button>
            </div>

            {showAddForm && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 animate-in fade-in slide-in-from-top-4 duration-200">
                    <h2 className="text-lg font-bold mb-4">Create New Discount Code</h2>
                    <form onSubmit={handleCreateCoupon} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Coupon Code</label>
                            <input
                                required
                                value={newCoupon.code}
                                onChange={e => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                                className="w-full border p-2 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="E.g. SUMMER20"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Discount Type</label>
                            <select
                                value={newCoupon.discount_type}
                                onChange={e => setNewCoupon({ ...newCoupon, discount_type: e.target.value as any })}
                                className="w-full border p-2 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                <option value="percentage">Percentage (%)</option>
                                <option value="fixed_amount">Fixed Amount ($)</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Discount Value</label>
                            <input
                                type="number"
                                required
                                value={newCoupon.discount_value}
                                onChange={e => setNewCoupon({ ...newCoupon, discount_value: Number(e.target.value) })}
                                className="w-full border p-2 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                                min="0"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Min Purchase ($)</label>
                            <input
                                type="number"
                                value={newCoupon.min_purchase_amount}
                                onChange={e => setNewCoupon({ ...newCoupon, min_purchase_amount: Number(e.target.value) })}
                                className="w-full border p-2 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                                min="0"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Max Discount ($)</label>
                            <input
                                type="number"
                                value={newCoupon.max_discount_amount || ''}
                                onChange={e => setNewCoupon({ ...newCoupon, max_discount_amount: e.target.value ? Number(e.target.value) : null })}
                                className="w-full border p-2 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="Unlimited"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">End Date</label>
                            <input
                                type="date"
                                value={newCoupon.end_date || ''}
                                onChange={e => setNewCoupon({ ...newCoupon, end_date: e.target.value || null })}
                                className="w-full border p-2 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <div className="md:col-span-3 flex justify-end pt-2">
                            <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-md font-bold hover:bg-green-700 transition-colors">
                                Save Coupon
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {coupons.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-dashed">
                        No coupons found. Create your first one to start a promotion!
                    </div>
                ) : (
                    coupons.map(coupon => (
                        <div key={coupon.id} className={`bg-white rounded-2xl p-6 shadow-sm border-2 transition-all ${coupon.is_active ? 'border-transparent hover:border-indigo-100 shadow-indigo-50/50' : 'border-gray-100 opacity-75'}`}>
                            <div className="flex justify-between items-start mb-4">
                                <div className="space-y-1">
                                    <div className="flex items-center space-x-2">
                                        <Tag className="text-indigo-600" size={18} />
                                        <span className="text-xl font-black text-gray-900 tracking-tighter">{coupon.code}</span>
                                    </div>
                                    <p className="text-sm text-gray-500 font-medium">
                                        {coupon.discount_type === 'percentage' ? `${coupon.discount_value}% Off` : `$${coupon.discount_value} Off`}
                                    </p>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => toggleCouponStatus(coupon.id, coupon.is_active)}
                                        className={`p-2 rounded-lg transition-colors ${coupon.is_active ? 'text-green-600 bg-green-50 hover:bg-green-100' : 'text-gray-400 bg-gray-50 hover:bg-gray-100'}`}
                                    >
                                        {coupon.is_active ? <CheckCircle size={20} /> : <XCircle size={20} />}
                                    </button>
                                    <button
                                        onClick={() => deleteCoupon(coupon.id)}
                                        className="p-2 text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-50">
                                <div className="space-y-1">
                                    <span className="text-[10px] uppercase font-bold text-gray-400">Min Purchase</span>
                                    <p className="text-sm font-bold text-gray-700">${coupon.min_purchase_amount}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] uppercase font-bold text-gray-400">Status</span>
                                    <p className={`text-sm font-bold ${coupon.is_active ? 'text-green-600' : 'text-red-500'}`}>
                                        {coupon.is_active ? 'Active' : 'Disabled'}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                                <span className="flex items-center space-x-1">
                                    <Calendar size={14} />
                                    <span>Expires: {coupon.end_date ? new Date(coupon.end_date).toLocaleDateString() : 'Never'}</span>
                                </span>
                                <span className="font-bold">Uses: {coupon.used_count || 0}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CouponList;
