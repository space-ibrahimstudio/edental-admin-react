import React, { useState, Fragment } from "react";
import styles from "./styles/tables.module.css";

export const TableRow = ({
  type,
  isClickable,
  onClick,
  isEven,
  expanded,
  children,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  if (type === "heading") {
    return (
      <tr className={styles.tabelHeadTr} onClick={onClick}>
        {children}
      </tr>
    );
  } else if (type === "expand") {
    return (
      <Fragment>
        <tr
          className={`${styles.tabelBodyTr} ${isEven ? styles.even : ""} ${
            isClickable ? styles.clickable : ""
          }`}
          onClick={toggleExpand}
        >
          {children}
        </tr>
        {isExpanded && <tr className={styles.tabelRowExpand}>{expanded}</tr>}
      </Fragment>
    );
  } else {
    return (
      <tr
        className={`${styles.tabelBodyTr} ${isEven ? styles.even : ""} ${
          isClickable ? styles.clickable : ""
        }`}
        onClick={onClick}
      >
        {children}
      </tr>
    );
  }
};

export const TableHeadValue = ({ position, type, value, children }) => {
  if (position === "end") {
    if (type === "num") {
      return (
        <th className={styles.tabelHeadNumTh}>
          <b className={styles.tabelHeadNumThText}>{value}</b>
          {children}
        </th>
      );
    } else if (type === "atn") {
      return (
        <th className={styles.tabelHeadAtnTh}>
          <b className={styles.tabelHeadNumThText}>{value}</b>
          {children}
        </th>
      );
    } else {
      return (
        <th className={styles.tabelHeadTh}>
          <b className={styles.tabelHeadThText}>{value}</b>
          {children}
        </th>
      );
    }
  } else {
    if (type === "num") {
      return (
        <Fragment>
          <th className={styles.tabelHeadNumTh}>
            <b className={styles.tabelHeadNumThText}>{value}</b>
            {children}
          </th>
          <div className={styles.lineDivider} />
        </Fragment>
      );
    } else if (type === "atn") {
      return (
        <Fragment>
          <th className={styles.tabelHeadAtnTh}>
            <b className={styles.tabelHeadNumThText}>{value}</b>
            {children}
          </th>
          <div className={styles.lineDivider} />
        </Fragment>
      );
    } else {
      return (
        <Fragment>
          <th className={styles.tabelHeadTh}>
            <b className={styles.tabelHeadThText}>{value}</b>
            {children}
          </th>
          <div className={styles.lineDivider} />
        </Fragment>
      );
    }
  }
};

export const TableBodyValue = ({ position, type, value, children }) => {
  if (position === "end") {
    if (type === "num") {
      return (
        <td className={styles.tabelBodyNumTd}>
          <b className={styles.tabelBodyNumTdText}>{value}</b>
        </td>
      );
    } else if (type === "atn") {
      return <td className={styles.tabelBodyAtnTd}>{children}</td>;
    } else {
      return (
        <td className={styles.tabelBodyTd}>
          <b className={styles.tabelBodyTdText}>{value}</b>
        </td>
      );
    }
  } else {
    if (type === "num") {
      return (
        <Fragment>
          <td className={styles.tabelBodyNumTd}>
            <b className={styles.tabelBodyNumTdText}>{value}</b>
          </td>
          <div className={styles.lineDivider} />
        </Fragment>
      );
    } else if (type === "atn") {
      return (
        <Fragment>
          <td className={styles.tabelBodyAtnTd}>{children}</td>
          <div className={styles.lineDivider} />
        </Fragment>
      );
    } else {
      return (
        <Fragment>
          <td className={styles.tabelBodyTd}>
            <b className={styles.tabelBodyTdText}>{value}</b>
          </td>
          <div className={styles.lineDivider} />
        </Fragment>
      );
    }
  }
};

export const TableData = ({ headerData, dataShown, loading, children }) => {
  return (
    <div
      className={`${styles.tabelSectionBody} ${
        dataShown && !loading ? styles.noLoad : styles.onLoad
      }`}
    >
      {loading ? (
        <p className={styles.tabelNodata}>Loading...</p>
      ) : dataShown ? (
        <table className={styles.tabelSectionTable}>
          <thead className={styles.tabelHeadThead}>{headerData}</thead>
          <div className={styles.tabelBodyVscroll}>
            <tbody className={styles.tabelBodyTbody}>{children}</tbody>
          </div>
        </table>
      ) : (
        <p className={styles.tabelNodata}>Tidak ada data untuk ditampilkan.</p>
      )}
    </div>
  );
};
