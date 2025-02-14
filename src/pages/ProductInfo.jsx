import React, { useState } from 'react';
import './ProductInfo.css';
import { useNavigate } from "react-router-dom";
import Header from './header'

const ProductInfo = () => {
    // mock data
    const product = {
        image: 'src/assets/syringe.png',
        title: 'Product Name',
        description: 'These high-quality, [material type] gloves offer excellent dexterity and protection with a comfortable fit, ideal for [intended use, e.g., general handling, chemical resistance, cold weather], featuring [key features like textured grip, breathable lining, or reinforced fingertips]',
        specifications: ['Spec 1', 'Spec 2'],
        price: 5.00,
        discount: 4.00,
    };

    const [cartMessage, setCartMessage] = useState('');

    const handleAddToCart = () => {
        setCartMessage('Product added to cart!')
    };

    const navigate = useNavigate();

    return (
        <div className="product-info-page">
            <Header/>
            <div className="product-container">
                <div className="product-image">
                    <img 
                    src={product.image}
                    alt="Product"
                    />
                </div>
                <div className="product-more">
                    <div className="product-details">
                        <p style={{fontSize: '20px',  paddingTop: '5px', paddingBottom: '5px' }}>{product.title}</p>
                        <p style={{fontSize: '14px',  paddingTop: '5px', paddingBottom: '5px' }}>{product.description}</p>
                        <p style={{fontSize: '18px',  paddingTop: '5px', paddingBottom: '5px'}}>Unit Price: 
                            <span style={{textDecoration: 'line-through', paddingRight: '10px', paddingLeft: '10px'}}>${product.price}.00
                            </span>
                            <span>
                            ${product.discount}.00
                            </span>
                        </p>
                    </div>
                    <button onClick={handleAddToCart} className="add-to-cart">
                        Add to Cart
                    </button>
                    {cartMessage && <p className="cart-message">{cartMessage}</p>}
                </div>
            </div>
            <div className="quantity">
                <span style={{fontSize: '20px'}}>Quantity: </span>
                <span><button onClick={null} className="qty-button">
                    -
                </button></span>
                <span style={{fontSize: '20px'}}>1</span>
                <span><button onClick={null} className="qty-button">
                    +
                </button></span>
            </div>
            <div className="related-products">
                <p style={{fontSize: '20px', textAlign: 'left'}}>Related Products</p>
                <div className="relproduct-container">
                    {[...Array(2)].map((_, index) => (
                    <div
                        key={index}
                        className="product"
                    ></div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ProductInfo;
