import { useState, useEffect } from 'react';

/**
 * Hook to extract dominant color from an image
 * @param {string} imageUrl - URL of the image
 * @param {string} defaultColor - Fallback color
 * @returns {object} { color, isDark }
 */
const useImageColor = (imageUrl, defaultColor = 'var(--primary-color)') => {
    const [colorData, setColorData] = useState({
        color: defaultColor,
        isDark: false
    });

    useEffect(() => {
        if (!imageUrl) return;

        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = imageUrl;

        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // Set canvas size to a small value for performance
                canvas.width = 100;
                canvas.height = 100;

                ctx.drawImage(img, 0, 0, 100, 100);

                // Get image data
                const imageData = ctx.getImageData(0, 0, 100, 100);
                const data = imageData.data;

                let r = 0, g = 0, b = 0;

                // Simply average the colors
                for (let i = 0; i < data.length; i += 4) {
                    r += data[i];
                    g += data[i + 1];
                    b += data[i + 2];
                }

                const count = data.length / 4;
                r = Math.floor(r / count);
                g = Math.floor(g / count);
                b = Math.floor(b / count);

                const dominantColor = `rgb(${r}, ${g}, ${b})`;

                // Calculate brightness to determine if dark text is needed (YIQ formula)
                const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
                const isDark = yiq < 128; // If < 128, the background is dark

                setColorData({
                    color: dominantColor,
                    isDark
                });
            } catch (e) {
                console.warn("Could not extract color from image", e);
                // Keep default
            }
        };

        img.onerror = () => {
            // Keep default
        };

    }, [imageUrl]);

    return colorData;
};

export default useImageColor;
