import { hitungEstimasi, hitungEstimasiDariRencana, formatEstimasiWaktu } from "../utils/estimasi";

const LABEL_FREKUENSI = { harian: "hari", mingguan: "minggu", bulanan: "bulan" };

export default function EstimasiWaktu({ celengan }) {
  const sisaUang = celengan.targetUang - celengan.uangTerkumpul;

  if (sisaUang <= 0) {
    return (
      <div className="nb-card p-4 mb-6 text-center" style={{ background: "var(--green)" }}>
        <p className="font-bold">🎉 Target sudah tercapai!</p>
      </div>
    );
  }

  // Kalau user sudah tentukan rencana sendiri, prioritaskan itu
  if (celengan.rencana) {
    const estimasiHari = hitungEstimasiDariRencana(sisaUang, celengan.rencana.nominal, celengan.rencana.frekuensi);
    return (
      <div className="nb-card p-4 mb-6" style={{ background: "var(--white)" }}>
        <p className="font-bold mb-2"> Berdasarkan Rencanamu</p>
        <p className="text-sm mb-3">
          Nabung Rp{celengan.rencana.nominal.toLocaleString("id-ID")} / {LABEL_FREKUENSI[celengan.rencana.frekuensi]}
        </p>
        <p className="text-2xl font-bold" style={{ color: "#2E7D32" }}>
          {formatEstimasiWaktu(estimasiHari)}
        </p>
      </div>
    );
  }

  
  const hasil = hitungEstimasi(celengan);

  if (hasil.status === "kurang-data") {
    return (
      <div className="nb-card p-4 mb-6 text-center" style={{ background: "var(--white)" }}>
        <p className="text-sm opacity-70">Belum cukup data untuk estimasi. Coba tambah saldo atau atur rencana nabung di menu Edit.</p>
      </div>
    );
  }

  return (
    <div className="nb-card p-4 mb-6" style={{ background: "var(--white)" }}>
      <p className="font-bold mb-3">⏱️ Estimasi Berdasarkan Kebiasaan</p>
      <p className="text-2xl font-bold mb-4" style={{ color: "#2E7D32" }}>
        {formatEstimasiWaktu(hasil.estimasiHari)}
      </p>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-xs opacity-70">Per Hari</p>
          <p className="font-bold text-sm">Rp{Math.round(hasil.rataPerHari).toLocaleString("id-ID")}</p>
        </div>
        <div>
          <p className="text-xs opacity-70">Per Minggu</p>
          <p className="font-bold text-sm">Rp{Math.round(hasil.rataPerMinggu).toLocaleString("id-ID")}</p>
        </div>
        <div>
          <p className="text-xs opacity-70">Per Bulan</p>
          <p className="font-bold text-sm">Rp{Math.round(hasil.rataPerBulan).toLocaleString("id-ID")}</p>
        </div>
      </div>
    </div>
  );
}