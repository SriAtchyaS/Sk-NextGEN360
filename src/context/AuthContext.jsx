import { createContext, useContext, useState } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext(null);

// Decode JWT payload without any library — JWT is base64url encoded
const decodeJWT = (token) => {
  try {
    const base64 = token.split(".")[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const json = atob(base64);
    return JSON.parse(json); // { id: 3, role: "manager", iat: ..., exp: ... }
  } catch {
    return {};
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user")); }
    catch { return null; }
  });
  const [loading, setLoading] = useState(false);

  // POST /api/auth/login → { token, role, name }
  // JWT payload: { id, role }  ← we decode this to get the user's numeric DB id
  const login = async ({ email, password }) => {
    setLoading(true);
    try {
      const { data } = await authAPI.login({ email, password });

      // Decode JWT to get the numeric DB id (e.g. 3)
      const decoded = decodeJWT(data.token);

      const userData = {
        id:    decoded.id,   // ← numeric DB id — used to filter manager's freshers
        name:  data.name,
        role:  data.role,
        email,
      };

      localStorage.setItem("token", data.token);
      localStorage.setItem("user",  JSON.stringify(userData));
      setUser(userData);
      return { success: true, role: data.role };
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || "Login failed";
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
