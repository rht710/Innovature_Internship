export const posts = [
  {
    id: 1,
    title: "Understanding React Router v6",
    excerpt: "Learn how to use the latest features of React Router v6 to build powerful navigation systems.",
    content: `
      React Router v6 is a major update to the most popular routing library for React. 
      It introduces a smaller, more declarative API and improved performance. 
      In this post, we'll explore the core concepts of v6, including the new <Routes> and <Route> elements, 
      nested routes, and the powerful hooks like useNavigate and useParams.
      
      Routing is the backbone of any single-page application. It allows you to synchronize your UI 
      with the URL, enabling features like bookmarking, sharing links, and the back/forward buttons.
    `,
    category: "Tech",
    date: "2024-03-15",
    author: "Jane Doe",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 2,
    title: "Mastering CSS Grid",
    excerpt: "Grid layout is the most powerful layout system in CSS. Here is how to master it.",
    content: `
      CSS Grid Layout is a two-dimensional layout system for the web. It lets you layout content in 
      rows and columns, and has many features that make building complex layouts easy.
      
      Unlike Flexbox, which is primarily one-dimensional, Grid is designed for complex web page layouts. 
      You can define grid tracks (rows and columns) and then place items into the cells defined by those tracks.
    `,
    category: "Design",
    date: "2024-03-10",
    author: "John Smith",
    image: "https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 3,
    title: "The Future of Web Development",
    excerpt: "What technologies will shape the web in the coming years? AI, WebAssembly, and more.",
    content: `
      The web landscape is constantly evolving. From the rise of AI-assisted coding to the 
      performance gains of WebAssembly, new technologies are changing how we build for the web.
      
      Server-side rendering (SSR) and Static Site Generation (SSG) are becoming more mainstream 
      with frameworks like Next.js and Remix leading the way.
    `,
    category: "Tech",
    date: "2024-03-05",
    author: "Jane Doe",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 4,
    title: "Minimalist Living",
    excerpt: "How simplifying your surroundings can lead to a more focused and productive life.",
    content: `
      Minimalism isn't just about having fewer things; it's about making room for what truly matters. 
      By removing the clutter from our physical and digital spaces, we can reduce stress and increase focus.
    `,
    category: "Lifestyle",
    date: "2024-02-28",
    author: "Alice Cooper",
    image: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 5,
    title: "Digital Nomad Tips",
    excerpt: "Working from anywhere in the world is a dream for many. Here is how to make it a reality.",
    content: `
      The digital nomad lifestyle offers freedom and adventure, but it also comes with unique challenges. 
      From finding reliable internet to managing time zones, preparation is key.
    `,
    category: "Lifestyle",
    date: "2024-02-20",
    author: "Bob Wilson",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 6,
    title: "React Hooks Deep Dive",
    excerpt: "Go beyond the basics of useEffect and useState to build custom hooks for your logic.",
    content: `
      Hooks were introduced in React 16.8 and they completely changed how we write functional components. 
      Custom hooks allow you to extract component logic into reusable functions.
    `,
    category: "Tech",
    date: "2024-02-15",
    author: "Jane Doe",
    image: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&q=80&w=800",
  }
];

export const categories = ["All", "Tech", "Design", "Lifestyle"];
