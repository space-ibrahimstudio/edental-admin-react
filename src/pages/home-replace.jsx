import React, { useEffect, useState } from "react";
import { useLoading } from "../components/feedback/context/loading-context";
import { useNotifications } from "../components/feedback/context/notifications-context";
import { PortalForm } from "../components/user-input/forms";
import { PrimButton } from "../components/user-input/buttons";
import { LogoPrimary } from "../components/layout/icons";
import { checkLoginStatus, handleLogout } from "../components/tools/handler";
import styles from "./styles/home-replace.module.css";

const HomeReplace = () => {
  const [loginFormOpen, setLoginFormOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  const { setLoading } = useLoading();
  const { showNotifications } = useNotifications();

  const openLogin = () => {
    setLoginFormOpen(true);
  };

  const closeLogin = () => {
    setLoginFormOpen(false);
  };

  const logoutClick = () => {
    handleLogout();
    showNotifications("success", "Kamu berhasil logout. Mohon login kembali.");
  };

  useEffect(() => {
    const sessionCheck = async () => {
      try {
        setLoading(true);

        const session = await checkLoginStatus();
        if (session) {
          setLoggedIn(true);
        }
      } catch (error) {
        console.error("Error checking login status:", error);
      } finally {
        setLoading(false);
      }
    };

    sessionCheck();
  }, []);

  return (
    <div className={styles.homeReplace}>
      <section className={styles.homeReplaceContent}>
        <LogoPrimary width="150px" height="100%" />
        <h1 className={styles.homeReplaceTitle}>Welcome to Edental.id</h1>
        <h4 className={styles.homeReplaceBody}>
          This is the Homepage replacement.
        </h4>
        {loggedIn ? (
          <PrimButton buttonText="Logout" onClick={logoutClick} />
        ) : (
          <PrimButton buttonText="Masuk/Daftar" onClick={openLogin} />
        )}
      </section>
      {loginFormOpen && <PortalForm type="login" onClose={closeLogin} />}
    </div>
  );
};

export default HomeReplace;
