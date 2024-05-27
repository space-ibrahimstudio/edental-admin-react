import React from "react";
import styles from "./styles/page-screen.module.css";

export const PageScreen = ({ variant, pageId, children }) => {
  return (
    <div id={pageId} className={`${styles.pageScreen} ${variant === "section" ? styles.section : ""}`}>
      {children}
    </div>
  );
};
