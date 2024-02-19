import React from "react";
import "../../pages/styles/home-replace.css";

const WarningScreen = () => {
  return (
    <div className="home-replace">
      <section className="home-replace-content">
        <h1 className="home-replace-title">Version on Build</h1>
        <h4 className="home-replace-body">
          Dimensi perangkat anda saat ini belum didukung oleh web versi ini
          (v0.1.0).
        </h4>
        <h4 className="home-replace-body">
          Mohon gunakan perangkat dengan dimensi yang lebih besar (tablet atau
          desktop) untuk pengalaman yang lebih baik.
        </h4>
      </section>
    </div>
  );
};

export default WarningScreen;
