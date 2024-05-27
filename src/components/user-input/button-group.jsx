import React from "react";

export const ButtonGroup = ({ children }) => {
  const groupstyle = {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "var(--pixel-15)",
    backgroundColor: "var(--color-light)",
    overflow: "hidden",
    padding: "var(--pixel-5)",
    gap: "var(--pixel-5)",
  };

  return <section style={groupstyle}>{children}</section>;
};
