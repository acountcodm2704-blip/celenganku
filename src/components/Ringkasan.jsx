import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import Sidebar from "./Sidebar";
import ProfileMenu from "./ProfileMenu";

function gabungkanSemuaRiwayat(rekeningList) {
  const semua = [];
  rekeningList.forEach((r) => {
    (r.riwayat || []).forEach((item) => {
      semua.push({ ...item, sumberNama: r.nama });
    });
  });
  return semua.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
}

export default function Ringkasan() {
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
  const semuaRiwayat = gabungkanSemuaRiwayat(rekeningList);

  const bulanIni = new Date().getMonth();
  const tahunIni = new Date().getFullYear();
  const riwayatBulanIni = semuaRiwayat.filter((r) => {
    const t = new Date(r.tanggal);
    return t.getMonth() === bulanIni && t.getFullYear() === tahunIni;
  });

  const totalMasuk = riwayatBulanIni.filter((r) => r.jumlah > 0).reduce((sum, r) => sum + r.jumlah, 0);
  const totalKeluar = riwayatBulanIni.filter((r) => r.jumlah < 0).reduce((sum, r) => sum + Math.abs(r.jumlah), 0);

  return (
    <div className="min-h-screen px-4 py-6 md:px-10" style={{ background: "var(--bg)" }}>
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="nb-btn px-3 py-2" style={{ background: "var(--white)" }}>
              ☰
            </button>
            <h1 className="text-2xl md:text-3xl font-bold">Ringkasan</h1>
          </div>
          <div className="flex items-center gap-3">
            <ProfileMenu />
            <button onClick={logout} className="nb-btn px-4 py-2 text-sm" style={{ background: "var(--red)" }}>
              Keluar
            </button>
          </div>
        </div>

        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="nb-card p-5 mb-4 text-center" style={{ background: "var(--yellow)" }}>
          <p className="text-sm font-bold mb-1">Total Harta</p>
          <p className="text-3xl font-bold">Rp{totalHarta.toLocaleString("id-ID")}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="nb-card p-4 text-center" style={{ background: "var(--green)" }}>
            <p className="text-xs font-bold mb-1">Masuk Bulan Ini</p>
            <p className="text-lg font-bold">Rp{totalMasuk.toLocaleString("id-ID")}</p>
          </div>
          <div className="nb-card p-4 text-center" style={{ background: "var(--red)" }}>
            <p className="text-xs font-bold mb-1">Keluar Bulan Ini</p>
            <p className="text-lg font-bold">Rp{totalKeluar.toLocaleString("id-ID")}</p>
          </div>
        </div>

        <h2 className="font-bold text-lg mb-3">Semua Transaksi Terbaru</h2>
        <div className="space-y-2">
          {semuaRiwayat.length === 0 && (
            <div className="nb-card p-6 text-center" style={{ background: "var(--white)" }}>
              <p className="text-sm opacity-70">Belum ada transaksi tercatat.</p>
            </div>
          )}
          {semuaRiwayat.slice(0, 20).map((r, i) => (
            <div key={i} className="nb-card flex justify-between items-center px-4 py-3" style={{ background: "var(--white)" }}>
              <div>
                <p className="font-bold">{r.jumlah > 0 ? "+" : ""}Rp{r.jumlah.toLocaleString("id-ID")}</p>
                <p className="text-xs opacity-70">
                  {r.sumberNama}
                  {r.celenganNama && ` → ${r.celenganNama}`}
                </p>
              </div>
              <span className="text-xs">{new Date(r.tanggal).toLocaleDateString("id-ID")}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}