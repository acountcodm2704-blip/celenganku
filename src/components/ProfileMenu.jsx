import { useState, useRef, useEffect } from "react";
import { doc, setDoc, deleteField } from "firebase/firestore";
import { db } from "../firebase";
import { uploadImageToCloudinary } from "../cloudinary";
import { useAuth } from "../context/AuthContext";
import CropModal from "./CropModal";

export default function ProfileMenu() {
  const { user, login, customPhotoURL } = useAuth();
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [rawImage, setRawImage] = useState(null);
  const menuRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayPhoto =
    customPhotoURL ||
    user.photoURL ||
    "https://api.dicebear.com/7.x/initials/svg?seed=" + user.displayName;

  const handleGantiFotoClick = () => {
    setOpen(false);
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setRawImage(URL.createObjectURL(file));
    e.target.value = "";
  };

  const handleCropConfirm = async (blob) => {
    setUploading(true);
    try {
      const url = await uploadImageToCloudinary(blob);
      await setDoc(
        doc(db, "users", user.uid),
        { photoURL: url },
        { merge: true },
      );
      setRawImage(null);
    } catch (err) {
      console.error(err);
      alert("Gagal mengganti foto profil. Coba lagi.");
    } finally {
      setUploading(false);
    }
  };

  const handleHapusFoto = async () => {
    const konfirmasi = window.confirm(
      "Hapus foto profil custom? Akan kembali ke foto akun Google.",
    );
    if (!konfirmasi) return;

    setOpen(false);
    try {
      await setDoc(
        doc(db, "users", user.uid),
        { photoURL: deleteField() },
        { merge: true },
      );
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus foto profil.");
    }
  };

  const handleGantiAkun = async () => {
    setOpen(false);
    try {
      await login();
    } catch (err) {
      console.error("Gagal ganti akun:", err);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="rounded-full overflow-hidden"
        style={{ width: 44, height: 44, border: "3px solid black" }}
      >
        <img
          src={displayPhoto}
          alt={user.displayName}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {open && (
        <div
          className="absolute right-0 mt-2 w-60 z-20 overflow-hidden"
          style={{
            background: "var(--white)",
            border: "3px solid black",
            borderRadius: "12px",
            boxShadow: "5px 5px 0 black",
          }}
        >
          <div
            className="p-4 flex flex-col items-center gap-2 text-center"
            style={{
              borderBottom: "2px solid black",
              background: "var(--yellow)",
            }}
          >
            <img
              src={displayPhoto}
              alt=""
              referrerPolicy="no-referrer"
              className="w-20 h-20 rounded-full object-cover"
              style={{ border: "3px solid black" }}
            />
            <div>
              <p className="font-bold text-sm truncate">{user.displayName}</p>
              <p className="text-xs opacity-70 truncate">{user.email}</p>
            </div>
          </div>

          <button
            onClick={handleGantiFotoClick}
            className="w-full text-left px-4 py-3 text-sm font-medium"
            style={{ borderBottom: "2px solid black" }}
          >
            Ganti Foto Profil
          </button>

          {customPhotoURL && (
            <button
              onClick={handleHapusFoto}
              className="w-full text-left px-4 py-3 text-sm font-medium"
              style={{ borderBottom: "2px solid black", color: "#B00020" }}
            >
              Hapus Foto Profil
            </button>
          )}

          <button
            onClick={handleGantiAkun}
            className="w-full text-left px-4 py-3 text-sm font-medium"
          >
            Ganti Akun Google
          </button>
        </div>
      )}

      {rawImage && (
        <CropModal
          imageSrc={rawImage}
          onCancel={() => setRawImage(null)}
          onConfirm={handleCropConfirm}
          loading={uploading}
        />
      )}
    </div>
  );
}
