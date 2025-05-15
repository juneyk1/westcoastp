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
/* Import a clean professional font */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@500;700&display=swap');

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #1B2F45 ;
  color: white;
  padding: 16px 40px;
  font-family: 'Inter', sans-serif;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  animation: fadeInDown 0.5s ease-out;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.nav-left, .nav-right {
  display: flex;
  gap: 25px;
}

.nav-left span, .nav-right span {
  cursor: pointer;
  position: relative;
  transition: color 0.3s ease;
}

.nav-left span::after, .nav-right span::after {
  content: "";
  position: absolute;
  width: 0%;
  height: 2px;
  bottom: -4px;
  left: 0;
  background-color: white;
  transition: width 0.3s ease;
}

.nav-left span:hover, .nav-right span:hover {
  color: #e0f2f1;
}

.nav-left span:hover::after,
.nav-right span:hover::after {
  width: 100%;
}

.logo {
  font-size: 32px;
  font-weight: 700;
  letter-spacing: 2px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.logo:hover {
  transform: scale(1.1);
}


  .logo {
    align-self: center;
  }
  }`;

const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);