'use client';
import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'link' | 'success' | 'warning';
  size?: 'sm' | 'default' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactElement;
  rightIcon?: React.ReactElement;
}

const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'default',
  isLoading,
  leftIcon,
  rightIcon,
  ...props
}) => {
  let baseStyles =
    'inline-flex items-center justify-center rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150 disabled:opacity-50 disabled:pointer-events-none';

  let variantStyles = '';
  switch (variant) {
    case 'primary':
      variantStyles = 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm';
      break;
    case 'secondary':
      variantStyles =
        'bg-slate-700 text-slate-100 hover:bg-slate-600 border border-slate-600 shadow-sm';
      break;
    case 'danger':
      variantStyles = 'bg-red-600 text-white hover:bg-red-700 shadow-sm';
      break;
    case 'success':
      variantStyles = 'bg-green-600 text-white hover:bg-green-700 shadow-sm';
      break;
    case 'warning':
      variantStyles = 'bg-yellow-500 text-slate-900 hover:bg-yellow-600 shadow-sm';
      break;
    case 'ghost':
      variantStyles =
        'hover:bg-slate-700 hover:text-slate-100 text-slate-300';
      break;
    case 'link':
      variantStyles =
        'text-indigo-400 hover:text-indigo-300 underline-offset-4 hover:underline';
      break;
    default:
      variantStyles = 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm';
      break;
  }

  let sizeStyles = '';
  switch (size) {
    case 'sm':
      sizeStyles = 'h-9 px-3 text-sm';
      break;
    case 'lg':
      sizeStyles = 'h-11 px-8 text-lg';
      break;
    case 'default':
    default:
      sizeStyles = 'h-10 px-4 py-2';
      break;
  }

  const buttonContent = (
    <>
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {leftIcon && !isLoading && <span className="mr-2">{leftIcon}</span>}
      {children}
      {rightIcon && !isLoading && <span className="ml-2">{rightIcon}</span>}
    </>
  );

  return (
    <button
      className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className || ''}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {buttonContent}
    </button>
  );
};

export default Button;