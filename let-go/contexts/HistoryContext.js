import { createContext, useState } from 'react';

export const HistoryContext = createContext();

export const HistoryProvider = ({ children }) => {
  const [history, setHistory] = useState([]);

  const addToHistory = (item) => {
    if (item && item.guess && item.color && item.photo && item.time) {
      setHistory(prevHistory => {
        if (prevHistory.length < 10) {
          return [...prevHistory, item];
        } else {
          return [...prevHistory.slice(1), item];
        }
      });
    }
  };
  

  const clearHistory = () => setHistory([]);

  return (
    <HistoryContext.Provider value={{ history, addToHistory, clearHistory }}>
      {children}
    </HistoryContext.Provider>
  );
};
