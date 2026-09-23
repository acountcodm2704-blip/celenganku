import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { siapkanDataChart } from "../utils/chartData";

const PERIODE_OPTIONS = [
  { value: "harian", label: "Harian" },
  { value: "mingguan", label: "Mingguan" },
  { value: "bulanan", label: "Bulanan" },
  { value: "tahunan", label: "Tahunan" },
];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div
      className="px-3 py-2 text-xs"
      style={{ background: "var(--white)", border: "2px solid black", borderRadius: "8px" }}
    >
      <p className="font-bold mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} style={{ color: entry.color }}>
          {entry.name}: Rp{entry.value.toLocaleString("id-ID")}
        </p>
      ))}
    </div>
  );
}

export default function RiwayatChart({ riwayat }) {
  const [periode, setPeriode] = useState("harian");
  const [tampilan, setTampilan] = useState("terpisah");
  const data = siapkanDataChart(riwayat, periode);

  return (
    <div className="nb-card p-4 mb-6" style={{ background: "var(--white)" }}>
      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
        <p className="font-bold">📈 Grafik Pemasukan & Pengeluaran</p>
        <div className="flex gap-1">
          {PERIODE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPeriode(opt.value)}
              className="nb-btn px-2 py-1 text-xs"
              style={{ background: periode === opt.value ? "var(--yellow)" : "var(--white)" }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-1 mb-3">
        <button
          onClick={() => setTampilan("terpisah")}
          className="nb-btn px-3 py-1 text-xs flex-1"
          style={{ background: tampilan === "terpisah" ? "var(--blue)" : "var(--white)" }}
        >
          Terpisah
        </button>
        <button
          onClick={() => setTampilan("gabungan")}
          className="nb-btn px-3 py-1 text-xs flex-1"
          style={{ background: tampilan === "gabungan" ? "var(--blue)" : "var(--white)" }}
        >
          Gabungan
        </button>
      </div>

      {data.length === 0 ? (
        <p className="text-sm opacity-70 text-center py-8">Belum ada data untuk ditampilkan.</p>
      ) : (
        <>
          <div style={{ width: "100%", height: 220 }}>
            <ResponsiveContainer>
              <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#00000020" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fontFamily: "Comfortaa" }} />
                <YAxis
                  tick={{ fontSize: 10, fontFamily: "Comfortaa" }}
                  tickFormatter={(v) => `${v / 1000}k`}
                />
                <Tooltip content={<CustomTooltip />} />

                {tampilan === "terpisah" ? (
                  <>
                    <Line
                      type="monotone"
                      dataKey="pemasukan"
                      name="Pemasukan"
                      stroke="#4CAF6D"
                      strokeWidth={3}
                      dot={{ fill: "#4CAF6D", strokeWidth: 2, stroke: "black", r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="pengeluaran"
                      name="Pengeluaran"
                      stroke="#E85566"
                      strokeWidth={3}
                      dot={{ fill: "#E85566", strokeWidth: 2, stroke: "black", r: 4 }}
                    />
                  </>
                ) : (
                  <>
                    <ReferenceLine y={0} stroke="black" strokeDasharray="4 4" />
                    <Line
                      type="monotone"
                      dataKey="net"
                      name="Net (Bersih)"
                      stroke="#3A7CA5"
                      strokeWidth={3}
                      dot={{ fill: "#3A7CA5", strokeWidth: 2, stroke: "black", r: 4 }}
                    />
                  </>
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-center gap-4 mt-2 text-xs">
            {tampilan === "terpisah" ? (
              <>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-sm inline-block" style={{ background: "#4CAF6D" }} /> Pemasukan
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-sm inline-block" style={{ background: "#E85566" }} /> Pengeluaran
                </span>
              </>
            ) : (
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-sm inline-block" style={{ background: "#3A7CA5" }} /> Net (Pemasukan − Pengeluaran)
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}