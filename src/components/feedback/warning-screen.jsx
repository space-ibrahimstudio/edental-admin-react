import React, { Fragment } from "react";
import { Helmet } from "react-helmet-async";
import styles from "../../pages/styles/home-replace.module.css";

const WarningScreen = () => {
  return (
    <Fragment>
      <Helmet>
        <title>Version on Build</title>
      </Helmet>
      <div className={styles.homeReplace}>
        <section className={styles.homeReplaceContent}>
          <h1 className={styles.homeReplaceTitle}>Version on Build</h1>
          <h4 className={styles.homeReplaceBody}>
            Dimensi perangkat anda saat ini belum didukung oleh web versi ini
            (v0.1.0).
          </h4>
          <h4 className={styles.homeReplaceBody}>
            Mohon gunakan perangkat dengan dimensi yang lebih besar (tablet atau
            desktop) untuk pengalaman yang lebih baik.
          </h4>
        </section>
      </div>
    </Fragment>
  );
};

export default WarningScreen;
