import { createContext, useState, useEffect } from "react";
import api from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setUser({ token });
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);

    const response = await api.post("/token", formData);
    const { access_token } = response.data;

    localStorage.setItem("token", access_token);
    setUser({ token: access_token });
    return true;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};