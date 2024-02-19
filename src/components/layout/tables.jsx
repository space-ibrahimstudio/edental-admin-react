import React from "react";
import PropTypes from "prop-types";
import "./styles/table-data.css";

export const ColumnsTitle = ({ columnsText, hasIcon, children, maxWidth }) => {
  if (hasIcon === "yes") {
    return (
      <div className="user-list-head-name" style={{ maxWidth: maxWidth }}>
        <b className="user-list-title">{columnsText}</b>
        {children}
      </div>
    );
  }
  return (
    <div className="user-list-head-name" style={{ maxWidth: maxWidth }}>
      <b className="user-list-title">{columnsText}</b>
    </div>
  );
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
  }
  return (
    <div className="user-list-head-name" style={{ maxWidth: maxWidth }}>
      <div className="user-list-row-name-text">{columnsText}</div>
      {children}
    </div>
  );
};

ColumnsBody.propTypes = {
  columnsText: PropTypes.string,
  hasIcon: PropTypes.string,
  children: PropTypes.node,
  maxWidth: PropTypes.string,
};

export const TableRow = ({ type, children }) => {
  if (type === "heading") {
    return <tr className="tabel-head-tr">{children}</tr>;
  }
  return <tr className="tabel-body-tr">{children}</tr>;
};

export const TableHeadValue = ({
  position,
  type,
  value,
  hasIcon,
  children,
}) => {
  if (hasIcon === "yes") {
    if (position === "end") {
      if (type === "num") {
        return (
          <th className="tabel-head-num-th">
            <b className="tabel-head-num-th-text">{value}</b>
            {children}
          </th>
        );
      }
      return (
        <th className="tabel-head-th">
          <b className="tabel-head-th-text">{value}</b>
          {children}
        </th>
      );
    }
    if (type === "num") {
      return (
        <>
          <th className="tabel-head-num-th">
            <b className="tabel-head-num-th-text">{value}</b>
            {children}
          </th>
          <div className="line-divider" />
        </>
      );
    }
    return (
      <>
        <th className="tabel-head-th">
          <b className="tabel-head-th-text">{value}</b>
          {children}
        </th>
        <div className="line-divider" />
      </>
    );
  }
  if (position === "end") {
    if (type === "num") {
      return (
        <th className="tabel-head-num-th">
          <b className="tabel-head-num-th-text">{value}</b>
        </th>
      );
    }
    return (
      <th className="tabel-head-th">
        <b className="tabel-head-th-text">{value}</b>
      </th>
    );
  }
  if (type === "num") {
    return (
      <>
        <th className="tabel-head-num-th">
          <b className="tabel-head-num-th-text">{value}</b>
        </th>
        <div className="line-divider" />
      </>
    );
  }
  return (
    <>
      <th className="tabel-head-th">
        <b className="tabel-head-th-text">{value}</b>
      </th>
      <div className="line-divider" />
    </>
  );
};

export const TableBodyValue = ({ position, type, value }) => {
  if (position === "end") {
    if (type === "num") {
      return (
        <td className="tabel-body-num-td">
          <b className="tabel-body-num-td-text">{value}</b>
        </td>
      );
    }
    return (
      <td className="tabel-body-td">
        <b className="tabel-body-td-text">{value}</b>
      </td>
    );
  }
  if (type === "num") {
    return (
      <>
        <td className="tabel-body-num-td">
          <b className="tabel-body-num-td-text">{value}</b>
        </td>
        <div className="line-divider" />
      </>
    );
  }
  return (
    <>
      <td className="tabel-body-td">
        <b className="tabel-body-td-text">{value}</b>
      </td>
      <div className="line-divider" />
    </>
  );
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
        <p className="tabel-nodata">No data to display.</p>
      )}
    </div>
  );
};
