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
    <Pages title="Login" access="public" topmargin="unset" justify="center" bgImage="/img/img-02.jpg">
      <section className={styles.loginSection}>
        <LoginForm />
      </section>
    </Pages>
  );
};

export default LoginPage;
