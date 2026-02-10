import { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import type { Address, Coupon } from '../../types/database';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, MapPin, Tag, CheckCircle2 } from 'lucide-react';

const Checkout = () => {
    const { items, total, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [deliveryMethod, setDeliveryMethod] = useState('standard');

    // Coupon state
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
    const [couponError, setCouponError] = useState('');
    const [couponSuccess, setCouponSuccess] = useState('');
    const [discountAmount, setDiscountAmount] = useState(0);

    useEffect(() => {
        if (!user) {
            navigate('/login?redirect=checkout');
            return;
        }
        if (items.length === 0) {
            navigate('/cart');
            return;
        }
        fetchAddresses();
    }, [user, items]);

    useEffect(() => {
        if (appliedCoupon) {
            calculateDiscount(appliedCoupon);
        } else {
            setDiscountAmount(0);
        }
    }, [total, appliedCoupon]);

    const fetchAddresses = async () => {
        const { data } = await supabase.from('addresses').select('*').eq('user_id', user!.id);
        if (data) {
            setAddresses(data);
            const defaultAddr = data.find((a: Address) => a.is_default);
            if (defaultAddr) setSelectedAddress(defaultAddr.id);
            else if (data.length > 0) setSelectedAddress(data[0].id);
        }
    };

    const calculateDiscount = (coupon: Coupon) => {
        let discount = 0;
        if (coupon.discount_type === 'percentage') {
            discount = (total * coupon.discount_value) / 100;
            if (coupon.max_discount_amount && discount > coupon.max_discount_amount) {
                discount = coupon.max_discount_amount;
            }
        } else {
            discount = coupon.discount_value;
        }
        setDiscountAmount(discount);
    };

    const handleApplyCoupon = async (e: React.FormEvent) => {
        e.preventDefault();
        setCouponError('');
        setCouponSuccess('');

        try {
            const { data, error } = await supabase
                .from('coupons')
                .select('*')
                .eq('code', couponCode.toUpperCase())
                .eq('is_active', true)
                .single();

            if (error || !data) {
                setCouponError('Invalid coupon code');
                return;
            }

            const coupon = data as Coupon;
            const now = new Date().toISOString();

            if (coupon.start_date > now) {
                setCouponError('Coupon is not yet active');
                return;
            }

            if (coupon.end_date && coupon.end_date < now) {
                setCouponError('Coupon has expired');
                return;
            }

            if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
                setCouponError('Coupon usage limit reached');
                return;
            }

            if (total < coupon.min_purchase_amount) {
                setCouponError(`Minimum purchase of $${coupon.min_purchase_amount} required`);
                return;
            }

            setAppliedCoupon(coupon);
            setCouponSuccess(`Coupon applied!`);
        } catch (error) {
            setCouponError('Error applying coupon');
        }
    };

    const handlePlaceOrder = async () => {
        if (!selectedAddress) {
            alert('Please select a shipping address.');
            return;
        }

        setLoading(true);
        try {
            const shippingCost = deliveryMethod === 'express' ? 100 : 50;
            const finalTotal = total + shippingCost - discountAmount;

            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert([{
                    user_id: user!.id,
                    shipping_address_id: selectedAddress,
                    total_amount: finalTotal,
                    status: 'pending',
                    delivery_method: deliveryMethod,
                    coupon_id: appliedCoupon?.id || null,
                    discount_amount: discountAmount
                }])
                .select()
                .single();

            if (orderError) throw orderError;

            const orderItems = items.map(item => ({
                order_id: order.id,
                product_id: item.id,
                quantity: item.quantity,
                price_at_purchase: item.price
            }));

            const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
            if (itemsError) throw itemsError;

            // Increment coupon usage if applied
            if (appliedCoupon) {
                await supabase
                    .from('coupons')
                    .update({ used_count: (appliedCoupon.used_count || 0) + 1 })
                    .eq('id', appliedCoupon.id);
            }

            // Award loyalty points (1 point per $10 spent)
            const pointsToAward = Math.floor(finalTotal / 10);
            if (pointsToAward > 0) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('loyalty_points')
                    .eq('id', user!.id)
                    .single();

                await supabase
                    .from('profiles')
                    .update({ loyalty_points: (profile?.loyalty_points || 0) + pointsToAward })
                    .eq('id', user!.id);
            }

            clearCart();
            alert('Order placed successfully!');
            navigate('/profile');
        } catch (error) {
            console.error('Error placing order:', error);
            alert('Failed to place order.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-8 font-serif leading-tight">Secure Checkout</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left side: Shipping and method */}
                <div className="lg:col-span-2 space-y-8">
                    <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center space-x-2 mb-6">
                            <MapPin className="text-indigo-600" size={24} />
                            <h2 className="text-xl font-bold text-gray-900">Shipping Address</h2>
                        </div>

                        {addresses.length === 0 ? (
                            <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 text-yellow-800 text-sm">
                                No addresses found. Please add one in your <a href="/profile" className="font-bold underline">Profile</a>.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {addresses.map(addr => (
                                    <div
                                        key={addr.id}
                                        onClick={() => setSelectedAddress(addr.id)}
                                        className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${selectedAddress === addr.id ? 'border-indigo-600 bg-indigo-50/50' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-bold text-gray-900">{addr.full_name}</p>
                                                <p className="text-sm text-gray-500 mt-1">{addr.address_line1}, {addr.city}</p>
                                                <p className="text-sm text-gray-500">{addr.state}, {addr.postal_code}</p>
                                            </div>
                                            {selectedAddress === addr.id && <CheckCircle2 className="text-indigo-600" size={20} />}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center space-x-2 mb-6">
                            <ShoppingBag className="text-indigo-600" size={24} />
                            <h2 className="text-xl font-bold text-gray-900">Delivery Method</h2>
                        </div>
                        <div className="space-y-4">
                            <label className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${deliveryMethod === 'standard' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-100'}`}>
                                <div className="flex items-center space-x-3">
                                    <input type="radio" checked={deliveryMethod === 'standard'} onChange={() => setDeliveryMethod('standard')} className="text-indigo-600 focus:ring-indigo-500" />
                                    <div>
                                        <p className="font-bold text-gray-900">Standard Delivery</p>
                                        <p className="text-sm text-gray-500">3-5 business days</p>
                                    </div>
                                </div>
                                <span className="font-bold text-gray-900">$50.00</span>
                            </label>
                            <label className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${deliveryMethod === 'express' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-100'}`}>
                                <div className="flex items-center space-x-3">
                                    <input type="radio" checked={deliveryMethod === 'express'} onChange={() => setDeliveryMethod('express')} className="text-indigo-600 focus:ring-indigo-500" />
                                    <div>
                                        <p className="font-bold text-gray-900">Express Delivery</p>
                                        <p className="text-sm text-gray-500">1-2 business days</p>
                                    </div>
                                </div>
                                <span className="font-bold text-gray-900">$100.00</span>
                            </label>
                        </div>
                    </section>
                </div>

                {/* Right side: Summary */}
                <div className="space-y-6">
                    <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center space-x-2 mb-6">
                            <Tag className="text-indigo-600" size={24} />
                            <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>
                        </div>

                        <div className="space-y-4 mb-6">
                            {items.map(item => (
                                <div key={item.id} className="flex justify-between text-sm">
                                    <span className="text-gray-600 font-medium truncate max-w-[150px]">{item.name} x {item.quantity}</span>
                                    <span className="text-gray-900 font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-3 py-4 border-y border-gray-100 mb-6">
                            <div className="flex justify-between text-sm text-gray-500">
                                <span>Subtotal</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-500">
                                <span>Shipping</span>
                                <span>${(deliveryMethod === 'express' ? 100 : 50).toFixed(2)}</span>
                            </div>
                            {discountAmount > 0 && (
                                <div className="flex justify-between text-sm text-green-600 font-bold">
                                    <span>Discount ({appliedCoupon?.code})</span>
                                    <span>-${discountAmount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-xl font-black text-gray-900 pt-2">
                                <span>Total</span>
                                <span>${(total + (deliveryMethod === 'express' ? 100 : 50) - discountAmount).toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Promo Code Input */}
                        <div className="mb-6">
                            {!appliedCoupon ? (
                                <>
                                    <div className="flex space-x-2">
                                        <input
                                            type="text"
                                            placeholder="Promo code"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value)}
                                            className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none uppercase font-bold"
                                        />
                                        <button
                                            onClick={handleApplyCoupon}
                                            disabled={!couponCode}
                                            className="bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-black disabled:bg-gray-200 transition-colors"
                                        >
                                            Apply
                                        </button>
                                    </div>
                                    {couponError && <p className="text-red-500 text-[10px] mt-1 font-bold">{couponError}</p>}
                                    {couponSuccess && <p className="text-green-600 text-[10px] mt-1 font-bold">{couponSuccess}</p>}
                                </>
                            ) : (
                                <div className="bg-green-50 border border-green-100 p-3 rounded-xl flex items-center justify-between">
                                    <div>
                                        <p className="text-green-700 font-bold text-xs">Coupon Applied!</p>
                                        <p className="text-green-600 text-[10px]">{appliedCoupon.code}</p>
                                    </div>
                                    <button onClick={() => { setAppliedCoupon(null); setCouponCode(''); setCouponSuccess(''); }} className="text-green-700 hover:text-green-800 font-bold text-xs uppercase">Remove</button>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handlePlaceOrder}
                            disabled={loading || !selectedAddress}
                            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-200 transition-all disabled:bg-gray-200 disabled:shadow-none"
                        >
                            {loading ? 'Processing...' : 'Place Order'}
                        </button>
                        <p className="text-center text-gray-400 text-[10px] mt-4 font-medium uppercase tracking-widest">Secure Cash on Delivery Only</p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
