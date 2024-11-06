import React, { createContext, useContext, useState } from 'react';

const FontSizeContext = createContext({
  customFontSize: 16, 
  setSmall: () => {},
  setMedium: () => {},
  setLarge: () => {},
});

export const useFontSize = () => useContext(FontSizeContext);

export const FontSizeProvider = ({ children }) => {
  const [customFontSize, setFontSize] = useState(16); 

  const setSmall = () => setFontSize(12);
  const setMedium = () => setFontSize(16);
  const setLarge = () => setFontSize(20);

  return (
    <FontSizeContext.Provider value={{ customFontSize, setSmall, setMedium, setLarge }}>
      {children}
    </FontSizeContext.Provider>
  );
};