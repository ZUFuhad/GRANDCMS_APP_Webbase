import React, { useState, useEffect } from 'react';
import grandLogoPng from '../assets/grand-logo.png';

interface GrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'gold' | 'white' | 'dark';
  showTagline?: boolean;
  onClick?: () => void;
}

export const GrandLogo: React.FC<GrandLogoProps> = ({
  className = '',
  size = 'md',
  onClick,
}) => {
  const [logoSrc, setLogoSrc] = useState<string>(() => {
    return localStorage.getItem('grand_custom_logo') || grandLogoPng;
  });

  useEffect(() => {
    const handleUpdate = () => {
      const custom = localStorage.getItem('grand_custom_logo');
      setLogoSrc(custom || grandLogoPng);
    };

    window.addEventListener('grand-logo-changed', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('grand-logo-changed', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const pixelHeights = {
    sm: 52,
    md: 75,
    lg: 105,
    xl: 140,
  };

  const pixelWidths = {
    sm: 140,
    md: 200,
    lg: 280,
    xl: 360,
  };

  return (
    <div
      onClick={onClick}
      className={`inline-flex flex-col items-center justify-center select-none ${onClick ? 'cursor-pointer hover:opacity-95 transition' : ''} ${className}`}
    >
      <img
        src={logoSrc}
        alt="Grand Communication & Marketing Logo"
        style={{
          height: `${pixelHeights[size]}px`,
          maxHeight: `${pixelHeights[size]}px`,
          width: 'auto',
          maxWidth: `${pixelWidths[size]}px`,
          objectFit: 'contain',
          display: 'block',
        }}
        className="w-auto drop-shadow-sm select-none"
        loading="eager"
        onError={(e) => {
          const target = e.currentTarget;
          if (target.src !== window.location.origin + '/grand-logo.png') {
            target.src = './grand-logo.png';
          }
        }}
      />
    </div>
  );
};
