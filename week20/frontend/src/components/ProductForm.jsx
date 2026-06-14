import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "../api/axiosInstance";
import { Upload, X, Plus, AlertCircle, Trash2, CheckCircle2 } from "lucide-react";

export default function ProductForm({ initialProduct, onSave, onCancel }) {
  const isEditMode = !!initialProduct;
  
  // Fields state
  const [name, setName] = useState(initialProduct?.name || "");
  const [description, setDescription] = useState(initialProduct?.description || "");
  const [price, setPrice] = useState(initialProduct?.price || "");
  const [stock, setStock] = useState(initialProduct?.stock || "");
  const [category, setCategory] = useState(initialProduct?.category || "");
  
  // Dropdown options
  const [categories, setCategories] = useState([]);
  
  // Files to upload
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  
  // Existing images (in edit mode)
  const [existingImages, setExistingImages] = useState(initialProduct?.images || []);
  
  // UI States
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  const fileInputRef = useRef(null);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await axiosInstance.get("/categories/");
        // Results are usually paginated, check structure
        const data = response.data.results || response.data;
        setCategories(data);
      } catch (err) {
        console.error("Failed to load categories:", err);
        setErrorMsg("Failed to load categories. Please refresh the page.");
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Update previews when selected files change
  useEffect(() => {
    if (selectedFiles.length === 0) {
      setPreviews([]);
      return;
    }

    const objectUrls = selectedFiles.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));
    setPreviews(objectUrls);

    // Free memory when component unmounts or selectedFiles change
    return () => {
      objectUrls.forEach((obj) => URL.revokeObjectURL(obj.url));
    };
  }, [selectedFiles]);

  const handleFileChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);
    }
  };

  const removeSelectedFile = (indexToRemove) => {
    setSelectedFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const deleteExistingImage = async (imageId) => {
    if (!window.confirm("Are you sure you want to delete this image?")) return;
    
    try {
      setLoading(true);
      await axiosInstance.delete(`/product-images/${imageId}/`);
      setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
      setSuccessMsg("Image deleted successfully.");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error("Failed to delete image:", err);
      setErrorMsg("Failed to delete existing image.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    // Validations
    if (!name.trim()) return setErrorMsg("Product name is required.");
    if (!category) return setErrorMsg("Please select a category.");
    if (parseFloat(price) <= 0 || isNaN(parseFloat(price))) return setErrorMsg("Price must be a positive number.");
    if (parseInt(stock) < 0 || isNaN(parseInt(stock))) return setErrorMsg("Stock cannot be negative.");
    if (!description.trim()) return setErrorMsg("Product description is required.");

    try {
      setLoading(true);
      
      const productData = {
        name,
        category: parseInt(category),
        price: parseFloat(price),
        stock: parseInt(stock),
        description,
      };

      let savedProduct;
      
      if (isEditMode) {
        // Edit product metadata
        const response = await axiosInstance.patch(`/products/${initialProduct.id}/`, productData);
        savedProduct = response.data;
      } else {
        // Create product
        const response = await axiosInstance.post("/products/", productData);
        savedProduct = response.data;
      }

      // Upload files if any are selected
      if (selectedFiles.length > 0) {
        const formData = new FormData();
        formData.append("product", savedProduct.id);
        
        selectedFiles.forEach((file) => {
          formData.append("image", file);
        });

        // Set initial progress
        setUploadProgress(1);

        // Do NOT set Content-Type — let the browser set it automatically
        // so that the multipart boundary string is included correctly
        await axiosInstance.post("/product-images/", formData, {
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              // Limit to 99% until server responds complete
              setUploadProgress(Math.min(percentCompleted, 99));
            }
          },
        });
        
        setUploadProgress(100);
        setTimeout(() => setUploadProgress(0), 1500);
      }

      setSuccessMsg(isEditMode ? "Product updated successfully!" : "Product created successfully!");
      
      // Clear files
      setSelectedFiles([]);
      
      // Delay callback to show success message briefly
      setTimeout(() => {
        onSave();
      }, 1000);

    } catch (err) {
      console.error("Error saving product:", err);
      const serverError = err.response?.data;
      if (serverError) {
        // Extract first error string if multiple
        const messages = Object.entries(serverError).map(([key, val]) => `${key}: ${Array.isArray(val) ? val[0] : val}`);
        setErrorMsg(messages.join(" | "));
      } else {
        setErrorMsg("An error occurred while saving the product.");
      }
      setUploadProgress(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full max-w-2xl mx-auto bg-white p-8 rounded-2xl border border-slate-100 shadow-xl">
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <h3 className="text-xl font-bold text-slate-800">
          {isEditMode ? "Edit Product" : "Add New Product"}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-500 flex items-start gap-3 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 flex items-start gap-3 text-sm">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Grid Inputs */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Name */}
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase font-bold tracking-wider text-slate-400">Product Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Wireless Charger"
            className="px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-300 transition-all text-slate-700 bg-slate-50 focus:bg-white text-sm"
          />
        </div>

        {/* Category */}
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase font-bold tracking-wider text-slate-400">Category</label>
          {categoriesLoading ? (
            <div className="h-11 bg-slate-100 rounded-xl animate-pulse"></div>
          ) : (
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-300 transition-all text-slate-700 bg-slate-50 focus:bg-white text-sm"
            >
              <option value="">Select a Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Price */}
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase font-bold tracking-wider text-slate-400">Price (INR)</label>
          <input
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g. 799.00"
            className="px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-300 transition-all text-slate-700 bg-slate-50 focus:bg-white text-sm"
          />
        </div>

        {/* Stock */}
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase font-bold tracking-wider text-slate-400">Stock Quantity</label>
          <input
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            placeholder="e.g. 25"
            className="px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-300 transition-all text-slate-700 bg-slate-50 focus:bg-white text-sm"
          />
        </div>
      </div>

      {/* Description */}
      <div className="flex flex-col gap-2">
        <label className="text-xs uppercase font-bold tracking-wider text-slate-400">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Detailed description of the product features..."
          rows="4"
          className="px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-indigo-300 transition-all text-slate-700 bg-slate-50 focus:bg-white text-sm leading-relaxed"
        />
      </div>

      {/* Existing Images (Edit Mode) */}
      {isEditMode && existingImages.length > 0 && (
        <div className="flex flex-col gap-3">
          <label className="text-xs uppercase font-bold tracking-wider text-slate-400">Current Images</label>
          <div className="flex flex-wrap gap-4">
            {existingImages.map((img) => {
              // Build absolute URL for the image src
              const rawSrc = img.thumbnail || img.image;
              const imgSrc = rawSrc && rawSrc.startsWith("http")
                ? rawSrc
                : `http://127.0.0.1:8000${rawSrc}`;
              return (
                <div key={img.id} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-slate-200">
                  <img
                    src={imgSrc}
                    alt="Product"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/150?text=Img"; }}
                  />
                  <button
                    type="button"
                    onClick={() => deleteExistingImage(img.id)}
                    className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-5 h-5 text-red-400" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Image File Selector */}
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <label className="text-xs uppercase font-bold tracking-wider text-slate-400">
            Upload New Images
          </label>
          <button
            type="button"
            onClick={async () => {
              try {
                const response = await fetch("/test.png");
                const blob = await response.blob();
                const file = new File([blob], "test_image.png", { type: "image/png" });
                setSelectedFiles((prev) => [...prev, file]);
              } catch (err) {
                console.error("Failed to load mock image:", err);
              }
            }}
            id="mock-upload-btn"
            className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg font-semibold transition-colors"
          >
            Add Demo Image
          </button>
        </div>
        
        {/* Drag Drop Area */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-200 hover:border-indigo-300 cursor-pointer rounded-2xl p-6 flex flex-col items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100/50 transition-all text-slate-400 group"
        >
          <Upload className="w-8 h-8 text-slate-400 group-hover:text-indigo-600 transition-colors" />
          <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-800 transition-colors">
            Click to select files
          </span>
          <span className="text-xs text-slate-400">Support JPEG, PNG up to 5MB</span>
          <input
            type="file"
            multiple
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Selected Previews */}
        {previews.length > 0 && (
          <div className="flex flex-wrap gap-4 mt-2">
            {previews.map((preview, index) => (
              <div key={index} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 shadow-sm animate-in">
                <img
                  src={preview.url}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeSelectedFile(index)}
                  className="absolute top-1 right-1 p-0.5 bg-black/60 hover:bg-red-600 text-white rounded-full transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {uploadProgress > 0 && (
        <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden border border-slate-200">
          <div
            className="bg-indigo-600 h-full rounded-full transition-all duration-300 ease-out flex items-center justify-end pr-2 text-[10px] text-white font-bold"
            style={{ width: `${uploadProgress}%` }}
          >
            {uploadProgress}%
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 border-t border-slate-100 pt-6 mt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-sm transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-100 flex items-center gap-2 transition-all disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Saving...
            </>
          ) : (
            isEditMode ? "Update Product" : "Create Product"
          )}
        </button>
      </div>
    </form>
  );
}
