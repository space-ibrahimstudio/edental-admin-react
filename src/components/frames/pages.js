import React, { Fragment } from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "../navigations/navbar";

const Pages = ({ title, access = "private", topmargin = "var(--pixel-70)", justify = "flex-start", children }) => {
  const layoutstyles = {
    width: "100%",
    position: "relative",
    paddingTop: topmargin,
    backgroundColor: "var(--color-foreground)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: justify,
    minHeight: "100vh",
  };

  return (
    <Fragment>
      <Helmet>
        <title>{title}</title>
      </Helmet>
      <main style={layoutstyles}>
        {access === "private" && <Navbar />}
        {children}
      </main>
    </Fragment>
  );
};

export default Pages;
