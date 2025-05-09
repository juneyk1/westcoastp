import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./header";
import supabaseClient from "../services/supabaseClient";

const Landing = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);

  // Fetch products from Supabase on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabaseClient
        .from("products")
        .select("name, description, image");
      
      if (error) {
        console.error("Error fetching products:", error);
      } else {
        setProducts(data);
      }
    };

    fetchProducts();
  }, []);

  const handleProductClick = (name) => {
    // Navigate to a product info page 
    navigate(`/products/${name}`);
  };

  return (
    <div>
      <Header />
      <div className="product-container">
      {products.map((product, index) => (
  <div
    key={product.name} // use `product.name` if `product.id` is not available
    className={`product ${index === 1 ? "selected" : ""}`}
    onClick={() => handleProductClick(product.name)}
  >
    <img
      src={product.image}
      alt={product.name}
      className="product-image"
    />
    <p className="product-name">{product.name}</p>
  </div>
))}
      </div>
    </div>
  );
};

export default Landing;


const styles = `
  .product-container {
    display: flex;
    justify-content: center;
    margin-top: 30px;
    gap: 20px;
    overflow-x: auto;
    padding: 20px;
  }
  .product {
    width: 150px;
    height: 200px;
    background: lightgray;
    border-radius: 10px;
    position: relative;
  }
  .product-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 10px;
  }
  .selected {
    border: 3px solid blue;

  }
  .product-name {
    text-align: center;
    margin-top: 8px;
    font-weight: bold;
    font-size: 16px;
  }

`;

const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);