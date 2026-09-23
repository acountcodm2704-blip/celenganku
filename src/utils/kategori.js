import {
  Smartphone,
  Shirt,
  Plane,
  GraduationCap,
  Car,
  Gamepad2,
  Gift,
  Package,
} from "lucide-react";

export const KATEGORI_LIST = [
  { value: "gadget", label: "Gadget", icon: Smartphone },
  { value: "fashion", label: "Fashion", icon: Shirt },
  { value: "liburan", label: "Liburan", icon: Plane },
  { value: "pendidikan", label: "Pendidikan", icon: GraduationCap },
  { value: "kendaraan", label: "Kendaraan", icon: Car },
  { value: "hobi", label: "Hobi", icon: Gamepad2 },
  { value: "hadiah", label: "Hadiah", icon: Gift },
  { value: "lainnya", label: "Lainnya", icon: Package },
];

export function getKategoriInfo(value) {
  return KATEGORI_LIST.find((k) => k.value === value) || KATEGORI_LIST[KATEGORI_LIST.length - 1];
}