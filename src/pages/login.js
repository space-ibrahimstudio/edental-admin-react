import React from "react";
import { Navigate } from "react-router-dom";
import Pages from "../components/frames/pages";
import { useAuth } from "../libs/securities/auth";
import { LoginForm } from "../components/input-controls/forms";
import styles from "./styles/login.module.css";

const LoginPage = () => {
  const { isLoggedin } = useAuth();

  if (isLoggedin) {
    return <Navigate to="/" />;
  }

  return (
    <Pages title="Login" access="public" topmargin="unset" justify="center">
      <section className={styles.loginSection}>
        <img className={styles.loginBannerIcon} loading="lazy" alt="Admin Login Portal" src="/img/img-02.jpg" />
        <LoginForm />
      </section>
    </Pages>
  );
};

export default LoginPage;
