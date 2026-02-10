import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useParams } from 'react-router-dom';
import type { Address } from '../../types/database';

interface OrderDetail {
    id: string;
    created_at: string;
    total_amount: number;
    status: string;
    delivery_method: string;
    payment_method: string;
    shipping_address_id: string;
    user: { email: string };
    address?: Address;
}

interface OrderItem {
    id: string;
    quantity: number;
    price_at_purchase: number;
    product: {
        name: string;
        images: string[];
    };
}

const OrderDetail = () => {
    const { id } = useParams();
    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [items, setItems] = useState<OrderItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [address, setAddress] = useState<Address | null>(null);

    useEffect(() => {
        if (id) fetchOrderDetails();
    }, [id]);

    const fetchOrderDetails = async () => {
        try {
            // Fetch Order
            const { data: orderData, error: orderError } = await supabase
                .from('orders')
                .select('*, user:users(email)')
                .eq('id', id!)
                .single();

            if (orderError) throw orderError;
            // @ts-ignore
            setOrder(orderData);

            // Fetch Address
            if (orderData.shipping_address_id) {
                const { data: addrData } = await supabase
                    .from('addresses')
                    .select('*')
                    .eq('id', orderData.shipping_address_id)
                    .single();
                if (addrData) setAddress(addrData);
            }

            // Fetch Items
            const { data: itemsData, error: itemsError } = await supabase
                .from('order_items')
                .select('*, product:products(name, images)')
                .eq('order_id', id!);

            if (itemsError) throw itemsError;
            // @ts-ignore
            setItems(itemsData);

        } catch (error) {
            console.error('Error fetching order details:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (newStatus: string) => {
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', id!);

            if (error) throw error;
            setOrder(prev => prev ? { ...prev, status: newStatus } : null);
            alert('Order status updated!');
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status.');
        }
    };

    if (loading) return <div>Loading details...</div>;
    if (!order) return <div>Order not found.</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Order #{order.id.slice(0, 8)}</h1>
                <div className="flex space-x-2">
                    {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
                        <button
                            key={status}
                            onClick={() => updateStatus(status)}
                            disabled={order.status === status}
                            className={`px-3 py-1 rounded text-sm font-medium capitalize ${order.status === status
                                ? 'bg-gray-800 text-white cursor-default'
                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Order Information</h3>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                    <dl className="sm:divide-y sm:divide-gray-200">
                        <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Customer</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{order.user?.email}</dd>
                        </div>
                        <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Shipping Address</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                {address ? (
                                    <>
                                        {address.full_name}<br />
                                        {address.address_line1}, {address.city}<br />
                                        {address.phone}
                                    </>
                                ) : 'Address not found'}
                            </dd>
                        </div>
                        <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Delivery Method</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 capitalize">{order.delivery_method}</dd>
                        </div>
                        <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Total Amount</dt>
                            <dd className="mt-1 text-sm font-bold text-gray-900 sm:mt-0 sm:col-span-2">${order.total_amount}</dd>
                        </div>
                    </dl>
                </div>
            </div>

            <h3 className="text-lg font-medium text-gray-900 mb-4">Order Items</h3>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <ul className="divide-y divide-gray-200">
                    {items.map(item => (
                        <li key={item.id} className="p-4 flex items-center">
                            <div className="h-16 w-16 bg-gray-100 rounded overflow-hidden">
                                {item.product?.images && item.product.images[0] && (
                                    <img src={item.product.images[0]} alt="" className="h-full w-full object-cover" />
                                )}
                            </div>
                            <div className="ml-4 flex-1">
                                <h4 className="text-sm font-medium text-gray-900">{item.product?.name}</h4>
                                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                            </div>
                            <div className="text-sm font-medium text-gray-900">
                                ${(item.price_at_purchase * item.quantity).toFixed(2)}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default OrderDetail;
