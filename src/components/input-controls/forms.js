import React, { useState, useEffect, useRef } from "react";
import { Button } from "@ibrahimstudio/button";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { handleLogin, handleLoginLog } from "../../libs/plugins/handler";
import { fetchIPAddress } from "../../libs/sources/data";
import { useNotifications } from "../feedbacks/context/notifications-context";
import { FieldInput } from "./inputs";
import { LogoPrimary, CheckIcon, CloseIcon } from "../layouts/icons";
import styles from "./styles/data-form.module.css";
import "./styles/portal-form.css";

const modalRoot = document.getElementById("modal-root") || document.body;

export const PortalForm = ({ type, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const ref = useRef(null);
  const navigate = useNavigate();
  const { showNotifications } = useNotifications();

  const handleClickOutside = (e) => {
    if (ref.current && !ref.current.contains(e.target)) {
      setIsClosing(true);
    }
  };

  const submitLogin = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      showNotifications("danger", "Mohon masukkan Username dan Kata Sandi dengan benar");
      return;
    }

    setLoading(true);

    try {
      await handleLogin(username, password);

      const ipAddress = await fetchIPAddress();
      await handleLoginLog(ipAddress);

      setIsClosing(true);
      navigate("/dashboard");
      showNotifications("success", `Kamu berhasil login. Selamat datang kembali, ${username}!`);
    } catch (error) {
      console.error("Error occurred during login:", error);
      showNotifications("danger", "Login gagal. Mohon coba lagi.");
    } finally {
      setLoading(false);
      window.location.reload();
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
    const popupModals = document.querySelectorAll(".form-modal");
    popupModals.forEach((modal) => {
      if (!modal.classList.contains("fade-out")) {
        modalCount++;
      }
    });
    document.documentElement.style.overflow = modalCount > 0 ? "hidden" : "auto";
    return () => {
      document.documentElement.style.overflow = "auto";
    };
  }, [isClosing]);

  const modalElement =
    type === "login" ? (
      <div className={`form-modal ${isClosing ? "fade-out" : "fade-in"}`}>
        <form className={`form ${isClosing ? "move-down" : "move-up"}`} onSubmit={submitLogin} ref={ref}>
          <header className="form-heading">
            <LogoPrimary width="96px" height="100%" />
            <h4 className="form-title">Welcome Back!</h4>
          </header>
          <main className="form-heading">
            <FieldInput id="input-your-username" type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
            <FieldInput
              id="input-your-password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError("");
              }}
              errorMssg={passwordError}
            />
          </main>
          <footer className="form-footer">
            <button className={`form-footer-button ${!username || !password || loading ? "off" : ""}`} type="submit">
              {loading ? <h5 className="form-footer-button-text">Mohon Tunggu ...</h5> : <h5 className="form-footer-button-text">LOGIN</h5>}
            </button>
            <h6 className="form-footer-ctaother">
              <span>{`Belum punya akun? `}</span>
              <span className="form-footer-link">Daftar Sekarang</span>
            </h6>
          </footer>
        </form>
      </div>
    ) : (
      <div className={`form-modal ${isClosing ? "fade-out" : "fade-in"}`}>
        <form className="form" onSubmit={submitLogin} ref={ref}>
          <header className="form-heading">
            <LogoPrimary width="96px" height="100%" />
            <h4 className="form-title">Welcome!</h4>
          </header>
          <main className="form-heading">
            <FieldInput id="input-your-username" type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
            <FieldInput
              id="input-your-password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError("");
              }}
              errorMssg={passwordError}
            />
          </main>
          <footer className="form-footer">
            <button className="form-footer-button" type="submit">
              <h5 className="form-footer-button-text">LOGIN</h5>
            </button>
            <h6 className="form-footer-ctaother">
              <span>{`Belum punya akun? `}</span>
              <span className="form-footer-link">Daftar Sekarang</span>
            </h6>
          </footer>
        </form>
      </div>
    );

  return createPortal(modalElement, modalRoot);
};

export const SubmitForm = ({ formTitle, formSubtitle, loading, onSubmit, saveText, cancelText, children, onClose }) => {
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
    <div className={styles.formScroll}>
      <div className={`${styles.formScreen} ${isClosing ? styles.close : ""}`}>
        <form className={`${styles.form} ${isClosing ? styles.close : ""}`} ref={ref} onSubmit={onSubmit}>
          <header className={styles.formHead}>
            <LogoPrimary width="96px" height="100%" color="var(--color-primary)" />
            <b className={styles.formTitle}>{formTitle}</b>
            {formSubtitle && <div className={styles.formSubtitle}>{formSubtitle}</div>}
          </header>
          <div className={styles.formBody} style={loading ? { opacity: "0.5" } : { opacity: "1" }}>
            {children}
          </div>
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
              buttonText={saveText}
              startContent={<CheckIcon width="12px" height="100%" />}
              isLoading={loading}
            />
          </footer>
        </form>
      </div>
    </div>
  );

  return createPortal(modalElement, modalRoot);
};
