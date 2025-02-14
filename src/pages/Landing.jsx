import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "./header";

const Landing = () => {
  const navigate = useNavigate();

  const handleProductClick = () => {
    navigate("/product-info");
  };

  return (
    <div>
      <Header/>
      <div className="product-container" onClick={handleProductClick}>
        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            className={`product ${index === 1 ? "selected" : ""}`}
          ></div>
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
  }
  .selected {
    border: 3px solid blue;
  }
`;

const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);
