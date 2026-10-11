import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { uploadImageToCloudinary, validateImageFile } from "../cloudinary";
import { useAuth } from "../context/AuthContext";
import { formatRupiah, parseRupiah } from "../utils/formatRupiah";
import { KATEGORI_LIST } from "../utils/kategori";
import CropModal from "./CropModal";
import { ArrowLeft } from "lucide-react";

export default function AddCelengan() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [nama, setNama] = useState("");
  const [kategori, setKategori] = useState("lainnya");
  const [targetUang, setTargetUang] = useState("");
  const [nominalRencana, setNominalRencana] = useState("");
  const [frekuensiRencana, setFrekuensiRencana] = useState("mingguan");
  const [file, setFile] = useState(null); // hasil crop (blob)
  const [preview, setPreview] = useState(null);
  const [rawImage, setRawImage] = useState(null); // foto asli sebelum di-crop
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    const error = validateImageFile(selected);
    if (error) {
      alert(error);
      e.target.value = "";
      return;
    }

    setRawImage(URL.createObjectURL(selected));
    e.target.value = ""; // supaya bisa pilih file yang sama lagi
  };

  const handleCropConfirm = (blob) => {
    setFile(blob);
    setPreview(URL.createObjectURL(blob));
    setRawImage(null);
  };

  const handleTargetChange = (e) => setTargetUang(formatRupiah(e.target.value));
  const handleRencanaChange = (e) =>
    setNominalRencana(formatRupiah(e.target.value));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const targetAngka = parseRupiah(targetUang);
    if (!file) return alert("Pilih foto barang dulu!");
    if (!nama || !targetAngka) return alert("Lengkapi semua field!");

    setLoading(true);
    try {
      const fotoUrl = await uploadImageToCloudinary(file);
      await addDoc(collection(db, "celengan"), {
        userId: user.uid,
        nama,
        kategori,
        fotoUrl,
        targetUang: targetAngka,
        uangTerkumpul: 0,
        riwayat: [],
        rencana: nominalRencana
          ? {
              nominal: parseRupiah(nominalRencana),
              frekuensi: frekuensiRencana,
            }
          : null,
        createdAt: serverTimestamp(),
      });
      navigate("/");
    } catch (err) {
      console.error(err);
      alert(err.message || "Gagal menyimpan celengan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-6" style={{ background: "var(--bg)" }}>
      <div className="max-w-md mx-auto">
        <button
            onClick={() => navigate("/")}
            className="nb-btn px-3 py-1.5 text-sm flex items-center gap-1.5 mb-6 whitespace-nowrap"
            style={{ background: "var(--white)" }}
          >
            <ArrowLeft size={14} strokeWidth={2.5} /> Kembali
          </button>
       
        <h1 className="text-2xl font-bold mb-6">Tambah Celengan Baru</h1>

        <form
          onSubmit={handleSubmit}
          className="nb-card p-4 sm:p-6 space-y-5"
          style={{ background: "var(--white)" }}
        >
          <div>
            <label className="block font-bold mb-2">Foto Barang</label>
            {preview && (
              <img
                src={preview}
                alt="preview"
                className="w-full rounded-xl object-cover mb-3"
                style={{ aspectRatio: "4 / 3", border: "3px solid black" }}
              />
            )}
            <label
              htmlFor="fotoInput"
              className="nb-btn inline-block px-4 py-2 text-sm cursor-pointer"
              style={{ background: "var(--blue)" }}
            >
              {preview ? "Ganti Foto" : "Pilih Foto"}
            </label>
            <input
              id="fotoInput"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <div>
            <label className="block font-bold mb-2">Nama Barang</label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Contoh: Sepatu Running"
              className="nb-input w-full px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block font-bold mb-2">Kategori</label>
            <div className="flex flex-wrap gap-2">
              {KATEGORI_LIST.map((k) => {
                const Icon = k.icon;
                return (
                  <button
                    key={k.value}
                    type="button"
                    onClick={() => setKategori(k.value)}
                    className="nb-btn px-3 py-1.5 text-xs flex items-center gap-1.5 whitespace-nowrap"
                    style={{
                      background:
                        kategori === k.value ? "var(--yellow)" : "var(--white)",
                    }}
                  >
                    <Icon size={14} strokeWidth={2.5} />
                    {k.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block font-bold mb-2">Target Uang (Rp)</label>
            <input
              type="text"
              inputMode="numeric"
              value={targetUang}
              onChange={handleTargetChange}
              placeholder="1.000.000"
              className="nb-input w-full px-3 py-2"
              required
            />
          </div>

          <div className="pt-2" style={{ borderTop: "2px dashed black" }}>
            <label className="block font-bold mb-2">
              Rencana Nabung (opsional)
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                inputMode="numeric"
                value={nominalRencana}
                onChange={handleRencanaChange}
                placeholder="Contoh: 50.000"
                className="nb-input w-full sm:flex-1 px-3 py-2"
              />
              <select
                value={frekuensiRencana}
                onChange={(e) => setFrekuensiRencana(e.target.value)}
                className="nb-input w-full sm:w-auto px-3 py-2"
              >
                <option value="harian">/ Hari</option>
                <option value="mingguan">/ Minggu</option>
                <option value="bulanan">/ Bulan</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="nb-btn w-full py-3 disabled:opacity-50"
            style={{ background: "var(--yellow)" }}
          >
            {loading ? "Menyimpan..." : "Simpan Celengan"}
          </button>
        </form>
      </div>

      {rawImage && (
        <CropModal
          imageSrc={rawImage}
          aspect={4 / 3}
          cropShape="rect"
          title="Atur Foto Barang"
          onCancel={() => setRawImage(null)}
          onConfirm={handleCropConfirm}
        />
      )}
    </div>
  );
}
