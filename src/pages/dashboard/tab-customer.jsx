import React, { useEffect } from "react";
import { Helmet } from "react-helmet";
import { CustList } from "../../sections/cust-list";
import { PageScreen } from "../../components/layout/page-screen";

const CustomerTab = () => {
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const element = document.getElementById(hash.substring(1));
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 800);
      }
    }
  }, []);

  return (
    <PageScreen pageId="dashboard-customer" variant="section">
      <Helmet>
        <title>Dashboard - Customer</title>
      </Helmet>
      <CustList sectionId="data-customer" />
    </PageScreen>
  );
};

export default CustomerTab;
