import { useState, useRef, useEffect } from "react";

const OPTIONS = [
  { value: "terbaru", label: "Terbaru Ditambahkan" },
  { value: "terlama", label: "Terlama Ditambahkan" },
  { value: "hampir-tercapai", label: "Hampir Tercapai" },
  { value: "target-terbesar", label: "Target Terbesar" },
  { value: "target-terkecil", label: "Target Terkecil" },
];

export default function SortDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const current = OPTIONS.find((o) => o.value === value);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="nb-btn px-4 py-2 text-sm flex items-center gap-2"
        style={{ background: "var(--white)" }}
      >
        {current?.label} <span>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div
          className="absolute left-0 mt-2 w-56 z-20 overflow-hidden"
          style={{
            background: "var(--white)",
            border: "3px solid black",
            borderRadius: "12px",
            boxShadow: "5px 5px 0 black",
          }}
        >
          {OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className="w-full text-left px-4 py-3 text-sm font-medium"
              style={{
                background: opt.value === value ? "var(--yellow)" : "transparent",
                borderBottom: "2px solid black",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}