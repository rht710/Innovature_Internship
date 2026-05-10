import { useSearchParams, Link } from "react-router-dom";
import { posts, categories } from "../data/posts";
import { ChevronLeft, ChevronRight, Calendar, User, Tag, ArrowRight } from "lucide-react";

const POSTS_PER_PAGE = 3;

export default function BlogList() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const currentCategory = searchParams.get("category") || "All";
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  // Filtering
  const filteredPosts = posts.filter(post => 
    currentCategory === "All" || post.category === currentCategory
  );

  // Pagination
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const paginatedPosts = filteredPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);

  const handleCategoryChange = (category) => {
    setSearchParams({ category, page: "1" });
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setSearchParams({ category: currentCategory, page: page.toString() });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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

      {/* Category Filter */}
      <div className="flex flex-wrap items-center justify-center gap-2 pb-4">
        {categories.map((cat) => (
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

      {/* Blog Grid */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {paginatedPosts.length > 0 ? (
          paginatedPosts.map((post) => (
            <article 
              key={post.id} 
              className="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-white/90 backdrop-blur-sm text-indigo-700 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                    {post.category}
                  </span>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(post.date).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    {post.author}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-slate-600 text-sm line-clamp-3 leading-relaxed">
                  {post.excerpt}
                </p>
                <Link 
                  to={`/post/${post.id}`}
                  className="inline-flex items-center gap-2 text-indigo-600 font-bold text-sm group/btn"
                >
                  Read More
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </article>
          ))
        ) : (
          <div className="col-span-full py-20 text-center space-y-4">
            <p className="text-xl text-slate-400">No posts found in this category.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-4 pt-8">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => handlePageChange(i + 1)}
                className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${
                  currentPage === i + 1
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {i + 1}
              </button>
            ))}
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
    </div>
  );
}
