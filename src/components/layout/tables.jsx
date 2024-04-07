import React, { useState } from "react";
import PropTypes from "prop-types";
import { Fragment } from "../tools/controller";
import "./styles/table-data.css";
import "../../pages/styles/new.css";

export const ColumnsTitle = ({ columnsText, hasIcon, children, maxWidth }) => {
  if (hasIcon === "yes") {
    return (
      <div className="user-list-head-name" style={{ maxWidth: maxWidth }}>
        <b className="user-list-title">{columnsText}</b>
        {children}
      </div>
    );
  } else {
    return (
      <div className="user-list-head-name" style={{ maxWidth: maxWidth }}>
        <b className="user-list-title">{columnsText}</b>
      </div>
    );
  }
};

ColumnsTitle.propTypes = {
  columnsText: PropTypes.string,
  hasIcon: PropTypes.string,
  children: PropTypes.node,
  maxWidth: PropTypes.string,
};

export const ColumnsBody = ({ columnsText, hasIcon, children, maxWidth }) => {
  if (hasIcon === "yes") {
    return (
      <div className="user-list-head-name" style={{ maxWidth: maxWidth }}>
        <div className="user-list-row-name-text">{columnsText}</div>
        {children}
      </div>
    );
  } else {
    return (
      <div className="user-list-head-name" style={{ maxWidth: maxWidth }}>
        <div className="user-list-row-name-text">{columnsText}</div>
        {children}
      </div>
    );
  }
};

ColumnsBody.propTypes = {
  columnsText: PropTypes.string,
  hasIcon: PropTypes.string,
  children: PropTypes.node,
  maxWidth: PropTypes.string,
};

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
    return <tr className="tabel-head-tr">{children}</tr>;
  } else if (type === "expand") {
    return (
      <Fragment>
        <tr
          className={`tabel-body-tr ${isEven ? "even" : ""} ${
            isClickable ? "clickable" : ""
          }`}
          onClick={toggleExpand}
        >
          {children}
        </tr>
        {isExpanded && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
              borderTop: "1px solid var(--color-blue-30)",
              borderLeft: "1px solid var(--color-blue-30)",
              borderRight: "1px solid var(--color-blue-30)",
              padding: "15px",
              backgroundColor: "var(--color-foreground)",
            }}
          >
            {expanded}
          </div>
        )}
      </Fragment>
    );
  } else {
    return (
      <tr
        className={`tabel-body-tr ${isEven ? "even" : ""} ${
          isClickable ? "clickable" : ""
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
        <th className="tabel-head-num-th">
          <b className="tabel-head-num-th-text">{value}</b>
          {children}
        </th>
      );
    } else if (type === "atn") {
      return (
        <th className="tabel-head-atn-th">
          <b className="tabel-head-num-th-text">{value}</b>
          {children}
        </th>
      );
    } else {
      return (
        <th className="tabel-head-th">
          <b className="tabel-head-th-text">{value}</b>
          {children}
        </th>
      );
    }
  } else if (type === "num") {
    return (
      <Fragment>
        <th className="tabel-head-num-th">
          <b className="tabel-head-num-th-text">{value}</b>
          {children}
        </th>
        <div className="line-divider" />
      </Fragment>
    );
  } else if (type === "atn") {
    return (
      <Fragment>
        <th className="tabel-head-atn-th">
          <b className="tabel-head-num-th-text">{value}</b>
          {children}
        </th>
        <div className="line-divider" />
      </Fragment>
    );
  } else {
    return (
      <Fragment>
        <th className="tabel-head-th">
          <b className="tabel-head-th-text">{value}</b>
          {children}
        </th>
        <div className="line-divider" />
      </Fragment>
    );
  }
};

export const TableBodyValue = ({ position, type, value, children }) => {
  if (position === "end") {
    if (type === "num") {
      return (
        <td className="tabel-body-num-td">
          <b className="tabel-body-num-td-text">{value}</b>
        </td>
      );
    } else if (type === "atn") {
      return <td className="tabel-body-atn-td">{children}</td>;
    } else {
      return (
        <td className="tabel-body-td">
          <b className="tabel-body-td-text">{value}</b>
        </td>
      );
    }
  } else if (type === "num") {
    return (
      <Fragment>
        <td className="tabel-body-num-td">
          <b className="tabel-body-num-td-text">{value}</b>
        </td>
        <div className="line-divider" />
      </Fragment>
    );
  } else if (type === "atn") {
    return (
      <Fragment>
        <td className="tabel-body-atn-td">{children}</td>
        <div className="line-divider" />
      </Fragment>
    );
  } else {
    return (
      <Fragment>
        <td className="tabel-body-td">
          <b className="tabel-body-td-text">{value}</b>
        </td>
        <div className="line-divider" />
      </Fragment>
    );
  }
};

export const TableData = ({ headerData, dataShown, loading, children }) => {
  return (
    <div
      className="tabel-section-body"
      style={
        dataShown && !loading
          ? {
              alignItems: "flex-start",
              overflowX: "auto",
              color: "#fff",
              justifyContent: "flex-start",
            }
          : {
              alignItems: "center",
              overflow: "hidden",
              color: "var(--color-darkblue",
              justifyContent: "center",
              height: "350px",
            }
      }
    >
      {loading ? (
        <p className="tabel-nodata">Loading...</p>
      ) : dataShown ? (
        <table className="tabel-section-table">
          <thead className="tabel-head-thead">{headerData}</thead>
          <div className="tabel-body-vscroll">
            <tbody className="tabel-body-tbody">{children}</tbody>
          </div>
        </table>
      ) : (
        <p className="tabel-nodata">Tidak ada data untuk ditampilkan.</p>
      )}
    </div>
  );
};

TableData.propTypes = {
  headerData: PropTypes.node,
  dataShown: PropTypes.bool,
  loading: PropTypes.bool,
  children: PropTypes.node,
};
