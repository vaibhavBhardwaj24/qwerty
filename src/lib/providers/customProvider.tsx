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
  workId: string;
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
  setWorkId: Dispatch<SetStateAction<string>>;
  setDisabled: Dispatch<SetStateAction<boolean>>;
}

// Create the context with a default value of null
export const CustomContext = createContext<CustomContextType | null>(null);

// Create the provider component
export const CustomProvider = ({ children }: { children: ReactNode }) => {
  const [disabled, setDisabled] = useState(true);
  const [workId, setWorkId] = useState("");
  const [loading, setLoading] = useState(true);
  console.log(loading);

  return (
    <CustomContext.Provider
      value={{ workId, setWorkId, disabled, setDisabled, loading, setLoading }}
    >
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
