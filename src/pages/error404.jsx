import React from "react";
import { useNavigate } from "react-router-dom";
import { PrimButton } from "../components/user-input/buttons";
import styles from "./styles/home-replace.module.css";

const ErrorScreen = () => {
  const navigate = useNavigate();

  const backHome = () => {
    navigate("/dashboard");
  };

  return (
    <div className={styles.homeReplace}>
      <section className={styles.homeReplaceContent}>
        <h1 className={styles.homeReplaceTitle}>ERROR 404</h1>
        <h4 className={styles.homeReplaceBody}>Halaman tidak ditemukan.</h4>
        <PrimButton buttonText="Back to Dashboard" onClick={backHome} />
      </section>
    </div>
  );
};

export default ErrorScreen;
