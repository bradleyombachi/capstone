import React, { createContext, useState, useContext } from 'react';

const ColorContext = createContext();

export const ColorProvider = ({ children }) => {
  const [colorHex, setColorHex] = useState('#1abc9c');

  return (
    <ColorContext.Provider value={{ colorHex, setColorHex }}>
      {children}
    </ColorContext.Provider>
  );
};

export const useColor = () => useContext(ColorContext);
