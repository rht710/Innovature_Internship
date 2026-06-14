import React, { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import ProductForm from "../components/ProductForm";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  AlertCircle, 
  Loader2, 
  ShoppingBag, 
  ChevronLeft, 
  ChevronRight, 
  Package, 
  AlertTriangle, 
  Folder 
} from "lucide-react";

export default function AdminDashboard() {
  // Navigation / View state
  const [view, setView] = useState("list"); // "list", "create", "edit"
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Table Data & Query states
  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Statistics states
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockCount: 0,
    categoryCount: 0
  });

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1); // Reset page on search
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");
      
      const params = {
        page: currentPage,
      };
      if (debouncedSearch) {
        params.search = debouncedSearch;
      }

      const response = await axiosInstance.get("/products/", { params });
      setProducts(response.data.results || response.data || []);
      setTotalCount(response.data.count || (response.data || []).length);
    } catch (err) {
      console.error("Failed to load products for admin:", err);
      setError("Failed to fetch products. Please ensure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats and categories
  const fetchStats = async () => {
    try {
      // Get all products count and low stock
      const prodRes = await axiosInstance.get("/products/", { params: { page_size: 1000 } });
      const allProds = prodRes.data.results || prodRes.data || [];
      
      const lowStock = allProds.filter(p => p.stock <= 5).length;
      
      const catRes = await axiosInstance.get("/categories/");
      const cats = catRes.data.results || catRes.data || [];

      setStats({
        totalProducts: allProds.length,
        lowStockCount: lowStock,
        categoryCount: cats.length
      });
    } catch (err) {
      console.error("Failed to calculate stats:", err);
    }
  };

  useEffect(() => {
    if (view === "list") {
      fetchProducts();
      fetchStats();
    }
  }, [currentPage, debouncedSearch, view]);

  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product? All its associated images will be deleted too.")) {
      return;
    }

    try {
      setLoading(true);
      await axiosInstance.delete(`/products/${productId}/`);
      setSuccess("Product deleted successfully.");
      fetchProducts();
      fetchStats();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Failed to delete product:", err);
      setError("Failed to delete the product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (product) => {
    setSelectedProduct(product);
    setView("edit");
  };

  const handleSaveSuccess = () => {
    setSuccess(view === "edit" ? "Product updated successfully!" : "Product created successfully!");
    setView("list");
    setSelectedProduct(null);
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleCancel = () => {
    setView("list");
    setSelectedProduct(null);
  };

  const totalPages = Math.ceil(totalCount / 6); // standard page size of 6 from settings.py

  return (
    <div className="space-y-8 animate-in">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Admin <span className="text-indigo-600 font-black">Control Panel</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Add, edit, and manage products and inventory upload media files
          </p>
        </div>
        
        {view === "list" && (
          <button
            onClick={() => setView("create")}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-3 rounded-xl transition-all shadow-md hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            Add Product
          </button>
        )}
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl flex items-center gap-3 text-sm animate-in">
          <Package className="w-5 h-5 flex-shrink-0" />
          <span className="font-semibold">{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center gap-3 text-sm animate-in">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* RENDER FORM VIEW */}
      {view !== "list" ? (
        <ProductForm
          initialProduct={selectedProduct}
          onSave={handleSaveSuccess}
          onCancel={handleCancel}
        />
      ) : (
        <>
          {/* Dashboard Stats */}
          <div className="grid sm:grid-cols-3 gap-6">
            
            {/* Total Products */}
            <div className="bg-white border border-slate-100 shadow-sm p-6 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Products</span>
                <h3 className="text-2xl font-black text-slate-800">{stats.totalProducts}</h3>
              </div>
            </div>

            {/* Low Stock */}
            <div className="bg-white border border-slate-100 shadow-sm p-6 rounded-2xl flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stats.lowStockCount > 0 ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}>
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Low Stock (&le;5)</span>
                <h3 className="text-2xl font-black text-slate-800">{stats.lowStockCount}</h3>
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white border border-slate-100 shadow-sm p-6 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                <Folder className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Categories</span>
                <h3 className="text-2xl font-black text-slate-800">{stats.categoryCount}</h3>
              </div>
            </div>

          </div>

          {/* Search Controls */}
          <div className="bg-white border border-slate-200 shadow-sm p-4 rounded-2xl flex items-center gap-3">
            <Search className="w-5 h-5 text-slate-400 ml-2" />
            <input
              type="text"
              placeholder="Quick search products by name or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-slate-800 placeholder-slate-400 text-sm"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="p-1 text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Table / Grid list */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center space-y-4 max-w-md mx-auto">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-xl font-bold text-slate-900">No Products Found</h3>
              <p className="text-slate-500 text-sm">
                There are no products matched or seeded in your storage. Add a new product to begin!
              </p>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 border-b border-slate-200 text-xs font-bold uppercase tracking-wider">
                      <th className="p-4 pl-6">Image</th>
                      <th className="p-4">Product Name</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Stock</th>
                      <th className="p-4 text-right pr-6">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {products.map((product) => {
                      let imgSource = "https://via.placeholder.com/150?text=No+Image";
                      if (product.images && product.images.length > 0) {
                        const imgPath = product.images[0].thumbnail || product.images[0].image;
                        imgSource = imgPath.startsWith("http") 
                          ? imgPath 
                          : `http://127.0.0.1:8000${imgPath}`;
                      } else if (product.image_url) {
                        imgSource = product.image_url;
                      }

                      return (
                        <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 pl-6">
                            <img
                              src={imgSource}
                              alt={product.name}
                              className="w-12 h-12 rounded-lg object-cover border border-slate-200 bg-slate-50"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://via.placeholder.com/150?text=Error";
                              }}
                            />
                          </td>
                          <td className="p-4 font-bold text-slate-800">
                            {product.name}
                          </td>
                          <td className="p-4 text-slate-500 font-medium">
                            <span className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-full font-semibold">
                              {product.category_name}
                            </span>
                          </td>
                          <td className="p-4 font-black text-indigo-600">
                            ₹{parseFloat(product.price).toLocaleString("en-IN")}
                          </td>
                          <td className="p-4">
                            <span className={`font-bold ${product.stock <= 5 ? "text-amber-500" : "text-slate-500"}`}>
                              {product.stock}
                            </span>
                          </td>
                          <td className="p-4 text-right pr-6">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => startEdit(product)}
                                className="p-2 bg-indigo-55 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white rounded-lg transition-all"
                                title="Edit Product"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(product.id)}
                                className="p-2 bg-red-50 text-red-500 hover:bg-red-600 hover:text-white rounded-lg transition-all"
                                title="Delete Product"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Table Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-slate-100 p-4 px-6 bg-slate-50/50">
                  <span className="text-xs font-semibold text-slate-400">
                    Showing {(currentPage - 1) * 6 + 1} to {Math.min(currentPage * 6, totalCount)} of {totalCount} products
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-bold text-slate-700">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

    </div>
  );
}
