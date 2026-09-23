export function hitungEstimasi(celengan) {
  const { uangTerkumpul, targetUang, createdAt } = celengan;
  const sisaUang = targetUang - uangTerkumpul;

  if (sisaUang <= 0) {
    return { status: "selesai" };
  }

  if (!createdAt?.seconds) {
    return { status: "kurang-data" };
  }

  const tanggalMulai = new Date(createdAt.seconds * 1000);
  const sekarang = new Date();
  const hariBerjalan = Math.max(1, Math.ceil((sekarang - tanggalMulai) / (1000 * 60 * 60 * 24)));

  const rataPerHari = uangTerkumpul / hariBerjalan;

  if (rataPerHari <= 0) {
    return { status: "kurang-data" };
  }

  const estimasiHari = Math.ceil(sisaUang / rataPerHari);

  return {
    status: "ok",
    rataPerHari,
    rataPerMinggu: rataPerHari * 7,
    rataPerBulan: rataPerHari * 30,
    estimasiHari,
  };
}


export function konversiKeHarian(nominal, frekuensi) {
  switch (frekuensi) {
    case "harian":
      return nominal;
    case "mingguan":
      return nominal / 7;
    case "bulanan":
      return nominal / 30;
    default:
      return 0;
  }
}

export function hitungEstimasiDariRencana(sisaUang, nominalRencana, frekuensi) {
  const perHari = konversiKeHarian(nominalRencana, frekuensi);
  if (perHari <= 0) return null;
  return Math.ceil(sisaUang / perHari);
}

export function formatEstimasiWaktu(hari) {
  if (hari <= 1) return "besok";
  if (hari < 14) return `${hari} hari lagi`;
  if (hari < 60) return `~${Math.round(hari / 7)} minggu lagi`;
  if (hari < 730) return `~${Math.round(hari / 30)} bulan lagi`;
  return `~${(hari / 365).toFixed(1)} tahun lagi`;
}