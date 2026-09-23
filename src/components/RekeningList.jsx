import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { getJenisInfo } from "../utils/jenisRekening";
import Sidebar from "./Sidebar";
import ProfileMenu from "./ProfileMenu";

export default function RekeningList() {
  const { user, logout } = useAuth();
  const [rekeningList, setRekeningList] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "rekening"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRekeningList(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, [user.uid]);

  const totalHarta = rekeningList.reduce((sum, r) => sum + r.saldo, 0);

  return (
    <div className="min-h-screen px-4 py-6 md:px-10" style={{ background: "var(--bg)" }}>
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold"> Rekening</h1>
          </div>
          <div className="flex items-center gap-3">
            <ProfileMenu />
            <button onClick={logout} className="nb-btn px-4 py-2 text-sm" style={{ background: "var(--red)" }}>
              Keluar
            </button>
          </div>
        </div>

        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="nb-card p-5 mb-6 text-center" style={{ background: "var(--yellow)" }}>
          <p className="text-sm font-bold mb-1">Total Harta</p>
          <p className="text-3xl font-bold">Rp{totalHarta.toLocaleString("id-ID")}</p>
        </div>

        <Link
          to="/rekening/tambah"
          className="nb-btn block text-center py-4 mb-6 text-lg"
          style={{ background: "var(--green)" }}
        >
          + Tambah Rekening
        </Link>

        {rekeningList.length === 0 && (
          <div className="nb-card p-8 text-center" style={{ background: "var(--white)" }}>
            <p>Belum ada rekening. Catat sumber uangmu di sini!</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rekeningList.map((r) => {
            const jenisInfo = getJenisInfo(r.jenis);
            return (
              <Link
                key={r.id}
                to={`/rekening/${r.id}`}
                className="nb-card p-4 flex items-center gap-3 hover:-translate-y-1 transition-transform"
                style={{ background: "var(--white)" }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: "var(--blue)", border: "2px solid black" }}
                >
                  {jenisInfo.emoji}
                </div>
                <div className="min-w-0">
                  <p className="font-bold truncate">{r.nama}</p>
                  <p className="text-xs opacity-70 mb-1">{jenisInfo.label}</p>
                  <p className="font-bold text-sm">Rp{r.saldo.toLocaleString("id-ID")}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}