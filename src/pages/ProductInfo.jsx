import React, { useEffect, useState, useCallback } from "react";
import Header from "./header";
import "./ProductInfo.css";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { supabaseClient } from "../services/supabaseClient";
import Appendices from "./Appendices";

const ProductInfo = () => {
  const { productName } = useParams();
  const { items, setItems } = useCart(); 
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartMessage, setCartMessage] = useState("");
  const navigate = useNavigate();

  const fetchProduct = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: supabaseError } = await supabaseClient
        .from("products")
        .select("*")
        .eq("name", productName)
        .single();

      if (supabaseError) throw supabaseError;
      if (!data) throw new Error("Product not found");

      setProduct(data);
    } catch (err) {
      setError(err.message);
      console.error("Failed to fetch product:", err);
    } finally {
      setLoading(false);
    }
  }, [productName]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleAddToCart = useCallback(() => {
    if (!product) return;

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) => item.sku === product.id
      );

      if (existingIndex >= 0) {
        const updatedItems = [...prevItems];
        updatedItems[existingIndex] = {
          ...updatedItems[existingIndex],
          quantity: updatedItems[existingIndex].quantity + 1,
        };
        return updatedItems;
      } else {
        return [
          ...prevItems,
          {
            sku: product.id,
            name: product.name,
            image: product.image,
            description: product.description,
            price: product.target,
            ogPrice: product.ASP,
            quantity: 1,
            shippingDate: product.shippingDate || null,
            seller: product.seller || null,
          },
        ];
      }
    });

    setCartMessage("Product added to cart!");
    const timer = setTimeout(() => setCartMessage(""), 3000);
    return () => clearTimeout(timer); // Cleanup on unmount
  }, [product, setItems]);

  if (loading) {
    return (
      <div className="product-info-page">
        <Header />
        <div className="loading-container">
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-info-page">
        <Header />
        <div className="error-container">
          <p>Error: {error}</p>
          <button onClick={() => navigate(-1)} className="back-button">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-info-page">
        <Header />
        <div className="not-found-container">
          <p>Product not found.</p>
          <button onClick={() => navigate(-1)} className="back-button">
            Go Back
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="product-info-page">
      <Header />
      <div className="product-container">
        <div className="img-container">
          <img src={product.image} alt={product.name} className="product-info-image" />
        </div>
        <div className="product-more">
          <div className="product-details">
            <p style={{ fontSize: "20px", padding: "5px 0" }}>{product.name}</p>
            <p style={{ fontSize: "14px", padding: "5px 0" }}>{product.description}</p>
            <p style={{ fontSize: "18px", padding: "5px 0" }}>
              Unit Price:
              <span style={{ textDecoration: "line-through", padding: "0 10px" }}>
                ${product.ASP}.00
              </span>
              <span>${product.target}.00</span>
            </p>
          </div>
          <button onClick={handleAddToCart} className="add-to-cart">
            Add to Cart
          </button>
          {cartMessage && <p className="cart-message">{cartMessage}</p>}
        </div>
      </div>
      <Appendices/>
    </div>
  );
};

export default ProductInfo;