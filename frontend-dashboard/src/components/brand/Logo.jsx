import React from 'react';

const Logo = ({ size = 24, className = "" }) => {
    return (
        <svg 
            width={size} 
            height={size} 
            viewBox="0 0 32 32" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* HybridNode Neural Link Symbol */}
            <circle cx="9" cy="23" r="5" fill="currentColor" />
            <path d="M11.5 19L20.5 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M14 23.5H23" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="23" cy="7" r="4" fill="currentColor"  />
            <circle cx="26" cy="23.5" r="3" fill="currentColor"  />
        </svg>
    );
};

export default Logo;