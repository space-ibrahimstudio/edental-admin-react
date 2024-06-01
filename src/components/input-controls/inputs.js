import React from "react";
import styles from "./styles/user-input.module.css";

export const InputWrap = ({ width, isExpanded, expanded, children }) => {
  return (
    <div className={styles.inputWrap} style={{ width: width }}>
      {children}
      {isExpanded && <div className={styles.inputExpand}>{expanded}</div>}
    </div>
  );
};
