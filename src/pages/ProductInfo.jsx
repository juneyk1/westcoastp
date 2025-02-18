import React, { useState } from "react";
import "./ProductInfo.css";
import { useNavigate } from "react-router-dom";
const ProductInfo = () => {
  // mock data
  const product = {
    image: "src/assets/syringe.png",
    title: "Product Name",
    description:
      "These high-quality, [material type] gloves offer excellent dexterity and protection with a comfortable fit, ideal for [intended use, e.g., general handling, chemical resistance, cold weather], featuring [key features like textured grip, breathable lining, or reinforced fingertips]",
    specifications: ["Spec 1", "Spec 2"],
    price: 5.0,
    discount: 4.0,
  };

  const [cartMessage, setCartMessage] = useState("");

  const handleAddToCart = () => {
    setCartMessage("Product added to cart!");
  };

  const navigate = useNavigate();

  const handleCartClick = () => {
    navigate("/checkout");
  };

  return (
    <div className="product-info-page">
      <nav className="navbar">
        <div className="nav-left">
          <span>About</span>
          <span>Shop</span>
        </div>
        <div className="logo">MADO</div>
        <div className="nav-right">
          <span>Account</span>
          <span>Login</span>
          <span onClick={handleCartClick}>Bag</span>
        </div>
      </nav>
      <div className="product-container">
        <div className="product-image">
          <img src={product.image} alt="Product" />
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
              {product.title}
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
                ${product.price}.00
              </span>
              <span>${product.discount}.00</span>
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

// const styles = `
// .navbar {
//     display: flex;
//     justify-content: space-between;
//     padding: 15px 30px;
//     font-size: 18px;
//   }
//   .nav-left, .nav-right {
//     display: flex;
//     gap: 20px;
//   }
//   .product-description-page {
//     max-width: 800px;
//     margin: 0 auto;
//     padding: 20px;
//     font-family: Arial, sans-serif;
//   }
//   .product-image {
//     flex-shrink: 0;
//     width: 350px;
//   }
//   .product-more{
//     max-width: 600px;
//     text-align: left;
//   }
//   .product-details {
//     flex: 1;
//     display: flex;
//     flex-direction: column;
//     justify-content: space-between;
//     text-align: left;
//   }
//   .add-to-cart {
//     background-color: #ADD8E6;
//     color: black;
//     border: none;
//     padding: 10px 15px;
//     font-size: 18px;
//     cursor: pointer;
//     margin-top: 10px;
//     border-radius: 20px;
//   }
//   .quantity {
//     text-align: left;
//     flex: 1;
//     display: flex;
//     padding: 20px;
//     margin-left: 20px;
//     gap: 10px;
//   }
//   .qty-button {
//     background-color: #ADD8E6;
//     color: black;
//     border: none;
//     font-size: 20px;
//     padding: 2px 10px;
//     cursor: pointer;
//     border-radius: 100%;
//   }
//   .related-products {
//     justify-content: left;
//     margin-left: 50;
//     margin-right: auto;
//   }
//   .relproduct-container {
//     display: flex;
//     justify-content: left;
//     margin-top: 10px;
//     gap: 20px;
//     overflow-x: auto;
//     padding: 20px;
//   }
//   .product {
//     width: 150px;
//     height: 200px;
//     background: lightgray;
//     border-radius: 10px;
//   }`;

// const styleSheet = document.createElement("style");
// styleSheet.type = "text/css";
// styleSheet.innerText = styles;
// document.head.appendChild(styleSheet);
