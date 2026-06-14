import React from 'react';

export const ProductCard = () => {
  return (
    <div style={{ padding: '13px', borderRadius: '15px', border: '1px solid #FF4500', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
      {/* Violation: Image lacks alt attribute (accessibility) */}
      <img src="/product-image.png" />
      
      {/* Violation: Font-family is Roboto (unapproved), size 15px (unaligned) */}
      <h2 style={{ fontFamily: 'Roboto', fontSize: '15px', fontWeight: 'bold' }}>
        Premium Product
      </h2>
      
      {/* Violation: Spacing is 9px (non-modular) and color is hardcoded gray #666 */}
      <p style={{ margin: '9px', fontSize: '11px', color: '#666' }}>
        This is an unaligned product card violating modular scale rules.
      </p>
    </div>
  );
};
