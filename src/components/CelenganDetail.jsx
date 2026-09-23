import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  doc,
  onSnapshot,
  updateDoc,
  arrayUnion,
  increment,
  deleteDoc,
  collection,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import ConfirmModal from "./ConfirmModal";
import { formatRupiah, parseRupiah } from "../utils/formatRupiah";
import ProgressCircle from "./ProgressCircle";
import EstimasiWaktu from "./EstimasiWaktu";
import { getKategoriInfo } from "../utils/kategori";
import RiwayatChart from "./RiwayatChart";
import ShareModal from "./ShareModal";

export default function CelenganDetail() {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [celengan, setCelengan] = useState(null);
  const [jumlah, setJumlah] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [rekeningList, setRekeningList] = useState([]);
  const [rekeningTerpilih, setRekeningTerpilih] = useState("");

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "celengan", id), (docSnap) => {
      if (docSnap.exists()) setCelengan({ id: docSnap.id, ...docSnap.data() });
      else navigate("/");
    });
    return unsubscribe;
  }, [id, navigate]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "rekening"),
      where("userId", "==", user.uid),
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setRekeningList(data);
      setRekeningTerpilih(
        (current) => current || (data.length > 0 ? data[0].id : ""),
      );
    });
    return unsubscribe;
  }, [user]);

  const handleJumlahChange = (e) => {
    setJumlah(formatRupiah(e.target.value));
  };

  const handleTransaksi = async (tipe) => {
    const nilai = parseRupiah(jumlah);
    if (!nilai || nilai <= 0) return alert("Masukkan jumlah yang valid!");

    const perubahan = tipe === "tambah" ? nilai : -nilai;

    await updateDoc(doc(db, "celengan", id), {
      uangTerkumpul: increment(perubahan),
      riwayat: arrayUnion({
        jumlah: perubahan,
        tipe,
        tanggal: new Date().toISOString(),
        rekeningId: rekeningTerpilih || null,
      }),
    });

    if (rekeningTerpilih) {
      await updateDoc(doc(db, "rekening", rekeningTerpilih), {
        saldo: increment(-perubahan),
        riwayat: arrayUnion({
          jumlah: -perubahan,
          tipe: tipe === "tambah" ? "transfer-keluar" : "transfer-masuk",
          tanggal: new Date().toISOString(),
          celenganId: id,
          celenganNama: celengan.nama,
        }),
      });
    }

    setJumlah("");
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteDoc(doc(db, "celengan", id));
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus celengan. Coba lagi.");
      setDeleting(false);
      setShowConfirm(false);
    }
  };

  if (!celengan)
    return <p className="text-center mt-10 font-bold">Memuat...</p>;

  const kategoriInfo = getKategoriInfo(celengan.kategori);
  const progress = Math.min(
    Math.round((celengan.uangTerkumpul / celengan.targetUang) * 100),
    100,
  );

  return (
    <div className="min-h-screen px-4 py-6" style={{ background: "var(--bg)" }}>
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => navigate("/")} className="font-bold">
            ← Kembali
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setShowShare(true)}
              className="nb-btn px-3 py-1.5 text-sm"
              style={{ background: "var(--blue)" }}
            >
              📤 Bagikan
            </button>
            <button
              onClick={() => navigate(`/celengan/${id}/edit`)}
              className="nb-btn px-3 py-1.5 text-sm"
              style={{ background: "var(--yellow)" }}
            >
              ✏️ Edit
            </button>
            <button
              onClick={() => setShowConfirm(true)}
              className="nb-btn px-3 py-1.5 text-sm"
              style={{ background: "var(--red)" }}
            >
              🗑 Hapus
            </button>
          </div>
        </div>

        <div
          className="nb-card overflow-hidden mb-5"
          style={{ background: "var(--white)" }}
        >
          <div className="p-3">
            <div
              className="w-full h-64 rounded-xl overflow-hidden"
              style={{ border: "3px solid black" }}
            >
              <img
                src={celengan.fotoUrl}
                alt={celengan.nama}
                className="w-full h-full object-cover scale-110"
              />
            </div>
          </div>
          <div className="p-5 pt-0">
            <div className="flex items-center justify-between gap-4 mb-2">
              <div>
                <span
                  className="inline-block text-xs font-bold px-2 py-1 rounded-full mb-2"
                  style={{
                    background: "var(--blue)",
                    border: "2px solid black",
                  }}
                >
                  {kategoriInfo.emoji} {kategoriInfo.label}
                </span>
                <h1 className="text-xl font-bold mb-1">{celengan.nama}</h1>
                <p>Rp{celengan.uangTerkumpul.toLocaleString("id-ID")}</p>
                <p className="text-sm opacity-70">
                  dari Rp{celengan.targetUang.toLocaleString("id-ID")}
                </p>
              </div>
              <ProgressCircle percent={progress} size={80} strokeWidth={9} />
            </div>
          </div>
        </div>

        <EstimasiWaktu celengan={celengan} />

        <div className="nb-card p-5 mb-6" style={{ background: "var(--blue)" }}>
          {rekeningList.length > 0 && (
            <div className="mb-3">
              <label className="text-xs font-bold block mb-1">
                Dari Rekening
              </label>
              <select
                value={rekeningTerpilih}
                onChange={(e) => setRekeningTerpilih(e.target.value)}
                className="nb-input w-full px-3 py-2 text-sm"
                style={{ background: "var(--white)" }}
              >
                {rekeningList.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nama} (Rp{r.saldo.toLocaleString("id-ID")})
                  </option>
                ))}
                <option value="">Tanpa catat rekening</option>
              </select>
            </div>
          )}

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
              + Tambah
            </button>
            <button
              onClick={() => handleTransaksi("kurang")}
              className="nb-btn flex-1 py-2"
              style={{ background: "var(--red)" }}
            >
              − Kurang
            </button>
          </div>
        </div>

        <RiwayatChart riwayat={celengan.riwayat} />

        <h2 className="font-bold text-lg mb-3">Riwayat Transaksi</h2>
        <div className="space-y-2">
          {celengan.riwayat?.length > 0 ? (
            [...celengan.riwayat].reverse().map((r, i) => (
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
        title="Hapus Celengan?"
        message={`Celengan "${celengan.nama}" akan dihapus permanen dan tidak bisa dikembalikan.`}
        onConfirm={confirmDelete}
        onCancel={() => setShowConfirm(false)}
        loading={deleting}
      />
      {showShare && (
        <ShareModal
          celengan={celengan}
          progress={progress}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  );
}
