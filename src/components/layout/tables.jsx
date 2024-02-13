import React from "react";
import PropTypes from "prop-types";

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
