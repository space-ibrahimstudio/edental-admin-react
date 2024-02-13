import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useLoading } from "../components/feedback/context/loading-context";
import { PortalForm } from "../components/user-input/forms";
import { PrimButton } from "../components/user-input/buttons";
import { checkLoginStatus, handleLogout } from "../components/tools/handler";
import "./styles/home-replace.css";

const HomeReplace = () => {
  const [loginFormOpen, setLoginFormOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const { setLoading } = useLoading();

  const openLogin = () => {
    setLoginFormOpen(true);
  };

  const closeLogin = () => {
    setLoginFormOpen(false);
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

  const logoutClick = () => {
    handleLogout();
    window.location.reload();
  };

  return (
    <div className="home-replace">
      <Helmet>
        <title>Edental ID</title>
        <meta
          name="description"
          content="Selamat datang di halaman utama Edental ID. Fitur lengkap akan segera hadir."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta property="og:title" content="Edental ID" />
        <meta
          property="og:description"
          content="Selamat datang di halaman utama Edental ID. Fitur lengkap akan segera hadir."
        />
        <meta property="og:image" content="https://zulkarna.in/logo192.png" />
        <meta property="og:url" content="https://zulkarna.in/" />
        <meta name="twitter:title" content="Edental ID" />
        <meta
          name="twitter:description"
          content="Selamat datang di halaman utama Edental ID. Fitur lengkap akan segera hadir."
        />
        <meta name="twitter:image" content="https://zulkarna.in/logo192.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="robots" content="index, follow" />
      </Helmet>
      <section className="home-replace-content">
        <img className="logo-icon" alt="" src="/svg/edental-white.svg" />
        <h1 className="home-replace-title">Welcome to Edental.id</h1>
        <h4 className="home-replace-body">This is the Homepage replacement.</h4>
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
