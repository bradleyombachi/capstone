import React, { createContext, useContext, useState } from 'react';

const FontSizeContext = createContext({
  customFontSize: 'md', 
  setSmall: () => {},
  setMedium: () => {},
  setLarge: () => {},
});

export const useFontSize = () => useContext(FontSizeContext);

export const FontSizeProvider = ({ children }) => {
  const [customFontSize, setFontSize] = useState('md'); 

  const setSmall = () => setFontSize('sm');
  const setMedium = () => setFontSize('md');
  const setLarge = () => setFontSize('lg');

  return (
    <FontSizeContext.Provider value={{ customFontSize, setSmall, setMedium, setLarge }}>
      {children}
    </FontSizeContext.Provider>
  );
};
