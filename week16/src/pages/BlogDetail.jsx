import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ChevronLeft, Calendar, User, Tag, Share2, Clock, Loader2, AlertCircle } from "lucide-react";

export default function BlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`https://dummyjson.com/posts/${id}`);
        setPost(response.data);
      } catch (err) {
        setError(err.message || "Failed to fetch post details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-slate-500 font-medium animate-pulse">Loading post details...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="text-center py-20 space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-500 mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900">Post Not Found</h2>
        <p className="text-slate-600">{error || "The article you are looking for does not exist."}</p>
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-indigo-600 font-bold hover:underline"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-medium transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
        Go Back
      </button>

      {/* Header */}
      <header className="space-y-6">
        <div className="flex items-center gap-2">
          <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-bold capitalize">
            {post.tags?.[0] || "General"}
          </span>
          <span className="text-slate-400">•</span>
          <span className="flex items-center gap-1.5 text-slate-500 text-sm">
            <Clock className="w-4 h-4" />
            5 min read
          </span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          {post.title}
        </h1>
        <div className="flex items-center gap-6 py-4 border-y border-slate-100 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
              U
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">User {post.userId}</p>
              <p className="text-xs text-slate-500">Author</p>
            </div>
          </div>
          <div className="hidden sm:block h-8 w-px bg-slate-100"></div>
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Calendar className="w-4 h-4" />
            Today
          </div>
          <div className="hidden sm:block h-8 w-px bg-slate-100"></div>
          <div className="flex items-center gap-2 text-slate-500 text-sm">
             <span className="font-bold text-slate-700">{post.views}</span> Views
          </div>
        </div>
      </header>

      {/* Featured Image */}
      <div className="aspect-video rounded-3xl overflow-hidden shadow-2xl shadow-slate-200 bg-slate-100">
        <img 
          src={`https://picsum.photos/seed/${post.id}/1200/600`} 
          alt={post.title} 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="prose prose-lg prose-indigo max-w-none">
        <p className="text-slate-600 leading-relaxed mb-6 text-lg whitespace-pre-wrap">
          {post.body}
        </p>
      </div>

      {/* Footer / Actions */}
      <footer className="pt-12 border-t border-slate-100 flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-2 flex-wrap">
          <Tag className="w-5 h-5 text-slate-400" />
          <span className="text-slate-500 text-sm font-medium">Tags:</span>
          {post.tags?.map(tag => (
            <span key={tag} className="text-xs font-bold text-slate-600 hover:text-indigo-600 cursor-pointer capitalize bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              #{tag}
            </span>
          ))}
        </div>
        <div className="flex gap-4">
           <div className="text-slate-500 text-sm font-medium flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors px-4 py-2 rounded-lg border border-slate-200">
               <span className="text-green-600 font-bold">{post.reactions?.likes || 0}</span> Likes
           </div>
           <div className="text-slate-500 text-sm font-medium flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors px-4 py-2 rounded-lg border border-slate-200">
               <span className="text-red-500 font-bold">{post.reactions?.dislikes || 0}</span> Dislikes
           </div>
        </div>
      </footer>
    </article>
  );
}
