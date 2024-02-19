import React from "react";
import PropTypes from "prop-types";

export function PageScreen({ variant, pageId, children }) {
  if (variant === "section") {
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
        marginTop: "70px",
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
