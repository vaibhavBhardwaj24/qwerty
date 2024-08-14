"use client";
import {
  createContext,
  Dispatch,
  SetStateAction,
  ReactNode,
  useContext,
  useState,
} from "react";

// Define the type for the context value
interface CustomContextType {
  disabled: boolean;
  setDisabled: Dispatch<SetStateAction<boolean>>;
}

// Create the context with a default value of null
export const CustomContext = createContext<CustomContextType | null>(null);

// Create the provider component
export const CustomProvider = ({ children }: { children: ReactNode }) => {
  const [disabled, setDisabled] = useState(true);

  return (
    <CustomContext.Provider value={{ disabled, setDisabled }}>
      {children}
    </CustomContext.Provider>
  );
};

// Create a custom hook to use the context
export const useCustomContext = () => {
  const context = useContext(CustomContext);
  if (!context) {
    throw new Error("useCustomContext must be used within a CustomProvider");
  }
  return context;
};
