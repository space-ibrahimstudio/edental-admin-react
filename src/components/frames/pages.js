import React from "react";
import Navbar from "../navigations/navbar";

const Pages = ({ pageid, children }) => {
  return (
    <main id={`edentail-admin-${pageid}`}>
      <Navbar />
      {children}
    </main>
  );
};

export default Pages;
