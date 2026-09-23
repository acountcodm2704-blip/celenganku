import { useRef, useState, useEffect } from "react";
import ShareCard from "./ShareCard";
import { generateImageBlob } from "../utils/generateShareImage";

export default function ShareModal({ celengan, progress, onClose }) {
  const cardRef = useRef(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [imageBlob, setImageBlob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generate = async () => {
      setLoading(true);
      const blob = await generateImageBlob(cardRef.current);
      setImageBlob(blob);
      setImageUrl(URL.createObjectURL(blob));
      setLoading(false);
    };
    generate();
  }, [celengan, progress]);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `celenganku-${celengan.nama}.png`;
    link.click();
  };

  const handleShare = async () => {
    if (!navigator.share) {
      alert("Fitur share tidak didukung di browser ini. Silakan download gambarnya.");
      return;
    }
    try {
      const file = new File([imageBlob], `celenganku-${celengan.nama}.png`, { type: "image/png" });
      await navigator.share({
        files: [file],
        title: "Progress Celenganku",
        text: `Progress nabung "${celengan.nama}" sudah ${progress}%! `,
      });
    } catch (err) {
      if (err.name !== "AbortError") console.error(err);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 px-4"
      style={{ background: "rgba(0,0,0,0.6)" }}
    >
      <div className="nb-card w-full max-w-sm overflow-hidden" style={{ background: "var(--white)" }}>
        <div className="p-4" style={{ borderBottom: "3px solid black", background: "var(--yellow)" }}>
          <h2 className="font-bold text-center">Bagikan Progress</h2>
        </div>

        <div className="p-4 flex justify-center">
          {loading ? (
            <div className="py-12 text-sm">Membuat gambar...</div>
          ) : (
            <img src={imageUrl} alt="Preview" className="w-full rounded-xl" style={{ border: "2px solid black" }} />
          )}
        </div>

        <div className="p-4 pt-0 flex gap-3">
          <button
            onClick={onClose}
            className="nb-btn flex-1 py-2 text-sm"
            style={{ background: "var(--blue)" }}
          >
            Tutup
          </button>
          <button
            onClick={handleDownload}
            disabled={loading}
            className="nb-btn flex-1 py-2 text-sm disabled:opacity-50"
            style={{ background: "var(--white)" }}
          >
            💾 Simpan
          </button>
          <button
            onClick={handleShare}
            disabled={loading}
            className="nb-btn flex-1 py-2 text-sm disabled:opacity-50"
            style={{ background: "var(--green)" }}
          >
            📤 Bagikan
          </button>
        </div>
      </div>

      {/* Card asli disembunyikan di luar layar, cuma dipakai untuk di-"foto" jadi gambar */}
      <div style={{ position: "fixed", top: -9999, left: -9999 }}>
        <ShareCard ref={cardRef} celengan={celengan} progress={progress} />
      </div>
    </div>
  );
}