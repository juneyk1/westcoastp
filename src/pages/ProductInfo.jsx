import React, { useEffect, useState } from "react";
import Header from './header';
import "./ProductInfo.css";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useCart } from "./CartContext";
import supabase from "../supabaseClient";

const ProductInfo = () => {
  const { productName } = useParams();
  const { items, setItems } = useCart(); 
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartMessage, setCartMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select()
          .eq("name", productName);

        if (error) throw error;
        if (data.length === 0) throw new Error("Product not found");
        setProduct(data[0]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productName]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!product) return <p>Product not found.</p>;

  const handleAddToCart = () => {
    const existing = items.find((item) => item.sku === product.id); // Assuming `product.id` is unique
    if (existing) {
      setItems(
        items.map((item) =>
          item.sku === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setItems([
        ...items,
        {
          sku: product.id,
          name: product.name,
          image: product.image,
          description: product.description,
          price: product.target,
          ogPrice: product.ASP,
          quantity: 1,
          shippingDate: product.shippingDate || null,
          seller: product.seller || null,
        },
      ]);
    }

    setCartMessage("Product added to cart!");
    setTimeout(() => setCartMessage(""), 3000); // clear message after 3s
  };

  return (
    <div className="product-info-page">
      <Header />
      <div className="product-container">
        <div className="img-container">
          <img src={product.image} alt={product.name} className="product-info-image" />
        </div>
        <div className="product-more">
          <div className="product-details">
            <p style={{ fontSize: "20px", padding: "5px 0" }}>{product.name}</p>
            <p style={{ fontSize: "14px", padding: "5px 0" }}>{product.description}</p>
            <p style={{ fontSize: "18px", padding: "5px 0" }}>
              Unit Price:
              <span style={{ textDecoration: "line-through", padding: "0 10px" }}>
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
    </div>
  );
};

export default ProductInfo;
