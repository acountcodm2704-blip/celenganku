import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { formatRupiah, parseRupiah } from "../utils/formatRupiah";
import { JENIS_REKENING } from "../utils/jenisRekening";

export default function AddRekening() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [nama, setNama] = useState("");
  const [jenis, setJenis] = useState("bank");
  const [saldoAwal, setSaldoAwal] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSaldoChange = (e) => setSaldoAwal(formatRupiah(e.target.value));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nama) return alert("Isi nama rekeningnya dulu!");

    setLoading(true);
    try {
      await addDoc(collection(db, "rekening"), {
        userId: user.uid,
        nama,
        jenis,
        saldo: parseRupiah(saldoAwal) || 0,
        riwayat: [],
        createdAt: serverTimestamp(),
      });
      navigate("/rekening");
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan rekening. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-6" style={{ background: "var(--bg)" }}>
      <div className="max-w-md mx-auto">
        <button onClick={() => navigate("/rekening")} className="font-bold mb-4">← Kembali</button>
        <h1 className="text-2xl font-bold mb-6">Tambah Rekening</h1>

        <form onSubmit={handleSubmit} className="nb-card p-6 space-y-5" style={{ background: "var(--white)" }}>
          <div>
            <label className="block font-bold mb-2">Nama Rekening</label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Contoh: BCA, GoPay, Dompet"
              className="nb-input w-full px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block font-bold mb-2">Jenis</label>
            <div className="grid grid-cols-3 gap-2">
              {JENIS_REKENING.map((j) => (
                <button
                  key={j.value}
                  type="button"
                  onClick={() => setJenis(j.value)}
                  className="nb-btn py-2 text-xs flex flex-col items-center gap-1"
                  style={{ background: jenis === j.value ? "var(--yellow)" : "var(--white)" }}
                >
                  <span className="text-lg">{j.emoji}</span>
                  {j.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold mb-2">Saldo Awal (Rp)</label>
            <input
              type="text"
              inputMode="numeric"
              value={saldoAwal}
              onChange={handleSaldoChange}
              placeholder="0"
              className="nb-input w-full px-3 py-2"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="nb-btn w-full py-3 disabled:opacity-50"
            style={{ background: "var(--green)" }}
          >
            {loading ? "Menyimpan..." : "Simpan Rekening"}
          </button>
        </form>
      </div>
    </div>
  );
}