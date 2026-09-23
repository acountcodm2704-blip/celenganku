import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./components/Login";
import Home from "./components/Home";
import AddCelengan from "./components/AddCelengan";
import CelenganDetail from "./components/CelenganDetail";
import EditCelengan from "./components/EditCelengan";
import RekeningList from "./components/RekeningList";
import AddRekening from "./components/AddRekening";
import RekeningDetail from "./components/RekeningDetail";
import Ringkasan from "./components/Ringkasan";

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
      <Route path="/tambah" element={<PrivateRoute><AddCelengan /></PrivateRoute>} />
      <Route path="/celengan/:id" element={<PrivateRoute><CelenganDetail /></PrivateRoute>} />
      <Route path="/celengan/:id/edit" element={<PrivateRoute><EditCelengan /></PrivateRoute>} />
      <Route path="/rekening" element={<PrivateRoute><RekeningList /></PrivateRoute>} />
      <Route path="/rekening/tambah" element={<PrivateRoute><AddRekening /></PrivateRoute>} />
      <Route path="/rekening/:id" element={<PrivateRoute><RekeningDetail /></PrivateRoute>} />
      <Route path="/ringkasan" element={<PrivateRoute><Ringkasan /></PrivateRoute>} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}