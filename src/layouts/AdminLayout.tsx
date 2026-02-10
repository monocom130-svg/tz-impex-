import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Package, ShoppingBag, Users, LogOut, Ticket } from 'lucide-react';

const AdminLayout = () => {
    const { signOut } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-64 bg-white shadow-md flex flex-col">
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-indigo-600">T-Z Admin</h1>
                </div>
                <nav className="flex-1 px-4 space-y-2">
                    <Link to="/admin" className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100 text-gray-700">
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                    </Link>
                    <Link to="/admin/products" className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100 text-gray-700">
                        <Package size={20} />
                        <span>Products</span>
                    </Link>
                    <Link to="/admin/orders" className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100 text-gray-700">
                        <ShoppingBag size={20} />
                        <span>Orders</span>
                    </Link>
                    <Link to="/admin/coupons" className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100 text-gray-700">
                        <Ticket size={20} />
                        <span>Coupons</span>
                    </Link>
                    <Link to="/admin/customers" className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100 text-gray-700">
                        <Users size={20} />
                        <span>Customers</span>
                    </Link>
                </nav>
                <div className="p-4 border-t">
                    <button onClick={handleSignOut} className="flex items-center space-x-2 text-red-600 hover:text-red-800 w-full p-2">
                        <LogOut size={20} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                <div className="p-8">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;
