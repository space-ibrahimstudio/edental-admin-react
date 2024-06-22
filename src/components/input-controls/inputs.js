import React from "react";
import styles from "./styles/fieldset.module.css";

const Fieldset = ({ type = "reg", gap = "var(--pixel-10)", markers, children, startContent, endContent }) => {
  const fieldsetstyles = { gap: gap };

  return (
    <section className={styles.inputWrap} style={fieldsetstyles}>
      {type === "row" && startContent}
      {type === "row" && markers && <b className={styles.wrapMarkers}>{markers}</b>}
      <div className={`${styles.wrapBody} ${type === "row" ? styles.row : ""}`} style={fieldsetstyles}>
        {children}
      </div>
      {type === "row" && endContent}
    </section>
  );
};

export default Fieldset;
