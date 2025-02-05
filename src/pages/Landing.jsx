import React from "react";

const Landing = () => {
  return (
    <div>
      <nav className="navbar">
        <div className="nav-left">
          <span>About</span>
          <span>Shop</span>
        </div>
        <div className="logo">MADO</div>
        <div className="nav-right">
          <span>Account</span>
          <span>Login</span>
          <span>Bag</span>
        </div>
      </nav>

      <div className="product-container">
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
  body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 0;
    text-align: center;
  }
  .navbar {
    display: flex;
    justify-content: space-between;
    padding: 15px 30px;
    font-size: 18px;
  }
  .nav-left, .nav-right {
    display: flex;
    gap: 20px;
  }
  .logo {
    font-size: 28px;
    font-weight: bold;
  }
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
