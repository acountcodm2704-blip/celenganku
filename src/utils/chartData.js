function getMingguKe(tanggal) {
  const awalTahun = new Date(tanggal.getFullYear(), 0, 1);
  const hari = Math.floor((tanggal - awalTahun) / (1000 * 60 * 60 * 24));
  return Math.ceil((hari + awalTahun.getDay() + 1) / 7);
}

function getGroupKey(tanggalObj, periode) {
  switch (periode) {
    case "harian":
      return tanggalObj.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
    case "mingguan":
      return `Minggu ${getMingguKe(tanggalObj)}`;
    case "bulanan":
      return tanggalObj.toLocaleDateString("id-ID", { month: "short", year: "numeric" });
    case "tahunan":
      return tanggalObj.getFullYear().toString();
    default:
      return "";
  }
}

export function siapkanDataChart(riwayat, periode = "harian") {
  if (!riwayat || riwayat.length === 0) return [];

  const grouped = {};

  riwayat.forEach((r) => {
    const tanggalObj = new Date(r.tanggal);
    const key = getGroupKey(tanggalObj, periode);

    if (!grouped[key]) {
      grouped[key] = { label: key, pemasukan: 0, pengeluaran: 0, urutan: tanggalObj.getTime() };
    } else {
      grouped[key].urutan = Math.min(grouped[key].urutan, tanggalObj.getTime());
    }

    if (r.jumlah > 0) {
      grouped[key].pemasukan += r.jumlah;
    } else {
      grouped[key].pengeluaran += Math.abs(r.jumlah);
    }
  });

  const hasil = Object.values(grouped).sort((a, b) => a.urutan - b.urutan);

  // tambahkan field "net" = pemasukan - pengeluaran di tiap titik
  return hasil.map((item) => ({
    ...item,
    net: item.pemasukan - item.pengeluaran,
  }));
}