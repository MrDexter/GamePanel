import { createContext, useContext } from "react";

// Define what the "Cloud" contains
interface AuthContextType {
  user: any;
  setUser: (user: any) => void;
  logout: () => void;
  perms: any;
  setPerms: (perms: any) => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
};