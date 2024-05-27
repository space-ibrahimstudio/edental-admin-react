import React from "react";
import Navbar from "../navigator/navbar";

const PageLayout = ({ pageid, children }) => {
  return (
    <main id={`edentail-admin-${pageid}`}>
      <Navbar />
      {children}
    </main>
  );
};

export default PageLayout;
