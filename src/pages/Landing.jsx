import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./header";
import supabase from "../supabaseClient";

const Landing = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
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
    navigate(`/products/${name}`);
  };

  // Filter products based on the search term
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <Header />
      <div className="hero-section">
        <h1>Trusted Medical Supplies for Healthcare Professionals</h1>
        <p>Explore wholesale tools and equipment, delivered fast and reliably.</p>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="product-section">
        <h2>Featured Products</h2>
        <div className="product-container">
          {filteredProducts.length === 0 ? (
            <p style={{ textAlign: "center" }}>No products found.</p>
          ) : (
            filteredProducts.map((product) => (
              <div
                key={product.name}
                className="product-card"
                onClick={() => handleProductClick(product.name)}
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="product-image"
                />
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// Your styles remain the same
const styles = `
  body {
    margin: 0;
    font-family: 'Poppins', sans-serif;
    background: #f6f9fc;
    color: #333;
  }

  .hero-section {
    background: linear-gradient(to right, #e0f7fa, #e8f0fe);
    padding: 60px 20px;
    text-align: center;
  }

  .hero-section h1 {
    font-size: 36px;
    margin-bottom: 10px;
    color: #2d3748;
  }

  .hero-section p {
    font-size: 18px;
    color: #4a5568;
    margin-bottom: 20px;
  }

  .shop-button {
    background-color: #3182ce;
    color: white;
    padding: 12px 28px;
    font-size: 16px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.3s ease;
  }

  .shop-button:hover {
    background-color: #2b6cb0;
  }

  .product-section {
    padding: 40px 20px;
    max-width: 1200px;
    margin: 0 auto;
  }

  .product-section h2 {
    text-align: center;
    font-size: 28px;
    margin-bottom: 30px;
    color: #2c5282;
  }

  .product-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 30px;
  }

  .product-card {
    width: 250px;
    background: #ffffff;
    border-radius: 10px;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.05);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    cursor: pointer;
    overflow: hidden;
    display: flex;
    flex-direction: column;

  }



  .product-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  }

  .product-image {
    width: 100%;
    height: 180px;
    object-fit: cover;
  }

  .product-info {
    padding: 16px;
  }

  .product-info h3 {
    font-size: 18px;
    color: #2d3748;
    margin-bottom: 8px;
  }

  .product-info p {
    font-size: 14px;
    color: #4a5568;
  }

  .search-bar {
    text-align: center;
    margin: 20px auto;
  }

  .search-bar input {
    padding: 10px 15px;
    width: 300px;
    border-radius: 6px;
    border: 1px solid #ccc;
    font-size: 16px;
  }
  .hero-section h1, .hero-section p {
    animation: fadeIn 1s ease-out;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default Landing;
