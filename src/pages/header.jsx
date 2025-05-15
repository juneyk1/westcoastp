import React from "react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  const handleCartClick = () => {
    navigate("/checkout");
  };

  const handleAbtClick = () => {
    navigate("/about");
  };

  const handleShopClick = () => {
    navigate("/");
  }

  const handleAccountClick = () => {
    navigate("/Account");
  }

  return (
    <div>
      <nav className="navbar">
        <div className="nav-left">
          <span onClick={handleAbtClick}>About</span>
          <span onClick={handleShopClick}>Shop</span>
        </div>
        <div onClick={handleShopClick} className="logo">WCPA</div>
        <div className="nav-right">
          <span onClick ={handleAccountClick}>Account</span>
          <span onClick={handleCartClick}>Bag</span>
        </div>
      </nav>
    </div>
  );
};

export default Header;

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
    align-self: center;
  }`;

const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);