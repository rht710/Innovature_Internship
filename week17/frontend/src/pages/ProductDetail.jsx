import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { 
  ChevronLeft, 
  Loader2, 
  AlertCircle, 
  ShoppingBag, 
  Plus, 
  Minus, 
  Check, 
  TrendingUp, 
  RefreshCw 
} from "lucide-react";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // API State
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Gallery Active Image State
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Cart Interactions
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axiosInstance.get(`/products/${id}/`);
        setProduct(res.data);
        setActiveImageIndex(0);
      } catch (err) {
        setError(
          err.response?.data?.detail || 
          err.message || 
          "Failed to fetch product details. Please ensure the backend is running."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  const handleQuantityChange = (type) => {
    if (type === "increase") {
      if (quantity < product.stock) {
        setQuantity(prev => prev + 1);
      }
    } else {
      if (quantity > 1) {
        setQuantity(prev => prev - 1);
      }
    }
  };

  const handleAddToCart = () => {
    setAddedToCart(true);
    setTimeout(() => {
      setAddedToCart(false);
    }, 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-slate-500 font-medium animate-pulse">Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-20 space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-500 mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900">Product Not Found</h2>
        <p className="text-slate-600">{error || "The product you are looking for does not exist."}</p>
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-indigo-600 font-bold hover:underline"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Catalog
        </Link>
      </div>
    );
  }

  // Compile image list for the gallery
  const galleryImages = [];
  if (product.images && product.images.length > 0) {
    product.images.forEach(imgObj => {
      const fullImg = imgObj.image.startsWith("http") 
        ? imgObj.image 
        : `http://127.0.0.1:8000${imgObj.image}`;
      const thumbImg = imgObj.thumbnail 
        ? (imgObj.thumbnail.startsWith("http") ? imgObj.thumbnail : `http://127.0.0.1:8000${imgObj.thumbnail}`) 
        : fullImg;
      galleryImages.push({ full: fullImg, thumb: thumbImg });
    });
  }
  
  // If no images from nested list, fall back to legacy image_url or placeholder
  if (galleryImages.length === 0) {
    const fallback = product.image_url || "https://via.placeholder.com/600x450?text=No+Image+Available";
    galleryImages.push({ full: fallback, thumb: fallback });
  }

  const activeImage = galleryImages[activeImageIndex];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-semibold transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
        Back to Catalog
      </button>

      {/* Main Grid: Gallery on left, Details on right */}
      <div className="grid gap-12 md:grid-cols-2 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
        {/* Left Column: Image Showcase & Gallery list */}
        <div className="space-y-4">
          <div className="aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center relative">
            <img 
              src={activeImage.full} 
              alt={product.name} 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://via.placeholder.com/600x600?text=Placeholder";
              }}
            />
            {product.stock <= 0 && (
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center">
                <span className="bg-red-600 text-white font-extrabold text-sm px-6 py-3 rounded-xl tracking-widest uppercase">
                  Out Of Stock
                </span>
              </div>
            )}
          </div>
          
          {/* Gallery Thumbnails List */}
          {galleryImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto py-1">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                    activeImageIndex === idx 
                      ? "border-indigo-600 scale-105 shadow-sm" 
                      : "border-slate-200 hover:border-indigo-300"
                  }`}
                >
                  <img 
                    src={img.thumb} 
                    alt={`Thumbnail ${idx + 1}`} 
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Specifications & Purchasing Controls */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Category and Tags */}
            <div className="flex items-center gap-2">
              <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                {product.category_name}
              </span>
              {product.stock > 0 ? (
                <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                  <Check className="w-3 h-3" /> In Stock
                </span>
              ) : null}
            </div>

            {/* Product Title */}
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {product.name}
            </h1>

            {/* Price Tags */}
            <div className="flex items-baseline gap-4 py-2 border-b border-slate-100">
              <span className="text-3xl font-black text-indigo-600">
                ₹{parseFloat(product.price).toLocaleString("en-IN")}
              </span>
              <span className="text-sm text-slate-500 font-medium">
                ({product.price_in_usd} USD)
              </span>
            </div>

            {/* Product Description */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Description</span>
              <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-wrap">
                {product.description || "No description provided for this product."}
              </p>
            </div>
          </div>

          {/* Checkout Controls */}
          <div className="space-y-6 pt-6 border-t border-slate-100">
            {product.stock > 0 ? (
              <>
                {/* Quantity Selector */}
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Quantity</span>
                  <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                    <button
                      onClick={() => handleQuantityChange("decrease")}
                      disabled={quantity <= 1}
                      className="p-2 rounded-lg text-slate-500 hover:bg-white hover:text-slate-900 disabled:opacity-50 disabled:hover:bg-none transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-bold text-slate-800 text-sm">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange("increase")}
                      disabled={quantity >= product.stock}
                      className="p-2 rounded-lg text-slate-500 hover:bg-white hover:text-slate-900 disabled:opacity-50 disabled:hover:bg-none transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">
                    {product.stock} units available
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={handleAddToCart}
                    disabled={addedToCart}
                    className={`flex-grow flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold transition-all shadow-md ${
                      addedToCart 
                        ? "bg-emerald-600 text-white shadow-emerald-100" 
                        : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100"
                    }`}
                  >
                    {addedToCart ? (
                      <>
                        <Check className="w-5 h-5" /> Added to Cart
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-5 h-5" /> Add to Cart
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-center">
                <p className="text-sm font-bold text-red-600">
                  This product is currently out of stock.
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  We are working hard to restock this item soon. Please check back later.
                </p>
              </div>
            )}
            
            {/* Product Meta Stats */}
            <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-500 pt-2">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-indigo-500" />
                <span>Fast Shipping Available</span>
              </div>
              <div className="flex items-center gap-1.5">
                <RefreshCw className="w-4 h-4 text-indigo-500" />
                <span>7-Day Return Policy</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
