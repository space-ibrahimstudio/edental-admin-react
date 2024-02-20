import React, { useState, useEffect, useRef } from "react";
import "./styles/float-notification.css";

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
      <section className={`notif-float ${isClosing ? "out" : "in"}`} ref={ref}>
        <main
          className="notif-float-content"
          style={{ backgroundColor: "var(--color-red)" }}
        >
          <p className="notif-float-content-text">{message}</p>
        </main>
      </section>
    );
  } else if (type === "warning") {
    return (
      <section className={`notif-float ${isClosing ? "out" : "in"}`} ref={ref}>
        <main
          className="notif-float-content"
          style={{ backgroundColor: "var(--color-yellow)" }}
        >
          <p className="notif-float-content-text">{message}</p>
        </main>
      </section>
    );
  } else if (type === "success") {
    return (
      <section className={`notif-float ${isClosing ? "out" : "in"}`} ref={ref}>
        <main
          className="notif-float-content"
          style={{ backgroundColor: "var(--color-blue)" }}
        >
          <p className="notif-float-content-text">{message}</p>
        </main>
      </section>
    );
  } else {
    return null;
  }
}
