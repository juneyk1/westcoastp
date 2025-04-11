import React, { useEffect, useState } from "react";
import Header from './header';
import "./ProductInfo.css";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {supabaseClient} from "../services/supabaseClient";


const ProductInfo = () => {
  const { productName } = useParams();
  console.log(productName);
  const [product, setProduct] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data, error } = await supabaseClient
        .from("products")
        .select()
        .eq('name', productName);
        if (error) throw error;
        setProduct(data[0]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, []);

  if (error) return <p>Error: {error}</p>;
  if (!product) return <p>Product not found.</p>;

  const [cartMessage, setCartMessage] = useState("");

  const handleAddToCart = () => {
    setCartMessage("Product added to cart!");
  };

  const navigate = useNavigate();

  return (
    <div className="product-info-page">
      <Header />
      <div className="product-container">
        <div className="img-container">
          <img
            src={product.image}
            alt={product.name}
            className="product-image"
          />
        </div>
        <div className="product-more">
          <div className="product-details">
            <p
              style={{
                fontSize: "20px",
                paddingTop: "5px",
                paddingBottom: "5px",
              }}
            >
              {product.name}
            </p>
            <p
              style={{
                fontSize: "14px",
                paddingTop: "5px",
                paddingBottom: "5px",
              }}
            >
              {product.description}
            </p>
            <p
              style={{
                fontSize: "18px",
                paddingTop: "5px",
                paddingBottom: "5px",
              }}
            >
              Unit Price:
              <span
                style={{
                  textDecoration: "line-through",
                  paddingRight: "10px",
                  paddingLeft: "10px",
                }}
              >
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
      <div className="quantity">
        <span style={{ fontSize: "20px" }}>Quantity: </span>
        <span>
          <button onClick={null} className="qty-button">
            -
          </button>
        </span>
        <span style={{ fontSize: "20px" }}>1</span>
        <span>
          <button onClick={null} className="qty-button">
            +
          </button>
        </span>
      </div>
      <div className="related-products">
        <p style={{ fontSize: "20px", textAlign: "left" }}>Related Products</p>
        <div className="relproduct-container">
          {[...Array(2)].map((_, index) => (
            <div key={index} className="product"></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductInfo;
