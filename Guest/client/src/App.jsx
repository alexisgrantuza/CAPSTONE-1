import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import QRGenerator from "./components/QRGenerator";
import AdminDashboard from "./pages/AdminDashboard";
import RoomManagement from "./pages/RoomManagement";
import RoomView from "./pages/RoomView";
import Login from "./pages/Login";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import RoomEntry from "./pages/RoomEntry";

function App() {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<RoomEntry />} />
          <Route path="room/:code" element={<QRGenerator />} />
          <Route path="admin" element={<Login />} />
          <Route
            path="admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/management"
            element={
              <ProtectedRoute>
                <RoomManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/rooms/:id"
            element={
              <ProtectedRoute>
                <RoomView />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
