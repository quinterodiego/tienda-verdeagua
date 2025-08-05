import React from 'react';

interface MercadoPagoIconProps {
  className?: string;
  size?: number;
}

export const MercadoPagoIcon: React.FC<MercadoPagoIconProps> = ({ 
  className = "w-5 h-5", 
  size 
}) => {
  const sizeProps = size ? { width: size, height: size } : {};
  
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      className={className}
      {...sizeProps}
    >
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 17.568c-.292.292-.677.439-1.061.439-.385 0-.769-.147-1.061-.439L12 14.122l-3.446 3.446c-.292.292-.677.439-1.061.439-.385 0-.769-.147-1.061-.439-.585-.585-.585-1.537 0-2.122L9.878 12 6.432 8.554c-.585-.585-.585-1.537 0-2.122.585-.585 1.537-.585 2.122 0L12 9.878l3.446-3.446c.585-.585 1.537-.585 2.122 0 .585.585.585 1.537 0 2.122L14.122 12l3.446 3.446c.585.585.585 1.537 0 2.122z"/>
      <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"/>
      <path fill="#00b3e6" d="M8.5 7h7c.276 0 .5.224.5.5v9c0 .276-.224.5-.5.5h-7c-.276 0-.5-.224-.5-.5v-9c0-.276.224-.5.5-.5z"/>
      <path fill="#ffffff" d="M10.5 9.5h3v1h-3v-1zm0 2h3v1h-3v-1zm0 2h2v1h-2v-1z"/>
    </svg>
  );
};

// Versión simplificada más reconocible
export const MercadoPagoSimpleIcon: React.FC<MercadoPagoIconProps> = ({ 
  className = "w-5 h-5", 
  size 
}) => {
  const sizeProps = size ? { width: size, height: size } : {};
  
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      className={className}
      {...sizeProps}
    >
      {/* Círculo azul de fondo */}
      <circle cx="12" cy="12" r="11" fill="#00A9FF"/>
      
      {/* Letra M estilizada */}
      <path 
        d="M7 8h2.5l2.5 6 2.5-6H17v8h-1.5V10.5L13 16h-2l-2.5-5.5V16H7V8z" 
        fill="white"
        stroke="white"
        strokeWidth="0.5"
      />
    </svg>
  );
};

export default MercadoPagoIcon;
