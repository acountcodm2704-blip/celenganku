import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  const handleLogin = async () => {
    try {
      await login();
    } catch (err) {
      console.error("Login error:", err);
      alert("Gagal login. Coba lagi.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen overflow-hidden px-4" style={{ background: "var(--bg)" }}>
      <div className="nb-card p-8 md:p-10 w-full max-w-sm text-center no-select"
  style={{ background: "var(--yellow)" }}>
        <div className="text-5xl mb-3">🪙</div>
        <h1 className="text-3xl font-bold mb-1">Celenganku</h1>
        <p className="text-sm mb-8">Nabung sambil lihat progresmu</p>
        <button
          onClick={handleLogin}
          className="nb-btn w-full py-3 px-4 flex items-center justify-center gap-2"
          style={{ background: "var(--white)" }}
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
          Sign in with Google
        </button>
      </div>
    </div>
  );
}