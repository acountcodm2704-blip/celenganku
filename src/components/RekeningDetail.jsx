import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  doc,
  onSnapshot,
  updateDoc,
  arrayUnion,
  increment,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { formatRupiah, parseRupiah } from "../utils/formatRupiah";
import { getJenisInfo } from "../utils/jenisRekening";
import ConfirmModal from "./ConfirmModal";
import RiwayatChart from "./RiwayatChart";

export default function RekeningDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rekening, setRekening] = useState(null);
  const [jumlah, setJumlah] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "rekening", id), (docSnap) => {
      if (docSnap.exists()) setRekening({ id: docSnap.id, ...docSnap.data() });
      else navigate("/rekening");
    });
    return unsubscribe;
  }, [id, navigate]);

  const handleJumlahChange = (e) => setJumlah(formatRupiah(e.target.value));

  const handleTransaksi = async (tipe) => {
    const nilai = parseRupiah(jumlah);
    if (!nilai || nilai <= 0) return alert("Masukkan jumlah yang valid!");
    const perubahan = tipe === "tambah" ? nilai : -nilai;
    await updateDoc(doc(db, "rekening", id), {
      saldo: increment(perubahan),
      riwayat: arrayUnion({
        jumlah: perubahan,
        tipe,
        tanggal: new Date().toISOString(),
      }),
    });
    setJumlah("");
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteDoc(doc(db, "rekening", id));
      navigate("/rekening");
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus rekening.");
      setDeleting(false);
    }
  };

  if (!rekening)
    return <p className="text-center mt-10 font-bold">Memuat...</p>;

  const jenisInfo = getJenisInfo(rekening.jenis);

  return (
    <div className="min-h-screen px-4 py-6" style={{ background: "var(--bg)" }}>
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => navigate("/rekening")} className="font-bold">
            ← Kembali
          </button>
          <button
            onClick={() => setShowConfirm(true)}
            className="nb-btn px-3 py-1.5 text-sm"
            style={{ background: "var(--red)" }}
          >
            🗑 Hapus
          </button>
        </div>

        <div
          className="nb-card p-5 mb-6 text-center"
          style={{ background: "var(--white)" }}
        >
          <div className="text-4xl mb-2">{jenisInfo.emoji}</div>
          <p className="font-bold text-lg mb-1">{rekening.nama}</p>
          <p className="text-xs opacity-70 mb-3">{jenisInfo.label}</p>
          <p className="text-3xl font-bold">
            Rp{rekening.saldo.toLocaleString("id-ID")}
          </p>
        </div>

        <div className="nb-card p-5 mb-6" style={{ background: "var(--blue)" }}>
          <input
            type="text"
            inputMode="numeric"
            value={jumlah}
            onChange={handleJumlahChange}
            placeholder="Masukkan jumlah (Rp)"
            className="nb-input w-full px-3 py-2 mb-3"
            style={{ background: "var(--white)" }}
          />
          <div className="flex gap-3">
            <button
              onClick={() => handleTransaksi("tambah")}
              className="nb-btn flex-1 py-2"
              style={{ background: "var(--green)" }}
            >
              + Masuk
            </button>
            <button
              onClick={() => handleTransaksi("kurang")}
              className="nb-btn flex-1 py-2"
              style={{ background: "var(--red)" }}
            >
              − Keluar
            </button>
          </div>
        </div>

        <RiwayatChart riwayat={rekening.riwayat} />

        <h2 className="font-bold text-lg mb-3">Riwayat</h2>
        <div className="space-y-2">
          {rekening.riwayat?.length > 0 ? (
            [...rekening.riwayat].reverse().map((r, i) => (
              <div
                key={i}
                className="nb-card flex justify-between px-4 py-3"
                style={{ background: "var(--white)" }}
              >
                <span className="font-bold">
                  {r.jumlah > 0 ? "+" : ""}Rp{r.jumlah.toLocaleString("id-ID")}
                </span>
                <span className="text-sm">
                  {new Date(r.tanggal).toLocaleDateString("id-ID")}
                </span>
              </div>
            ))
          ) : (
            <p>Belum ada transaksi.</p>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirm}
        title="Hapus Rekening?"
        message={`Rekening "${rekening.nama}" akan dihapus permanen.`}
        onConfirm={confirmDelete}
        onCancel={() => setShowConfirm(false)}
        loading={deleting}
      />
    </div>
  );
}
