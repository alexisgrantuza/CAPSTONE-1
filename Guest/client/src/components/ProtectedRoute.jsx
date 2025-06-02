import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../utils/axios";

const ProtectedRoute = ({ children }) => {
  const [isValidating, setIsValidating] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        setIsValidating(false);
        return;
      }

      try {
        await api.get("/auth/validate");
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem("adminToken");
        setIsAuthenticated(false);
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, []);

  if (isValidating) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
