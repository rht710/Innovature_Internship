import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import BlogList from "./pages/BlogList";
import BlogDetail from "./pages/BlogDetail";
import { About, NotFound } from "./pages/StaticPages";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<BlogList />} />
        <Route path="post/:id" element={<BlogDetail />} />
        <Route path="about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
