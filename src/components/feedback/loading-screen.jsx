import React, { Fragment } from "react";
import { Helmet } from "react-helmet-async";
import { LogoText } from "../layout/icons";
import styles from "./styles/loading-screen.module.css";

export function LoadingScreen() {
  return (
    <Fragment>
      <Helmet>
        <title>Loading ...</title>
      </Helmet>
      <div className={styles.loadingScreen}>
        <div className={styles.loadingWrapper}>
          <div className={styles.loadingCircle}>
            <div className={styles.loadingCircleBody}>
              <div className={styles.circleBody} />
              <div className={styles.circleBody} />
              <div className={styles.circleBody} />
            </div>
            <div className={styles.loadingCircleShadow}>
              <div className={styles.circleShadow} />
              <div className={styles.circleShadow} />
              <div className={styles.circleShadow} />
            </div>
          </div>
          <LogoText width="100%" height="18px" />
        </div>
      </div>
    </Fragment>
  );
}

export function LoadingElement() {
  return (
    <div className={styles.loadingCircle}>
      <div
        className={styles.loadingCircleBody}
        style={{ padding: "0", gap: "4px" }}
      >
        <div className={styles.circleBodySm} />
        <div className={styles.circleBodySm} />
        <div className={styles.circleBodySm} />
      </div>
    </div>
  );
}
