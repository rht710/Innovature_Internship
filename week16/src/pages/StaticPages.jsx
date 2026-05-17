export function About() {
  return (
    <div className="max-w-3xl mx-auto py-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <h1 className="text-4xl font-extrabold text-slate-900">About <span className="text-indigo-600">DevBlog</span></h1>
      <div className="space-y-6 text-lg text-slate-600 leading-relaxed">
        <p>
          Welcome to DevBlog, a platform dedicated to exploring the intersection of technology, 
          design, and lifestyle. Our mission is to provide high-quality content that inspires 
          and educates developers and creators.
        </p>
        <p>
          This application is built as part of the Week 15 assignment to demonstrate the 
          power of <strong>React Router v6</strong>. It features dynamic routing, nested layouts, 
          and URL-based state management for filtering and pagination.
        </p>
        <div className="bg-indigo-50 border border-indigo-100 p-8 rounded-2xl space-y-4">
          <h2 className="text-xl font-bold text-indigo-900">Project Highlights:</h2>
          <ul className="list-disc list-inside space-y-2 text-indigo-800 font-medium">
            <li>Dynamic routing with parameters</li>
            <li>Shared layouts with Outlets</li>
            <li>Search parameters for filtering & pagination</li>
            <li>Responsive and premium UI design</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
      <h1 className="text-9xl font-black text-slate-200">404</h1>
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-slate-900">Page Not Found</h2>
        <p className="text-slate-600">The page you are looking for might have been moved or deleted.</p>
      </div>
      <a 
        href="/" 
        className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
      >
        Go Back Home
      </a>
    </div>
  );
}
