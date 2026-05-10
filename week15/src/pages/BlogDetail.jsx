import { useParams, Link, useNavigate } from "react-router-dom";
import { posts } from "../data/posts";
import { ChevronLeft, Calendar, User, Tag, Share2, Clock } from "lucide-react";

export default function BlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const post = posts.find((p) => p.id === parseInt(id, 10));

  if (!post) {
    return (
      <div className="text-center py-20 space-y-6">
        <h2 className="text-3xl font-bold text-slate-900">Post Not Found</h2>
        <p className="text-slate-600">The article you are looking for does not exist.</p>
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
          <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-bold">
            {post.category}
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
        <div className="flex items-center gap-6 py-4 border-y border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
              {post.author.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{post.author}</p>
              <p className="text-xs text-slate-500">Author</p>
            </div>
          </div>
          <div className="h-8 w-px bg-slate-100"></div>
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Calendar className="w-4 h-4" />
            {new Date(post.date).toLocaleDateString("en-US", { 
              month: 'long', 
              day: 'numeric', 
              year: 'numeric' 
            })}
          </div>
        </div>
      </header>

      {/* Featured Image */}
      <div className="aspect-video rounded-3xl overflow-hidden shadow-2xl shadow-slate-200">
        <img 
          src={post.image} 
          alt={post.title} 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="prose prose-lg prose-indigo max-w-none">
        {post.content.split('\n').map((paragraph, index) => (
          paragraph.trim() && (
            <p key={index} className="text-slate-600 leading-relaxed mb-6 text-lg">
              {paragraph.trim()}
            </p>
          )
        ))}
      </div>

      {/* Footer / Actions */}
      <footer className="pt-12 border-t border-slate-100 flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <Tag className="w-5 h-5 text-slate-400" />
          <span className="text-slate-500 text-sm font-medium">Tags:</span>
          {["Development", post.category].map(tag => (
            <span key={tag} className="text-xs font-bold text-slate-600 hover:text-indigo-600 cursor-pointer">
              #{tag}
            </span>
          ))}
        </div>
        <button className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold transition-colors">
          <Share2 className="w-4 h-4" />
          Share Post
        </button>
      </footer>
    </article>
  );
}
