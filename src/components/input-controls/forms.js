import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Button } from "@ibrahimstudio/button";
import { Input } from "@ibrahimstudio/input";
import { useAuth } from "../../libs/securities/auth";
import { LoadingContent } from "../feedbacks/screens";
import { LogoPrimary, CheckIcon, CloseIcon } from "../layouts/icons";
import loginstyles from "./styles/login-form.module.css";
import styles from "./styles/data-form.module.css";

const modalRoot = document.getElementById("modal-root") || document.body;

export const LoginForm = () => {
  const { login } = useAuth();
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
    await login(inputData);
  };

  return (
    <form className={loginstyles.loginForm} onSubmit={handleSubmit}>
      <header className={loginstyles.formHead}>
        <img className={loginstyles.formLogoIcon} loading="lazy" alt="Admin Login" src="/svg/logo-primary.svg" />
        <h1 className={loginstyles.formTitle}>Admin Portal</h1>
        <p className={loginstyles.formDesc}>Masukkan Username dan Password untuk mengakses Dashboard.</p>
      </header>
      <div className={loginstyles.formHead}>
        <Input
          id="login-username"
          isLabeled={false}
          placeholder="e.g. edental_admin"
          type="text"
          name="username"
          value={inputData.username}
          onChange={handleChange}
          isRequired
        />
        <Input
          id="login-password"
          isLabeled={false}
          placeholder="Masukkan kata sandi"
          type="password"
          name="password"
          value={inputData.password}
          onChange={handleChange}
          isRequired
        />
      </div>
      <footer className={loginstyles.formFoot}>
        <Button id="submit-login" isFullwidth type="submit" buttonText="Masuk ke Dashboard" />
        <h6 className={loginstyles.formForgot}>Lupa Password?</h6>
      </footer>
    </form>
  );
};

export const SubmitForm = ({
  formTitle,
  formSubtitle,
  fetching = false,
  loading,
  operation = "add",
  onSubmit,
  saveText = "Simpan",
  cancelText = "Batal",
  children,
  onClose,
}) => {
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

  const modalElement = (
    <main className={styles.formScroll}>
      <section className={`${styles.formScreen} ${isClosing ? styles.close : ""}`}>
        <form className={`${styles.form} ${isClosing ? styles.close : ""}`} ref={ref} onSubmit={onSubmit}>
          <header className={styles.formHead}>
            <LogoPrimary width="96px" height="100%" color="var(--color-primary)" />
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
            <Button
              id="cancel-form-submit"
              variant="dashed"
              radius="full"
              color="var(--color-hint)"
              buttonText={cancelText}
              onClick={handleClose}
              startContent={<CloseIcon width="12px" height="100%" />}
            />
            <Button
              id="handle-form-submit"
              radius="full"
              type="submit"
              action={operation}
              buttonText={saveText}
              startContent={<CheckIcon width="12px" height="100%" />}
              isLoading={loading}
              loadingContent={<LoadingContent />}
            />
          </footer>
        </form>
      </section>
    </main>
  );

  return createPortal(modalElement, modalRoot);
};
