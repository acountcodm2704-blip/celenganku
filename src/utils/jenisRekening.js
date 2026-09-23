export const JENIS_REKENING = [
  { value: "bank", label: "Bank", emoji: "🏦" },
  { value: "ewallet", label: "E-Wallet", emoji: "📱" },
  { value: "tunai", label: "Tunai", emoji: "💵" },
  { value: "investasi", label: "Investasi", emoji: "📈" },
  { value: "lainnya", label: "Lainnya", emoji: "💼" },
];

export function getJenisInfo(value) {
  return JENIS_REKENING.find((j) => j.value === value) || JENIS_REKENING[JENIS_REKENING.length - 1];
}