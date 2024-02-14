import React from "react";
import PropTypes from "prop-types";

export function PageScreen({ pageId, children }) {
  return (
    <div
      id={pageId}
      style={{
        width: "100%",
        backgroundColor: "var(--color-foreground)",
        display: "flex",
        overflow: "hidden",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        minHeight: "100vh",
      }}
    >
      {children}
    </div>
  );
}

PageScreen.propTypes = {
  pageId: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};
