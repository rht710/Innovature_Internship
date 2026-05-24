import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ProductList from "./pages/ProductList";
import ProductDetail from "./pages/ProductDetail";
import { About, NotFound } from "./pages/StaticPages";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<ProductList />} />
        <Route path="product/:id" element={<ProductDetail />} />
        <Route path="about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;

