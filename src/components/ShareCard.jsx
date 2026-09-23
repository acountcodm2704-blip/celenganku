import { forwardRef } from "react";

const ShareCard = forwardRef(({ celengan, progress }, ref) => {
  return (
    <div
      ref={ref}
      style={{
        width: 400,
        fontFamily: "'Comfortaa', sans-serif",
        background: "var(--bg)", 
        padding: 24,
      }}
    >
      <div
        style={{
          background: "var(--white)",
          border: "4px solid black",
          borderRadius: 20,
          overflow: "hidden",
        }}
      >
        <img
          src={celengan.fotoUrl}
          alt={celengan.nama}
          crossOrigin="anonymous"
          style={{
            width: "100%",
            height: 220,
            objectFit: "cover",
            display: "block",
          }}
        />

        <div style={{ padding: 20 }}>
          <p style={{ fontWeight: 700, fontSize: 22, margin: "0 0 4px" }}>
            {celengan.nama}
          </p>
          <p style={{ fontSize: 14, opacity: 0.7, margin: "0 0 16px" }}>
            Rp{celengan.uangTerkumpul.toLocaleString("id-ID")} dari Rp
            {celengan.targetUang.toLocaleString("id-ID")}
          </p>

          <div
            style={{
              width: "100%",
              height: 16,
              borderRadius: 999,
              border: "2px solid black",
              overflow: "hidden",
              background: "var(--white)",
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                background: "var(--green)",
              }}
           />
           </div>
            <p
              style={{
                textAlign: "right",
                fontWeight: 700,
                fontSize: 14,
                marginTop: 6,
              }}
            >
              {progress}% tercapai
            </p>
          </div>
        </div>
         <p style={{ textAlign: "center", fontSize: 12, opacity: 0.6, marginTop: 16 }}>
         Dibuat dengan Celenganku
      </p>     
    </div>
  );
});

export default ShareCard;
