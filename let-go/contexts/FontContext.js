import React, { createContext, useContext, useState } from 'react';

// Create a context with default font size and a function to update it
const FontSizeContext = createContext({
  fontSize: 'medium', // Default font size
  increaseFontSize: () => {},
  decreaseFontSize: () => {},
  setFontSize: () => {},
});

export const useFontSize = () => useContext(FontSizeContext);

export const FontSizeProvider = ({ children }) => {
  const [fontSize, setFontSize] = useState('medium'); // Default font size state

  const increaseFontSize = () => {
    setFontSize((prevSize) => {
      if (prevSize === 'small') return 'medium';
      if (prevSize === 'medium') return 'large';
      return prevSize; // If already 'large', no change
    });
  };

  const decreaseFontSize = () => {
    setFontSize((prevSize) => {
      if (prevSize === 'large') return 'medium';
      if (prevSize === 'medium') return 'small';
      return prevSize; // If already 'small', no change
    });
  };

  return (
    <FontSizeContext.Provider value={{ fontSize, increaseFontSize, decreaseFontSize, setFontSize }}>
      {children}
    </FontSizeContext.Provider>
  );
};
