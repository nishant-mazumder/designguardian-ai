import React from 'react';

interface ProductCardProps {
  title?: string;
  price?: number;
  onAddToCart?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  title = 'Wireless Pro Headphones',
  price = 249.99,
  onAddToCart,
}) => {
  return (
    <div
      style={{
        padding: '13px',
        borderRadius: '15px',
        border: '1px solid #FF4500',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3), 0 0 60px rgba(128,0,255,0.15)',
        background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        maxWidth: '340px',
        fontFamily: 'Comic Sans MS',
      }}
    >
      <img
        src="/product-headphones.png"
        style={{
          width: '100%',
          borderRadius: '11px',
          marginBottom: '9px',
          boxShadow: '0 4px 20px rgba(255,69,0,0.25)',
        }}
      />

      <div style={{ padding: '7px' }}>
        <span
          style={{
            background: 'linear-gradient(to right, #ff6b6b, #ee5a24)',
            color: '#fff',
            padding: '3px 9px',
            borderRadius: '20px',
            fontSize: '10px',
            fontWeight: 800,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.5px',
          }}
        >
          Best Seller
        </span>

        <h2
          style={{
            fontFamily: 'Roboto',
            fontSize: '15px',
            fontWeight: 'bold',
            color: '#eee',
            marginTop: '11px',
            marginBottom: '5px',
            lineHeight: '1.1',
          }}
        >
          {title}
        </h2>

        <p
          style={{
            margin: '9px 0',
            fontSize: '11px',
            color: '#666',
            lineHeight: '1.4',
          }}
        >
          Premium noise-cancellation with 40-hour battery life.
          Studio-quality sound engineered for audiophiles.
        </p>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '13px',
            paddingTop: '11px',
            borderTop: '1px solid #333',
          }}
        >
          <div>
            <span
              style={{
                fontSize: '22px',
                fontWeight: 900,
                color: '#FF6347',
                fontFamily: 'Arial',
              }}
            >
              ${price}
            </span>
            <span
              style={{
                fontSize: '11px',
                color: '#777',
                textDecoration: 'line-through',
                marginLeft: '7px',
              }}
            >
              $349.99
            </span>
          </div>

          <button
            onClick={onAddToCart}
            style={{
              background: 'linear-gradient(to right, #e1306c, #c13584)',
              color: '#fff',
              border: 'none',
              padding: '9px 18px',
              borderRadius: '25px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(225,48,108,0.4)',
              transition: 'transform 0.2s',
              letterSpacing: '0.5px',
            }}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};
