import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Shop/Home';
import ProductList from './pages/Shop/ProductList';
import ProductDetail from './pages/Shop/ProductDetail';
import Cart from './pages/Shop/Cart';
import Checkout from './pages/Shop/Checkout';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import UserProfile from './pages/User/UserProfile';
import AdminDashboard from './pages/Admin/Dashboard';
import AdminProducts from './pages/Admin/ProductList';
import ProductForm from './pages/Admin/ProductForm';
import AdminOrders from './pages/Admin/OrderList';
import AdminOrderDetail from './pages/Admin/OrderDetail';
import CouponList from './pages/Admin/CouponList';
import RiderPortal from './pages/Rider/RiderPortal';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            {/* Public Routes wrapped in MainLayout */}
            <Route element={<MainLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Protected Routes also wrapped in MainLayout */}
              <Route element={<ProtectedRoute />}>
                <Route index element={<Home />} />
                <Route path="/products" element={<ProductList />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/profile" element={<UserProfile />} />
              </Route>
            </Route>

            {/* Admin Routes - Separate Layout */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="products/new" element={<ProductForm />} />
              <Route path="products/:id" element={<ProductForm />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="orders/:id" element={<AdminOrderDetail />} />
              <Route path="coupons" element={<CouponList />} />
            </Route>

            {/* Rider Portal */}
            <Route element={<ProtectedRoute />}>
              <Route path="/rider" element={<RiderPortal />} />
            </Route>
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
