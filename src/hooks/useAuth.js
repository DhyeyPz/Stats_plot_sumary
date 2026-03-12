import { useEffect, useState } from "react";
import { getStoredToken, verifyToken } from "../lib/auth-client";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      const token = getStoredToken();

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // CALL THE BACKEND: Check if user STILL has access in the DB
        const result = await verifyToken(token);
        
        if (result && result.valid) {
          setUser(result.user);
        } else {
          localStorage.clear();
        }
      } catch (error) {
        console.error("Token verification failed:", error);
        localStorage.clear();
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, []);

  return {
    user,
    loading,
    isAuthenticated: !!user,
  };
}