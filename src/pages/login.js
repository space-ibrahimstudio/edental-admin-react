import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { Button } from "@ibrahimstudio/button";
import { Input } from "@ibrahimstudio/input";
import { useAuth } from "../libs/securities/auth";
import { inputValidator } from "../libs/plugins/controller";
import Pages from "../components/frames/pages";
import { LoadingContent } from "../components/feedbacks/screens";
import { Login } from "../components/contents/icons";
import styles from "./styles/login.module.css";

const LoginPage = () => {
  const { isLoggedin, login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [inputData, setInputData] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({ username: "", password: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputData((prevState) => ({ ...prevState, [name]: value }));
    setErrors({ ...errors, [name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const requiredFields = ["username", "password"];
    const validationErrors = inputValidator(inputData, requiredFields);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setIsLoading(true);
    try {
      await login(inputData);
    } catch (error) {
      console.error("error when trying to login:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoggedin) {
    return <Navigate to="/" />;
  }

  return (
    <Pages title="Login" access="public" topmargin="unset" bottommargin="unset" justify="center" bgImage="/img/img-02.jpg">
      <section className={styles.loginSection}>
        <form className={styles.loginForm} onSubmit={handleSubmit}>
          <header className={styles.formHead}>
            <img className={styles.formLogoIcon} loading="lazy" alt="Admin Login" src="/svg/logo-primary.svg" />
            <h1 className={styles.formTitle}>Admin Portal</h1>
            <p className={styles.formDesc}>Masukkan Username dan Password untuk mengakses Dashboard.</p>
          </header>
          <div className={styles.formHead}>
            <Input id="login-username" isLabeled={false} placeholder="e.g. edental_admin" type="text" name="username" value={inputData.username} onChange={handleChange} errorContent={errors.username} isRequired />
            <Input id="login-password" isLabeled={false} placeholder="Masukkan kata sandi" type="password" name="password" value={inputData.password} onChange={handleChange} errorContent={errors.password} isRequired />
          </div>
          <footer className={styles.formFoot}>
            <Button id="submit-login" isFullwidth type="submit" buttonText="Masuk ke Dashboard" startContent={<Login />} loadingContent={<LoadingContent />} isLoading={isLoading} />
            <h6 className={styles.formForgot}>Lupa Password?</h6>
          </footer>
        </form>
      </section>
    </Pages>
  );
};

export default LoginPage;
