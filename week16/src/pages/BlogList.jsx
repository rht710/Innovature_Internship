import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import { ChevronLeft, ChevronRight, Calendar, User, ArrowRight, Loader2, AlertCircle, LayoutGrid, Infinity } from "lucide-react";

const POSTS_PER_PAGE = 6;
const CATEGORIES = ["All", "History", "Fiction", "Crime", "Love", "Mystery"];

export default function BlogList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState("pagination"); // 'pagination' or 'infinite'
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // For pagination mode
  const currentCategory = searchParams.get("category") || "All";
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const [totalPosts, setTotalPosts] = useState(0);

  // For infinite scroll mode
  const [infiniteSkip, setInfiniteSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const observer = useRef();
  
  // Ref hook to observe the last post in infinite scroll mode
  const lastPostElementRef = useCallback(node => {
    if (viewMode !== "infinite" || loading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setInfiniteSkip(prevSkip => prevSkip + POSTS_PER_PAGE);
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, hasMore, viewMode]);

  // Handle mode toggle (Pagination vs Infinite Scroll)
  const handleModeChange = (mode) => {
    setViewMode(mode);
    setPosts([]);
    setInfiniteSkip(0);
    setHasMore(true);
    if (mode === "pagination") {
      setSearchParams({ category: currentCategory, page: "1" });
    }
  };

  // Reset infinite scroll when category is switched
  useEffect(() => {
    if (viewMode === "infinite") {
      setPosts([]);
      setInfiniteSkip(0);
      setHasMore(true);
    }
  }, [currentCategory, viewMode]);

  // Combined data fetching effect
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);

        // Determine skip value based on the selected mode
        const skipValue = viewMode === "pagination" 
          ? (currentPage - 1) * POSTS_PER_PAGE 
          : infiniteSkip;

        const tag = currentCategory !== "All" ? currentCategory.toLowerCase() : null;
        
        let url = `https://dummyjson.com/posts?limit=${POSTS_PER_PAGE}&skip=${skipValue}`;
        if (tag) {
          url = `https://dummyjson.com/posts/tag/${tag}?limit=${POSTS_PER_PAGE}&skip=${skipValue}`;
        }

        const response = await axios.get(url);
        
        if (viewMode === "pagination") {
          setPosts(response.data.posts);
          setTotalPosts(response.data.total);
        } else {
          // Append data in infinite scroll mode
          setPosts(prev => [...prev, ...response.data.posts]);
          setHasMore(response.data.posts.length > 0 && response.data.total > skipValue + POSTS_PER_PAGE);
        }
      } catch (err) {
        setError(err.message || "Failed to fetch posts. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [currentPage, currentCategory, infiniteSkip, viewMode]);

  const handleCategoryChange = (category) => {
    setSearchParams({ category, page: "1" });
  };

  const handlePageChange = (page) => {
    const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);
    if (page >= 1 && page <= totalPages) {
      setSearchParams({ category: currentCategory, page: page.toString() });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

  // Helper function to calculate which page numbers to display with ellipses
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      // Always show page 1
      pages.push(1);
      
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      // Keep visible counts consistent at edges
      if (currentPage <= 3) {
        end = 4;
      } else if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
      }
      
      if (start > 2) {
        pages.push("...");
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (end < totalPages - 1) {
        pages.push("...");
      }
      
      // Always show last page
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <section className="text-center space-y-4 max-w-2xl mx-auto py-8">
        <h1 className="text-4xl font-extrabold text-slate-900 sm:text-5xl tracking-tight">
          Latest <span className="text-indigo-600">Insights</span>
        </h1>
        <p className="text-lg text-slate-600">
          Explore our collection of articles on technology, design, and modern lifestyle.
        </p>
      </section>

      {/* Mode Selector Toggle */}
      <div className="flex justify-center items-center gap-4 border-b border-slate-100 pb-6 max-w-md mx-auto">
        <span className="text-sm font-semibold text-slate-500">Navigation:</span>
        <div className="bg-slate-100 p-1 rounded-xl flex gap-1">
          <button
            onClick={() => handleModeChange("pagination")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === "pagination"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Standard Pagination
          </button>
          <button
            onClick={() => handleModeChange("infinite")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === "infinite"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Infinity className="w-3.5 h-3.5" />
            Infinite Scroll (Bonus)
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap items-center justify-center gap-2 pb-4">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              currentCategory === cat
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105"
                : "bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center justify-center gap-2 max-w-2xl mx-auto">
          <AlertCircle className="w-5 h-5" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* Blog Grid */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post, index) => {
          const isLastPost = posts.length === index + 1;
          return (
            <article 
              ref={viewMode === "infinite" && isLastPost ? lastPostElementRef : null}
              key={`${post.id}-${index}`} 
              className="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
            >
              <div className="relative h-48 overflow-hidden bg-slate-100">
                <img 
                  src={`https://picsum.photos/seed/${post.id}/800/600`} 
                  alt={post.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-white/90 backdrop-blur-sm text-indigo-700 px-3 py-1 rounded-full text-xs font-bold shadow-sm capitalize">
                    {post.tags[0] || "General"}
                  </span>
                </div>
              </div>
              <div className="p-6 space-y-4 flex flex-col flex-grow">
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    User {post.userId}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Today
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-slate-600 text-sm line-clamp-3 leading-relaxed flex-grow">
                  {post.body}
                </p>
                <Link 
                  to={`/post/${post.id}`}
                  className="inline-flex items-center gap-2 text-indigo-600 font-bold text-sm group/btn pt-4 mt-auto border-t border-slate-50"
                >
                  Read More
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </article>
          )
        })}
      </div>

      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      )}

      {/* Pagination Mode UI Controls */}
      {viewMode === "pagination" && totalPages > 1 && !loading && (
        <nav className="flex items-center justify-center gap-2 sm:gap-4 pt-8">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg text-xs sm:text-sm font-bold transition-all ${
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
            className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </nav>
      )}

      {/* Infinite Scroll Mode UI Controls */}
      {viewMode === "infinite" && !hasMore && posts.length > 0 && (
         <div className="text-center py-8 text-slate-500 font-medium bg-slate-50 rounded-xl">
           You have reached the end! No more posts to load.
         </div>
      )}
      
      {!loading && !error && posts.length === 0 && (
          <div className="col-span-full py-20 text-center space-y-4">
            <p className="text-xl text-slate-400">No posts found.</p>
          </div>
      )}
    </div>
  );
}
