import React from 'react';

const Input = ({ 
  type = 'text',
  placeholder,
  value,
  onChange,
  name,
  className = '',
  required = false 
}) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      name={name}
      className={`common-input ${className}`}
      required={required}
    />
  );
};

export default Input; 