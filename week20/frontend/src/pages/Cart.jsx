import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { 
  selectCartItems, 
  selectCartTotal, 
  removeFromCart, 
  updateQuantity 
} from "../store/cartSlice";
import { 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  ChevronLeft 
} from "lucide-react";

export default function Cart() {
  const cartItems = useSelector(selectCartItems);
  const cartTotal = useSelector(selectCartTotal);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleRemove = (productId) => {
    dispatch(removeFromCart(productId));
  };

  const handleQuantityChange = (productId, quantity, stock) => {
    if (quantity < 1 || quantity > stock) return;
    dispatch(updateQuantity({ productId, quantity }));
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-50 text-indigo-600 mb-6">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Your Cart is Empty</h2>
        <p className="text-slate-500 mt-2 mb-8 max-w-md mx-auto">
          Looks like you haven't added any products to your cart yet. Explore our premium catalog to find amazing deals!
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-md shadow-indigo-100"
        >
          <ChevronLeft className="w-5 h-5" /> Start Shopping
        </Link>
      </div>
    );
  }

  const getProductImage = (product) => {
    if (product.images && product.images.length > 0) {
      const imgObj = product.images[0];
      const thumb = imgObj.thumbnail || imgObj.image;
      return thumb.startsWith("http") ? thumb : `http://127.0.0.1:8000${thumb}`;
    }
    return product.image_url || "https://via.placeholder.com/150";
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Shopping Cart</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your selected items and proceed to checkout</p>
        </div>
        <Link 
          to="/" 
          className="flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Continue Shopping
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div 
              key={item.product.id} 
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6 bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-4 flex-grow">
                {/* Product Info */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                    {item.product.category_name}
                  </span>
                  <h3 className="font-bold text-slate-900 hover:text-indigo-600 mt-1 transition-colors">
                    <Link to={`/product/${item.product.id}`}>{item.product.name}</Link>
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-bold text-slate-800">
                      ₹{parseFloat(item.product.price).toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs text-slate-400">
                      ({item.product.price_in_usd} USD)
                    </span>
                  </div>
                </div>
              </div>

              {/* Quantity Controls & Actions */}
              <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0">
                <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 p-0.5">
                  <button
                    onClick={() => handleQuantityChange(item.product.id, item.quantity - 1, item.product.stock)}
                    disabled={item.quantity <= 1}
                    className="p-1 rounded text-slate-500 hover:bg-white hover:text-slate-900 disabled:opacity-50 transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-slate-800">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(item.product.id, item.quantity + 1, item.product.stock)}
                    disabled={item.quantity >= item.product.stock}
                    className="p-1 rounded text-slate-500 hover:bg-white hover:text-slate-900 disabled:opacity-50 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <div className="text-right min-w-[80px]">
                  <span className="text-sm font-extrabold text-indigo-600">
                    ₹{(parseFloat(item.product.price) * item.quantity).toLocaleString("en-IN")}
                  </span>
                </div>

                <button
                  onClick={() => handleRemove(item.product.id)}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                  aria-label="Remove Item"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Sidebar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm h-fit space-y-6">
          <h2 className="text-lg font-bold text-slate-900">Order Summary</h2>

          <div className="space-y-3 border-b border-slate-100 pb-4 text-sm">
            <div className="flex justify-between text-slate-500">
              <span>Items Total</span>
              <span className="font-semibold text-slate-800">
                ₹{cartTotal.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Shipping</span>
              <span className="font-semibold text-emerald-600">FREE</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Estimated Tax</span>
              <span className="font-semibold text-slate-800">₹0</span>
            </div>
          </div>

          <div className="flex justify-between items-baseline">
            <span className="text-base font-bold text-slate-900">Total Price</span>
            <span className="text-2xl font-black text-indigo-600">
              ₹{cartTotal.toLocaleString("en-IN")}
            </span>
          </div>

          <button
            onClick={() => navigate("/checkout")}
            className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-md shadow-indigo-100"
          >
            Proceed to Checkout <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
