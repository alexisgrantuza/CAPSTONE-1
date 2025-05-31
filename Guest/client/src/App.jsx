import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import QRGenerator from "./pages/QRGenerator";
import AdminDashboard from "./pages/AdminDashboard";
import Layout from "./components/Layout";

function App() {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<QRGenerator />} />
          <Route path="admin" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
