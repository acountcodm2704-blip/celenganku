export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, loading }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 px-4"
      style={{ background: "rgba(0,0,0,0.5)" }}
    >
      <div
        className="nb-card p-6 w-full max-w-sm"
        style={{ background: "var(--white)" }}
      >
        <div className="text-4xl mb-3 text-center">⚠️</div>
        <h2 className="text-xl font-bold text-center mb-2">{title}</h2>
        <p className="text-center mb-6">{message}</p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="nb-btn flex-1 py-2 disabled:opacity-50"
            style={{ background: "var(--blue)" }}
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="nb-btn flex-1 py-2 disabled:opacity-50"
            style={{ background: "var(--red)" }}
          >
            {loading ? "Menghapus..." : "Ya, Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}