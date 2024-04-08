import React from "react";
import PropTypes from "prop-types";
import styles from "./styles/page-screen.module.css";

export function PageScreen({ variant, pageId, children }) {
  return (
    <div
      id={pageId}
      className={`${styles.pageScreen} ${
        variant === "section" ? styles.section : ""
      }`}
    >
      {children}
    </div>
  );
}

PageScreen.propTypes = {
  variant: PropTypes.string,
  pageId: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};
