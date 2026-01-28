import React, { useState } from 'react';
import './AsyncImage.css';

const AsyncImage = ({ src, alt, className, style }) => {
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        <div className={`async-img-wrapper ${className || ''}`} style={{ position: 'relative', overflow: 'hidden', ...style }}>
            {/* Skeleton Loader */}
            {!isLoaded && (
                <div className="skeleton-loader" style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 1
                }}></div>
            )}

            {/* Actual Image */}
            <img
                src={src}
                alt={alt}
                onLoad={() => setIsLoaded(true)}
                className={className} /* Pass class to img tag as well if needed, or handle via wrapper */
                style={{
                    opacity: isLoaded ? 1 : 0,
                    transition: 'opacity 0.5s ease-in-out',
                    width: '100%',
                    height: '100%',
                    display: 'block',
                    objectFit: 'cover'
                }}
            />
        </div>
    );
};

export default AsyncImage;
