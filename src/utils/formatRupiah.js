// Mengubah angka jadi format dengan titik ribuan: 1000000 -> "1.000.000"
export function formatRupiah(angka) {
  const hanyaAngka = angka.replace(/\D/g, "");
  if (!hanyaAngka) return "";
  return Number(hanyaAngka).toLocaleString("id-ID");
}


export function parseRupiah(formatted) {
  return Number(formatted.replace(/\./g, "")) || 0;
}