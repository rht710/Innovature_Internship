import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { selectCartItems, selectCartTotal, clearCart } from "../store/cartSlice";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../api/axiosInstance";
import { 
  CreditCard, 
  MapPin, 
  ShoppingBag, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  ChevronLeft 
} from "lucide-react";

export default function Checkout() {
  const cartItems = useSelector(selectCartItems);
  const cartTotal = useSelector(selectCartTotal);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Form states
  const [formData, setFormData] = useState({
    fullName: user ? user.username : "",
    email: user ? user.email || "" : "",
    address: "",
    city: "",
    zipCode: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  // Flow states
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    setSubmitting(true);
    setError(null);

    try {
      // 1. Double check and deduct stock on backend for each item
      for (const item of cartItems) {
        // Fetch latest product stock to be absolutely safe
        const prodRes = await axiosInstance.get(`/products/${item.product.id}/`);
        const latestProduct = prodRes.data;

        if (latestProduct.stock < item.quantity) {
          throw new Error(
            `Insufficient stock for "${item.product.name}". Only ${latestProduct.stock} left in stock.`
          );
        }

        const newStock = latestProduct.stock - item.quantity;
        // Update stock via PATCH
        await axiosInstance.patch(`/products/${item.product.id}/`, {
          stock: newStock,
        });
      }

      // 2. Generate a random order ID
      const generatedOrderId = "SH-" + Math.floor(100000 + Math.random() * 900000);
      setOrderId(generatedOrderId);

      // 3. Clear cart
      dispatch(clearCart());
      setOrderSuccess(true);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || err.message || "An error occurred during checkout.");
    } finally {
      setSubmitting(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="max-w-xl mx-auto text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6 animate-in zoom-in duration-300">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle className="w-12 h-12" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Order Placed Successfully!</h2>
          <p className="text-slate-500">Thank you for your purchase. Your order has been processed.</p>
        </div>

        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 max-w-sm mx-auto text-left space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500 font-semibold">Order ID:</span>
            <span className="font-extrabold text-slate-800">{orderId}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500 font-semibold">Delivery To:</span>
            <span className="font-bold text-slate-800">{formData.fullName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500 font-semibold">Destination:</span>
            <span className="font-medium text-slate-600">{formData.address}, {formData.city}</span>
          </div>
        </div>

        <div className="pt-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-md shadow-indigo-100"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-2">
        <Link 
          to="/cart" 
          className="flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Cart
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Checkout Forms */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Shipping Address */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-600" /> Shipping Information
            </h2>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                <input
                  required
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 text-sm transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
                <input
                  required
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 text-sm transition-all"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Street Address</label>
                <input
                  required
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="123 Main St"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 text-sm transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">City</label>
                <input
                  required
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="San Francisco"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 text-sm transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">ZIP / Postal Code</label>
                <input
                  required
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  placeholder="94111"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 text-sm transition-all"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-600" /> Payment Details
            </h2>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="sm:col-span-3 space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Card Number</label>
                <input
                  required
                  type="text"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleChange}
                  placeholder="1234 5678 1234 5678"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 text-sm transition-all"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Expiration Date</label>
                <input
                  required
                  type="text"
                  name="expiry"
                  value={formData.expiry}
                  onChange={handleChange}
                  placeholder="MM/YY"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 text-sm transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">CVV</label>
                <input
                  required
                  type="text"
                  name="cvv"
                  value={formData.cvv}
                  onChange={handleChange}
                  placeholder="123"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 text-sm transition-all"
                />
              </div>
            </div>
          </div>
        </form>

        {/* Order Summary Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <ShoppingBag className="w-5 h-5 text-indigo-600" /> Items Summary
            </h2>

            <div className="max-h-60 overflow-y-auto space-y-3">
              {cartItems.map((item) => (
                <div key={item.product.id} className="flex justify-between items-center text-sm gap-2">
                  <div className="truncate">
                    <span className="font-semibold text-slate-800">{item.product.name}</span>
                    <span className="text-slate-400 text-xs ml-1">x{item.quantity}</span>
                  </div>
                  <span className="font-bold text-slate-700 whitespace-nowrap">
                    ₹{(parseFloat(item.product.price) * item.quantity).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-3 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-800">
                  ₹{cartTotal.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Shipping</span>
                <span className="font-semibold text-emerald-600">FREE</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 border-t border-slate-100 pt-3 text-base">
                <span>Total Amount</span>
                <span className="text-indigo-600">
                  ₹{cartTotal.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting || cartItems.length === 0}
              className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl font-bold transition-all shadow-md shadow-indigo-100"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Processing...
                </>
              ) : (
                <>
                  Pay & Place Order
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
