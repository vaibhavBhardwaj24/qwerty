"use client";
import {
  createContext,
  Dispatch,
  SetStateAction,
  ReactNode,
  useContext,
  useState,
  useRef,
  useEffect,
} from "react";

interface CustomContextType {
  disabled: boolean;
  workId: string;
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
  setWorkId: Dispatch<SetStateAction<string>>;
  setDisabled: (value: boolean) => void;
}

export const CustomContext = createContext<CustomContextType | null>(null);

export const CustomProvider = ({ children }: { children: ReactNode }) => {
  const [workId, setWorkId] = useState("");
  const [loading, setLoading] = useState(true);
  const [disabled, setDisabled] = useState(true);

  return (
    <CustomContext.Provider
      value={{
        workId,
        setWorkId,
        disabled,
        setDisabled,
        loading,
        setLoading,
      }}
    >
      {children}
    </CustomContext.Provider>
  );
};
export const useCustomContext = () => {
  const context = useContext(CustomContext);
  if (!context) {
    throw new Error("useCustomContext must be used within a CustomProvider");
  }
  return context;
};
