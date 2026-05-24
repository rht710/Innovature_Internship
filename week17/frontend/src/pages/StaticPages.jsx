export function About() {
  return (
    <div className="max-w-3xl mx-auto py-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <h1 className="text-4xl font-extrabold text-slate-900">About <span className="text-indigo-600">ShopHub</span></h1>
      <div className="space-y-6 text-lg text-slate-600 leading-relaxed">
        <p>
          Welcome to ShopHub, a high-performance e-commerce catalog application designed to demonstrate full-stack API integration. Our store provides seamless browsing across multi-category products.
        </p>
        <p>
          This application is built as part of the Week 17 assignment to showcase a complete 
          <strong> React + Django REST Framework</strong> integration. It features a configured Axios client instance, CORS policy validation, category and search filtering, price constraints, and pagination syncing.
        </p>
        <div className="bg-indigo-50 border border-indigo-100 p-8 rounded-2xl space-y-4">
          <h2 className="text-xl font-bold text-indigo-900">Project Highlights:</h2>
          <ul className="list-disc list-inside space-y-2 text-indigo-800 font-medium">
            <li>Axios client instance with global query utilities</li>
            <li>Django REST Framework API consumption</li>
            <li>Django CORS-headers configuration</li>
            <li>Search, category, and price range constraints</li>
            <li>Premium sliding-window pagination controls</li>
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
