import { Landmark, Smartphone, Banknote, TrendingUp, Briefcase } from "lucide-react";

export const JENIS_REKENING = [
  { value: "bank", label: "Bank", icon: Landmark },
  { value: "ewallet", label: "E-Wallet", icon: Smartphone },
  { value: "tunai", label: "Tunai", icon: Banknote },
  { value: "investasi", label: "Investasi", icon: TrendingUp },
  { value: "lainnya", label: "Lainnya", icon: Briefcase },
];

export function getJenisInfo(value) {
  return JENIS_REKENING.find((j) => j.value === value) || JENIS_REKENING[JENIS_REKENING.length - 1];
}