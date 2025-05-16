// components/ui/Button.tsx
'use client';
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

const Button: React.FC<ButtonProps> = ({ children, className, variant = 'primary', ...props }) => {
  const baseStyles = "px-4 py-2 rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-opacity-75 transition-colors duration-150";
  
  let variantStyles = "";
  switch (variant) {
    case 'secondary':
      variantStyles = "bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-400";
      break;
    case 'danger':
      variantStyles = "bg-red-500 text-white hover:bg-red-600 focus:ring-red-400";
      break;
    case 'primary':
    default:
      variantStyles = "bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-400";
      break;
  }

  return (
    <button className={`${baseStyles} ${variantStyles} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;