import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./header";
import Appendices from "./Appendices";
import { supabaseClient } from "../services/supabaseClient";

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
    <div className="landing-container">
      <Header />
      <div className="product-container">
        {products.length > 0 ? (
          products.map((product, index) => (
            <div
              key={product.id}
              className={`product ${index === 1 ? "selected" : ""}`}
              onClick={() => handleProductClick(product.name)}
            >
              {/* Render the product image */}
              <img
                src={product.image}
                alt={product.name}
                className="product-image"
              />
              {/* display more product details if needed:
                  <h2>{product.name}</h2>
                  <p>ASP: {product.ASP}</p>
                  <p>Target: {product.target}</p>
                  <p>{product.description}</p>
              */}
            </div>
          ))
        ) : (
          <p>No products found.</p>
        )}
      </div>
      <Appendices />
    </div>
  );
};

export default Landing;

/* ----------------------------------
   Dynamically inject your CSS styles
---------------------------------- */
const styles = `
  .landing-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;    
  }
  .product-container {
    display: flex;
    justify-content: center;
    margin-top: 30px;
    gap: 20px;
    overflow-x: auto;
    padding: 20px;
    flex: 1; 
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
`;

const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);
