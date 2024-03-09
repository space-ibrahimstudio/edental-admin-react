import React, { useState, useEffect, useRef } from "react";
import styles from "./styles/float-notification.module.css";

export function FloatNotification({ type, message, onClose }) {
  const [isClosing, setIsClosing] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsClosing(true);
      onClose();
    }, 4500);

    return () => clearTimeout(timer);
  }, [isClosing, onClose]);

  const handleClickOutside = (event) => {
    if (ref.current && !ref.current.contains(event.target)) {
      setIsClosing(true);
      onClose();
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (type === "danger") {
    return (
      <section
        className={`${styles.notifFloat} ${isClosing ? styles.out : styles.in}`}
        ref={ref}
      >
        <main
          className={styles.notifFloatContent}
          style={{ backgroundColor: "var(--color-red)" }}
        >
          <p className={styles.notifFloatContentText}>{message}</p>
        </main>
      </section>
    );
  } else if (type === "warning") {
    return (
      <section
        className={`${styles.notifFloat} ${isClosing ? styles.out : styles.in}`}
        ref={ref}
      >
        <main
          className={styles.notifFloatContent}
          style={{ backgroundColor: "var(--color-yellow)" }}
        >
          <p className={styles.notifFloatContentText}>{message}</p>
        </main>
      </section>
    );
  } else if (type === "success") {
    return (
      <section
        className={`${styles.notifFloat} ${isClosing ? styles.out : styles.in}`}
        ref={ref}
      >
        <main
          className={styles.notifFloatContent}
          style={{ backgroundColor: "var(--color-blue)" }}
        >
          <p className={styles.notifFloatContentText}>{message}</p>
        </main>
      </section>
    );
  } else {
    return null;
  }
}
