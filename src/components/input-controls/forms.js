import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Button } from "@ibrahimstudio/button";
import { Input } from "@ibrahimstudio/input";
import { useAuth } from "../../libs/securities/auth";
import { LoadingContent } from "../feedbacks/screens";
import { Check, Close, Login } from "../contents/icons";
import loginstyles from "./styles/login-form.module.css";
import styles from "./styles/data-form.module.css";

const modalRoot = document.getElementById("modal-root") || document.body;

export const LoginForm = () => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [inputData, setInputData] = useState({ username: "", password: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(inputData);
    } catch (error) {
      console.error("error when trying to login:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className={loginstyles.loginForm} onSubmit={handleSubmit}>
      <header className={loginstyles.formHead}>
        <img className={loginstyles.formLogoIcon} loading="lazy" alt="Admin Login" src="/svg/logo-primary.svg" />
        <h1 className={loginstyles.formTitle}>Admin Portal</h1>
        <p className={loginstyles.formDesc}>Masukkan Username dan Password untuk mengakses Dashboard.</p>
      </header>
      <div className={loginstyles.formHead}>
        <Input id="login-username" isLabeled={false} placeholder="e.g. edental_admin" type="text" name="username" value={inputData.username} onChange={handleChange} isRequired />
        <Input id="login-password" isLabeled={false} placeholder="Masukkan kata sandi" type="password" name="password" value={inputData.password} onChange={handleChange} isRequired />
      </div>
      <footer className={loginstyles.formFoot}>
        <Button id="submit-login" isFullwidth type="submit" buttonText="Masuk ke Dashboard" startContent={<Login />} loadingContent={<LoadingContent />} isLoading={isLoading} />
        <h6 className={loginstyles.formForgot}>Lupa Password?</h6>
      </footer>
    </form>
  );
};

export const SubmitForm = ({ size, formTitle, formSubtitle, fetching = false, loading, operation = "add", onSubmit, saveText = "Simpan", cancelText = "Batal", children, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);
  const ref = useRef(null);

  const handleClose = () => setIsClosing(true);
  const handleClickOutside = (e) => {
    if (ref.current && !ref.current.contains(e.target)) {
      setIsClosing(true);
    }
  };

  useEffect(() => {
    if (isClosing) {
      const animationDuration = 500;
      setTimeout(() => {
        onClose();
      }, animationDuration);
    }
  }, [isClosing, onClose]);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    let modalCount = 0;
    const popupModals = document.querySelectorAll(`.${styles.formScreen}`);
    popupModals.forEach((modal) => {
      if (!modal.classList.contains(`.${styles.close}`)) {
        modalCount++;
      }
    });
    document.documentElement.style.overflow = modalCount > 0 ? "hidden" : "auto";
    return () => {
      document.documentElement.style.overflow = "auto";
    };
  }, [isClosing]);

  const getFormStyles = () => {
    let maxWidth;
    switch (size) {
      case "sm":
        maxWidth = "var(--pixel-500)";
        break;
      case "md":
        maxWidth = "var(--pixel-600)";
        break;
      case "lg":
        maxWidth = "var(--pixel-950)";
        break;
      default:
        maxWidth = "var(--pixel-950)";
        break;
    }
    return { maxWidth };
  };

  const modalElement = (
    <main className={styles.formScroll}>
      <section className={`${styles.formScreen} ${isClosing ? styles.close : ""}`}>
        <form ref={ref} className={`${styles.form} ${isClosing ? styles.close : ""}`} style={getFormStyles()} onSubmit={onSubmit}>
          <header className={styles.formHead}>
            <img className={styles.formLogoIcon} loading="lazy" alt="Form Logo" src="/svg/logo-primary.svg" />
            <b className={styles.formTitle}>{formTitle}</b>
            {formSubtitle && <div className={styles.formSubtitle}>{formSubtitle}</div>}
          </header>
          {fetching ? (
            <div className={`${styles.formBody} ${styles.fetching}`}>
              <LoadingContent color="var(--color-primary)" />
            </div>
          ) : (
            <div className={styles.formBody} style={loading ? { opacity: "0.5" } : { opacity: "1" }}>
              {children}
            </div>
          )}
          <footer className={styles.formFooter}>
            <Button id="cancel-form-submit" variant="dashed" radius="full" color="var(--color-hint)" buttonText={cancelText} onClick={handleClose} startContent={<Close />} />
            <Button id="handle-form-submit" radius="full" type="submit" action={operation} buttonText={saveText} startContent={<Check />} isLoading={loading} loadingContent={<LoadingContent />} />
          </footer>
        </form>
      </section>
    </main>
  );

  return createPortal(modalElement, modalRoot);
};

export const FileForm = ({ onNext, fetching = false, loading, children, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);
  const handleClose = () => setIsClosing(true);

  useEffect(() => {
    if (isClosing) {
      const animationDuration = 500;
      setTimeout(() => {
        onClose();
      }, animationDuration);
    }
  }, [isClosing, onClose]);

  useEffect(() => {
    let modalCount = 0;
    const popupModals = document.querySelectorAll(`.${styles.formScreen}`);
    popupModals.forEach((modal) => {
      if (!modal.classList.contains(`.${styles.close}`)) {
        modalCount++;
      }
    });
    document.documentElement.style.overflow = modalCount > 0 ? "hidden" : "auto";
    return () => {
      document.documentElement.style.overflow = "auto";
    };
  }, [isClosing]);

  const modalElement = (
    <main className={styles.formScroll}>
      <nav className={`${styles.sectionNav} ${isClosing ? styles.close : ""}`}>
        <Button id="file-back-close" radius="full" buttonText="Kembali" onClick={handleClose} />
        <Button id="file-next-action" radius="full" buttonText="CetaK PDF" onClick={onNext} isLoading={loading} />
      </nav>
      <section className={`${styles.formScreen} ${isClosing ? styles.close : ""}`}>
        <section className={`${styles.sectionBody} ${fetching ? styles.fetch : ""}`}>{fetching ? <LoadingContent color="var(--color-primary)" /> : children}</section>
      </section>
    </main>
  );

  return createPortal(modalElement, modalRoot);
};
