import React from "react";
import styles from "./styles/onpage-form.module.css";

export const FormHead = ({ children }) => {
  return <header className={styles.formHead}>{children}</header>;
};

export const FormTitle = ({ text }) => {
  return <h1 className={styles.formTitle}>{text}</h1>;
};

export const FormTitleWrap = ({ children }) => {
  return <div className={styles.formInputWrap}>{children}</div>;
};

export const FormBody = ({ children }) => {
  return <div className={styles.formBody}>{children}</div>;
};

export const FormFooter = ({ children }) => {
  return <footer className={styles.formFooter}>{children}</footer>;
};

export const OnpageForm = ({ children }) => {
  return <form className={styles.onpageForm}>{children}</form>;
};
