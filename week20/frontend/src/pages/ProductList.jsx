import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { 
  Search, 
  Loader2, 
  AlertCircle, 
  SlidersHorizontal, 
  ArrowUpDown, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Layers 
} from "lucide-react";

export default function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();

  // API Data States
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination Details
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 6;

  // Filter States from URL or Defaults
  const searchQuery = searchParams.get("search") || "";
  const selectedCategory = searchParams.get("category") || "";
  const minPrice = searchParams.get("min_price") || "";
  const maxPrice = searchParams.get("max_price") || "";
  const ordering = searchParams.get("ordering") || "-created_at";
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  // Local state for input fields to avoid excessive API requests before submission
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [localMinPrice, setLocalMinPrice] = useState(minPrice);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice);

  // Fetch Categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axiosInstance.get("/categories/");
        setCategories(res.data.results || res.data || []);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // Synchronize local search input if URL params change externally
  useEffect(() => {
    setLocalSearch(searchQuery);
    setLocalMinPrice(minPrice);
    setLocalMaxPrice(maxPrice);
  }, [searchQuery, minPrice, maxPrice]);

  // Fetch Products based on parameters
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {
          page: currentPage,
        };

        if (searchQuery) params.search = searchQuery;
        if (selectedCategory) params.category = selectedCategory;
        if (minPrice) params.min_price = minPrice;
        if (maxPrice) params.max_price = maxPrice;
        if (ordering) params.ordering = ordering;

        const res = await axiosInstance.get("/products/", { params });
        // DRF returns paginated results under `results` and the count under `count`
        setProducts(res.data.results || []);
        setTotalCount(res.data.count || 0);
      } catch (err) {
        setError(
          err.response?.data?.detail || 
          err.message || 
          "Failed to fetch products. Please ensure the backend server is running."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, searchQuery, selectedCategory, minPrice, maxPrice, ordering]);

  // Update URL Search Parameters Helper
  const updateParams = (newParams) => {
    const nextParams = new URLSearchParams(searchParams);
    
    // Always reset to page 1 on filter change except when modifying page directly
    if (!newParams.hasOwnProperty("page")) {
      nextParams.set("page", "1");
    }

    Object.entries(newParams).forEach(([key, val]) => {
      if (val === "" || val === null || val === undefined) {
        nextParams.delete(key);
      } else {
        nextParams.set(key, val);
      }
    });

    setSearchParams(nextParams);
  };

  // Filter Submissions
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParams({ search: localSearch });
  };

  const handlePriceSubmit = (e) => {
    e.preventDefault();
    updateParams({ min_price: localMinPrice, max_price: localMaxPrice });
  };

  const handleCategoryChange = (slug) => {
    updateParams({ category: slug });
  };

  const handleOrderingChange = (e) => {
    updateParams({ ordering: e.target.value });
  };

  const handlePageChange = (page) => {
    const totalPages = Math.ceil(totalCount / itemsPerPage);
    if (page >= 1 && page <= totalPages) {
      updateParams({ page: page.toString() });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleResetFilters = () => {
    setLocalSearch("");
    setLocalMinPrice("");
    setLocalMaxPrice("");
    setSearchParams({});
  };

  // Ellipsis Pagination Helper
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      if (currentPage <= 3) {
        end = 4;
      } else if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
      }
      
      if (start > 2) pages.push("...");
      
      for (let i = start; i <= end; i++) pages.push(i);
      
      if (end < totalPages - 1) pages.push("...");
      
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <section className="text-center space-y-4 max-w-2xl mx-auto py-4">
        <h1 className="text-4xl font-extrabold text-slate-900 sm:text-5xl tracking-tight">
          Explore Our <span className="text-indigo-600">Products</span>
        </h1>
        <p className="text-lg text-slate-600">
          Find the best deals on gadgets, clothing, home essentials, and books.
        </p>
      </section>

      {/* Controls Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Live Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-grow max-w-lg relative">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search products by name or description..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
              {localSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setLocalSearch("");
                    updateParams({ search: "" });
                  }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="bg-indigo-600 text-white px-5 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Search
            </button>
          </form>

          {/* Price Range & Sorting */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Price Filter Form */}
            <form onSubmit={handlePriceSubmit} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1">
              <span className="text-xs font-semibold text-slate-500 px-2 uppercase tracking-wider">Price:</span>
              <input
                type="number"
                placeholder="Min"
                value={localMinPrice}
                onChange={(e) => setLocalMinPrice(e.target.value)}
                className="w-20 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
              />
              <span className="text-slate-300">-</span>
              <input
                type="number"
                placeholder="Max"
                value={localMaxPrice}
                onChange={(e) => setLocalMaxPrice(e.target.value)}
                className="w-20 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition-colors"
                title="Apply Price Filter"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            </form>

            {/* Ordering Select */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1">
              <span className="text-xs font-semibold text-slate-500 px-2 uppercase tracking-wider">Sort:</span>
              <select
                value={ordering}
                onChange={handleOrderingChange}
                className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:border-indigo-500 font-medium"
              >
                <option value="-created_at">Newest First</option>
                <option value="price">Price: Low to High</option>
                <option value="-price">Price: High to Low</option>
              </select>
            </div>

            {/* Clear All Filters Button */}
            {(searchQuery || selectedCategory || minPrice || maxPrice) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-800 transition-colors px-3 py-2 rounded-xl bg-red-50"
              >
                <X className="w-4 h-4" />
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Categories Chips */}
        <div className="border-t border-slate-100 pt-5">
          <div className="flex items-center gap-2 mb-3 text-slate-400">
            <Layers className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Filter by Category</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleCategoryChange("")}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                selectedCategory === ""
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100 scale-105"
                  : "bg-slate-50 text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
              }`}
            >
              All Products
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.slug)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  selectedCategory === cat.slug
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100 scale-105"
                    : "bg-slate-50 text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
                }`}
              >
                {cat.name} <span className="text-xs opacity-70 ml-0.5">({cat.product_count})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Alert Box */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center justify-center gap-2 max-w-2xl mx-auto shadow-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="flex justify-center items-center py-24">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        </div>
      )}

      {/* Product Catalog Grid */}
      {!loading && !error && (
        <>
          {products.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center space-y-4 max-w-md mx-auto">
              <SlidersHorizontal className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-xl font-bold text-slate-900">No Products Found</h3>
              <p className="text-slate-500 text-sm">
                Try widening your search terms, clearing category filters, or resetting the price ranges.
              </p>
              <button
                onClick={handleResetFilters}
                className="inline-flex bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => {
                  // Select product image: check nested images array first, fallback to image_url, then placeholder
                  let imgSource = "https://via.placeholder.com/400x300?text=No+Image";
                  if (product.images && product.images.length > 0) {
                    // If image is a local path (starts with /), append baseURL domain
                    const imgPath = product.images[0].image || product.images[0].thumbnail;
                    imgSource = imgPath.startsWith("http") 
                      ? imgPath 
                      : `http://127.0.0.1:8000${imgPath}`;
                  } else if (product.image_url) {
                    imgSource = product.image_url;
                  }

                  return (
                    <article
                      key={product.id}
                      className="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
                    >
                      {/* Content Details */}
                      <div className="p-6 space-y-4 flex flex-col flex-grow">
                        {/* Badges Container */}
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                            {product.category_name}
                          </span>
                          {product.stock <= 0 ? (
                            <span className="bg-red-50 text-red-600 font-extrabold text-[10px] px-2.5 py-1 rounded-lg tracking-wider uppercase">
                              Out Of Stock
                            </span>
                          ) : product.stock <= 5 ? (
                            <span className="bg-amber-50 text-amber-600 font-bold text-[10px] px-2.5 py-1 rounded-lg tracking-wider uppercase">
                              Only {product.stock} Left
                            </span>
                          ) : null}
                        </div>

                        <div className="flex justify-between items-start gap-4">
                          <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                            {product.name}
                          </h3>
                          <div className="text-right flex-shrink-0">
                            <span className="text-lg font-black text-indigo-600 block">
                              ₹{parseFloat(product.price).toLocaleString("en-IN")}
                            </span>
                            <span className="text-xs text-slate-400 font-medium">
                              (${product.price_in_usd} USD)
                            </span>
                          </div>
                        </div>

                        <p className="text-slate-500 text-sm line-clamp-3 leading-relaxed flex-grow">
                          {product.description}
                        </p>

                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                          <span className="text-xs font-semibold text-slate-400">
                            Stock: {product.stock} units
                          </span>
                          <Link
                            to={`/product/${product.id}`}
                            className="bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white px-4 py-2 rounded-lg text-xs font-bold transition-all"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <nav className="flex items-center justify-center gap-2 sm:gap-4 pt-12">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center">
                    {getPageNumbers().map((page, i) => {
                      if (page === "...") {
                        return (
                          <span
                            key={`ellipsis-${i}`}
                            className="w-8 h-10 sm:w-10 flex items-center justify-center text-slate-400 font-bold"
                          >
                            ...
                          </span>
                        );
                      }
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                            currentPage === page
                              ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                              : "text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </nav>
              )}
            </>
          )}
        </>
      )}
      </div>
    );
}



