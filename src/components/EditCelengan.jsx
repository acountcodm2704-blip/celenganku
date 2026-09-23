import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { uploadImageToCloudinary } from "../cloudinary";
import { formatRupiah, parseRupiah } from "../utils/formatRupiah";
import { KATEGORI_LIST } from "../utils/kategori";

export default function EditCelengan() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [nama, setNama] = useState("");
  const [kategori, setKategori] = useState("lainnya");
  const [targetUang, setTargetUang] = useState("");
  const [nominalRencana, setNominalRencana] = useState("");
  const [frekuensiRencana, setFrekuensiRencana] = useState("mingguan");
  const [fotoUrlLama, setFotoUrlLama] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const docSnap = await getDoc(doc(db, "celengan", id));
      if (docSnap.exists()) {
        const data = docSnap.data();
        setNama(data.nama);
        setKategori(data.kategori || "lainnya");
        setTargetUang(formatRupiah(String(data.targetUang)));
        setFotoUrlLama(data.fotoUrl);
        if (data.rencana) {
          setNominalRencana(formatRupiah(String(data.rencana.nominal)));
          setFrekuensiRencana(data.rencana.frekuensi);
        }
      } else {
        navigate("/");
      }
      setFetching(false);
    };
    fetchData();
  }, [id, navigate]);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const handleTargetChange = (e) => setTargetUang(formatRupiah(e.target.value));
  const handleRencanaChange = (e) =>
    setNominalRencana(formatRupiah(e.target.value));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const targetAngka = parseRupiah(targetUang);
    if (!nama || !targetAngka) return alert("Lengkapi semua field!");

    setLoading(true);
    try {
      let fotoUrl = fotoUrlLama;
      if (file) fotoUrl = await uploadImageToCloudinary(file);

      await updateDoc(doc(db, "celengan", id), {
        nama,
        kategori,
        targetUang: targetAngka,
        fotoUrl,
        rencana: nominalRencana
          ? {
              nominal: parseRupiah(nominalRencana),
              frekuensi: frekuensiRencana,
            }
          : null,
      });

      navigate(`/celengan/${id}`);
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan perubahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <p className="text-center mt-10 font-bold">Memuat...</p>;

  return (
    <div className="min-h-screen px-4 py-6" style={{ background: "var(--bg)" }}>
      <div className="max-w-md mx-auto">
        <button
          onClick={() => navigate(`/celengan/${id}`)}
          className="font-bold mb-4"
        >
          ← Kembali
        </button>
        <h1 className="text-2xl font-bold mb-6">Edit Celengan</h1>

        <form
          onSubmit={handleSubmit}
          className="nb-card p-6 space-y-5"
          style={{ background: "var(--white)" }}
        >
          <div>
            <label className="block font-bold mb-2">Foto Barang</label>
            <img
              src={preview || fotoUrlLama}
              alt={nama}
              className="w-28 h-28 object-cover rounded-xl mb-3"
              style={{ border: "3px solid black" }}
            />
            <label
              htmlFor="fotoInputEdit"
              className="nb-btn inline-block px-4 py-2 text-sm cursor-pointer"
              style={{ background: "var(--blue)" }}
            >
              Ganti Foto
            </label>
            <input
              id="fotoInputEdit"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <p className="text-xs mt-2">
              Kosongkan kalau tidak ingin ganti foto
            </p>
          </div>

          <div>
            <label className="block font-bold mb-2">Nama Barang</label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="nb-input w-full px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block font-bold mb-2">Kategori</label>
            <div className="grid grid-cols-4 gap-2">
              {KATEGORI_LIST.map((k) => {
                const Icon = k.icon;
                return (
                  <button
                    key={k.value}
                    type="button"
                    onClick={() => setKategori(k.value)}
                    className="nb-btn py-2 text-xs flex flex-col items-center gap-1"
                    style={{
                      background:
                        kategori === k.value ? "var(--yellow)" : "var(--white)",
                    }}
                  >
                    <Icon size={20} strokeWidth={2.5} />
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
              className="nb-input w-full px-3 py-2"
              required
            />
          </div>

          <div className="pt-2" style={{ borderTop: "2px dashed black" }}>
            <label className="block font-bold mb-2">
              Rencana Nabung (opsional)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                value={nominalRencana}
                onChange={handleRencanaChange}
                placeholder="Contoh: 50.000"
                className="nb-input flex-1 px-3 py-2"
              />
              <select
                value={frekuensiRencana}
                onChange={(e) => setFrekuensiRencana(e.target.value)}
                className="nb-input px-3 py-2"
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
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </form>
      </div>
    </div>
  );
}
