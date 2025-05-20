// components/ui/AnimatedBackground.tsx
import React from 'react';

const AnimatedBackground = () => {
  const squares = Array.from({ length: 10 });
  return (
    <div className="bgSquares" aria-hidden="true">
      {squares.map((_, index) => (
        <div key={index} className="square"></div>
      ))}
    </div>
  );
};
export default AnimatedBackground;