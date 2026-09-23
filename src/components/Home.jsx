import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import ProgressCircle from "./ProgressCircle";
import ProfileMenu from "./ProfileMenu";
import SortDropdown from "./SortDropdown";
import { KATEGORI_LIST, getKategoriInfo } from "../utils/kategori";
import Sidebar from "./Sidebar";

export default function Home() {
  const { user, logout } = useAuth();
  const [celenganList, setCelenganList] = useState([]);
  const [sortBy, setSortBy] = useState("terbaru");
  const [filterKategori, setFilterKategori] = useState("semua");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, "celengan"),
      where("userId", "==", user.uid),
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCelenganList(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      );
    });
    return unsubscribe;
  }, [user.uid]);

  const getProgress = (item) =>
    Math.min(Math.round((item.uangTerkumpul / item.targetUang) * 100), 100);

  const filteredList =
    filterKategori === "semua"
      ? celenganList
      : celenganList.filter(
          (item) => (item.kategori || "lainnya") === filterKategori,
        );

  const sortedList = [...filteredList].sort((a, b) => {
    switch (sortBy) {
      case "terbaru":
        return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
      case "terlama":
        return (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0);
      case "hampir-tercapai":
        return getProgress(b) - getProgress(a);
      case "target-terbesar":
        return b.targetUang - a.targetUang;
      case "target-terkecil":
        return a.targetUang - b.targetUang;
      default:
        return 0;
    }
  });

  return (
    <div
      className="min-h-screen px-4 py-6 md:px-10 lg:pl-24"
      style={{ background: "var(--bg)" }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="nb-btn px-3 py-2 lg:hidden"
              style={{ background: "var(--white)" }}
            >
              ☰
            </button>
            <h1 className="text-2xl md:text-3xl font-bold"> Celenganku</h1>
          </div>
          <div className="flex items-center gap-3">
            <ProfileMenu />
            <button
              onClick={logout}
              className="nb-btn px-4 py-2 text-sm"
              style={{ background: "var(--red)" }}
            >
              Keluar
            </button>
          </div>
        </div>

        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <Link
          to="/tambah"
          className="nb-btn block text-center py-4 mb-6 text-lg"
          style={{ background: "var(--yellow)" }}
        >
          + Tambah Celengan
        </Link>

        {celenganList.length > 0 && (
          <>
            <div className="mb-4 overflow-x-auto -mx-4 px-4 pb-2">
              <div className="flex gap-2 w-max">
                <button
                  onClick={() => setFilterKategori("semua")}
                  className="nb-btn px-3 py-1.5 text-xs whitespace-nowrap"
                  style={{
                    background:
                      filterKategori === "semua"
                        ? "var(--yellow)"
                        : "var(--white)",
                  }}
                >
                  Semua
                </button>
                {KATEGORI_LIST.map((k) => {
                  const Icon = k.icon;
                  return (
                    <button
                      key={k.value}
                      onClick={() => setFilterKategori(k.value)}
                      className="nb-btn px-3 py-1.5 text-xs whitespace-nowrap flex items-center gap-1.5"
                      style={{
                        background:
                          filterKategori === k.value
                            ? "var(--yellow)"
                            : "var(--white)",
                      }}
                    >
                      <Icon size={14} strokeWidth={2.5} /> {k.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2 mb-6">
              <label className="font-bold text-sm">Urutkan:</label>
              <SortDropdown value={sortBy} onChange={setSortBy} />
            </div>
          </>
        )}

        {celenganList.length === 0 && (
          <div
            className="nb-card p-8 text-center"
            style={{ background: "var(--white)" }}
          >
            <p>Belum ada celengan. Yuk mulai nabung!</p>
          </div>
        )}

        {celenganList.length > 0 && sortedList.length === 0 && (
          <div
            className="nb-card p-8 text-center"
            style={{ background: "var(--white)" }}
          >
            <p>Tidak ada celengan di kategori ini.</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {sortedList.map((item) => {
            const progress = getProgress(item);
            const kategoriInfo = getKategoriInfo(item.kategori);
            return (
              <Link
                key={item.id}
                to={`/celengan/${item.id}`}
                className="nb-card p-4 flex flex-col hover:-translate-y-1 transition-transform"
              >
                <div
                  className="relative w-full h-48 md:h-56 lg:h-64 rounded-xl mb-4 overflow-hidden"
                  style={{
                    border: "3px solid black",
                    background: "var(--blue)",
                  }}
                >
                  <img
                    src={item.fotoUrl}
                    alt={item.nama}
                    className="w-full h-full object-cover scale-110"
                  />
                  <span
                    className="absolute top-2 left-2 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1"
                    style={{
                      background: "var(--white)",
                      border: "2px solid black",
                    }}
                  >
                    <kategoriInfo.icon size={12} strokeWidth={2.5} />{" "}
                    {kategoriInfo.label}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 flex-1">
                  <div>
                    <h3 className="font-bold text-lg mb-1">{item.nama}</h3>
                    <p className="text-sm">
                      Rp{item.uangTerkumpul.toLocaleString("id-ID")}
                    </p>
                    <p className="text-xs opacity-70">
                      dari Rp{item.targetUang.toLocaleString("id-ID")}
                    </p>
                  </div>
                  <ProgressCircle
                    percent={progress}
                    size={72}
                    strokeWidth={8}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
