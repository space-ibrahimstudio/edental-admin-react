import React from "react";
import styles from "./styles/login-page.module.css";

const LoginPage = () => {
  return (
    <div className={styles.loginPage}>
      <section className={styles.loginSection}>
        <img className={styles.loginBannerIcon} loading="lazy" alt="" src="/login-banner@1x.jpg" />
        <form className={styles.loginForm}>
          <header className={styles.formHead}>
            <img className={styles.formLogoIcon} alt="" src="/formlogo.svg" />
            <h1 className={styles.formTitle}>Admin Portal</h1>
            <p className={styles.formDesc}>
              <span className={styles.loremIpsumDolor}>{`Lorem ipsum dolor sit amet, `}</span>
              <b className={styles.senyumterus}>#SenyumTerus</b>
              <span className={styles.loremIpsumDolor}> adipiscing elit. Aenean ut lectus dui. Nullam vulputate commodo euismod</span>
            </p>
          </header>
          <div className={styles.formHead}>
            <button className={styles.replaceThis} />
            <button className={styles.replaceThis} />
          </div>
          <footer className={styles.formFoot}>
            <h6 className={styles.formForgot}>Lupa Password?</h6>
            <button className={styles.replaceThis2} />
          </footer>
        </form>
      </section>
    </div>
  );
};

export default LoginPage;
