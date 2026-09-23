import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { getCroppedImageBlob } from "../utils/cropImage";

export default function CropModal({ imageSrc, onCancel, onConfirm, loading }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((_, areaPixels) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const handleSave = async () => {
    const blob = await getCroppedImageBlob(imageSrc, croppedAreaPixels);
    onConfirm(blob);
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 px-4"
      style={{ background: "rgba(0,0,0,0.6)" }}
    >
      <div className="nb-card w-full max-w-sm overflow-hidden" style={{ background: "var(--white)" }}>
        <div className="p-4" style={{ borderBottom: "3px solid black", background: "var(--yellow)" }}>
          <h2 className="font-bold text-center">Atur Posisi Foto</h2>
        </div>

        <div className="relative w-full" style={{ height: 300, background: "#333" }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="text-sm font-bold">🔍 Zoom</label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={loading}
              className="nb-btn flex-1 py-2 text-sm disabled:opacity-50"
              style={{ background: "var(--blue)" }}
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="nb-btn flex-1 py-2 text-sm disabled:opacity-50"
              style={{ background: "var(--green)" }}
            >
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}