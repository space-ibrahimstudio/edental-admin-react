import React from "react";

export const ButtonGroup = ({ children }) => {
  const groupstyle = {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "15px",
    backgroundColor: "var(--color-white-second)",
    overflow: "hidden",
    padding: "5px",
    gap: "5px",
  };

  return <section style={groupstyle}>{children}</section>;
};
