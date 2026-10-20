import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import StationSelection from "./pages/StationSelection";
import StationDetail from "./pages/StationDetail";
import Navigation from "./pages/Navigation";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/stations" element={<StationSelection />} />
        <Route path="/stations/:id" element={<StationDetail />} />
        <Route path="/stations/:id/navigate" element={<Navigation />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
