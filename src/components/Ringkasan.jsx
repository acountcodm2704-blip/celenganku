import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  arrayRemove,
  increment,
  writeBatch,
} from "firebase/firestore";
import { ChartColumn, Menu, Trash2 } from "lucide-react";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import Sidebar from "./Sidebar";
import ProfileMenu from "./ProfileMenu";
import ConfirmModal from "./ConfirmModal";

function gabungkanSemuaRiwayat(rekeningList) {
  const semua = [];
  rekeningList.forEach((r) => {
    (r.riwayat || []).forEach((item) => {
      semua.push({
        ...item,
        sumberNama: r.nama,
        sumberId: r.id,
        asli: item,
      });
    });
  });
  return semua.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
}

export default function Ringkasan() {
  const { user, logout } = useAuth();
  const [rekeningList, setRekeningList] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // hapus satu catatan
  const [hapusTarget, setHapusTarget] = useState(null);
  const [kembalikanSaldo, setKembalikanSaldo] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // hapus semua catatan
  const [showHapusSemua, setShowHapusSemua] = useState(false);
  const [deletingSemua, setDeletingSemua] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "rekening"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRekeningList(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, [user.uid]);

  const tutupPopup = () => {
    setHapusTarget(null);
    setKembalikanSaldo(false);
  };

  const konfirmasiHapus = async () => {
    if (!hapusTarget) return;
    setDeleting(true);
    try {
      const { sumberId, asli } = hapusTarget;

      const perubahan = { riwayat: arrayRemove(asli) };
      if (kembalikanSaldo && !asli.celenganId) {
        perubahan.saldo = increment(-asli.jumlah);
      }

      await updateDoc(doc(db, "rekening", sumberId), perubahan);
      tutupPopup();
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus catatan. Coba lagi.");
    } finally {
      setDeleting(false);
    }
  };

  const konfirmasiHapusSemua = async () => {
    setDeletingSemua(true);
    try {
      const batch = writeBatch(db);
      rekeningList.forEach((r) => {
        if ((r.riwayat || []).length > 0) {
          batch.update(doc(db, "rekening", r.id), { riwayat: [] });
        }
      });
      await batch.commit();
      setShowHapusSemua(false);
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus semua riwayat. Coba lagi.");
    } finally {
      setDeletingSemua(false);
    }
  };

  const totalHarta = rekeningList.reduce((sum, r) => sum + r.saldo, 0);
  const semuaRiwayat = gabungkanSemuaRiwayat(rekeningList);
  const jumlahRekeningBerisiRiwayat = rekeningList.filter(
    (r) => (r.riwayat || []).length > 0
  ).length;

  const bulanIni = new Date().getMonth();
  const tahunIni = new Date().getFullYear();
  const riwayatBulanIni = semuaRiwayat.filter((r) => {
    const t = new Date(r.tanggal);
    return t.getMonth() === bulanIni && t.getFullYear() === tahunIni;
  });

  const totalMasuk = riwayatBulanIni.filter((r) => r.jumlah > 0).reduce((sum, r) => sum + r.jumlah, 0);
  const totalKeluar = riwayatBulanIni.filter((r) => r.jumlah < 0).reduce((sum, r) => sum + Math.abs(r.jumlah), 0);

  return (
    <div className="min-h-screen px-4 py-6 md:px-10 lg:pl-24" style={{ background: "var(--bg)" }}>
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="nb-btn px-3 py-2 lg:hidden"
              style={{ background: "var(--white)" }}
            >
              <Menu size={20} strokeWidth={2.5} />
            </button>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <ChartColumn size={28} strokeWidth={2.5} /> Ringkasan
            </h1>
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

        <div className="flex items-center justify-between gap-3 mb-3">
          <h2 className="font-bold text-lg">Semua Transaksi Terbaru</h2>
          {semuaRiwayat.length > 0 && (
            <button
              onClick={() => setShowHapusSemua(true)}
              className="nb-btn px-3 py-1.5 text-xs flex items-center gap-1.5"
              style={{ background: "var(--red)" }}
            >
              <Trash2 size={13} strokeWidth={2.5} /> Hapus Semua
            </button>
          )}
        </div>

        <div className="space-y-2">
          {semuaRiwayat.length === 0 && (
            <div className="nb-card p-6 text-center" style={{ background: "var(--white)" }}>
              <p className="text-sm opacity-70">Belum ada transaksi tercatat.</p>
            </div>
          )}

          {semuaRiwayat.slice(0, 20).map((r) => (
            <div
              key={`${r.sumberId}-${r.tanggal}-${r.jumlah}`}
              className="nb-card flex justify-between items-center px-4 py-3 gap-3"
              style={{ background: "var(--white)" }}
            >
              <div className="min-w-0">
                <p className="font-bold">
                  {r.jumlah > 0 ? "+" : ""}Rp{r.jumlah.toLocaleString("id-ID")}
                </p>
                <p className="text-xs opacity-70 truncate">
                  {r.sumberNama}
                  {r.celenganNama && ` → ${r.celenganNama}`}
                </p>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-xs">{new Date(r.tanggal).toLocaleDateString("id-ID")}</span>
                <button
                  onClick={() => {
                    setHapusTarget(r);
                    setKembalikanSaldo(false);
                  }}
                  className="nb-btn p-1.5"
                  style={{ background: "var(--red)" }}
                  title="Hapus catatan"
                >
                  <Trash2 size={14} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Popup hapus satu catatan */}
      <ConfirmModal
        isOpen={!!hapusTarget}
        title="Hapus Catatan?"
        message="Catatan transaksi ini akan dihapus permanen."
        onConfirm={konfirmasiHapus}
        onCancel={tutupPopup}
        loading={deleting}
      >
        {hapusTarget?.asli.celenganId ? (
          <p className="text-xs opacity-70 text-center">
            Ini transaksi ke celengan, jadi saldo rekening tidak ikut dikembalikan dari sini.
          </p>
        ) : (
          <label className="flex items-center justify-center gap-2 text-sm font-bold cursor-pointer">
            <input
              type="checkbox"
              checked={kembalikanSaldo}
              onChange={(e) => setKembalikanSaldo(e.target.checked)}
              style={{ accentColor: "black", width: 18, height: 18 }}
            />
            Kembalikan saldo rekening
          </label>
        )}
      </ConfirmModal>

      {/* Popup hapus semua catatan */}
      <ConfirmModal
        isOpen={showHapusSemua}
        title="Hapus Semua Riwayat?"
        message={`${semuaRiwayat.length} catatan dari ${jumlahRekeningBerisiRiwayat} rekening akan dihapus permanen dan tidak bisa dikembalikan.`}
        onConfirm={konfirmasiHapusSemua}
        onCancel={() => setShowHapusSemua(false)}
        loading={deletingSemua}
      >
        <p className="text-xs opacity-70 text-center">
          Saldo rekening tidak berubah. Yang dihapus hanya catatan transaksinya.
        </p>
      </ConfirmModal>
    </div>
  );
}