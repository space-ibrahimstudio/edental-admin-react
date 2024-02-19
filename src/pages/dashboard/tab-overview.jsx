import React, { useEffect } from "react";
import { Helmet } from "react-helmet";
import { CustList } from "../../sections/cust-list";
import { PageScreen } from "../../components/layout/page-screen";

const OverviewTab = () => {
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
    <PageScreen pageId="dashboard-overview" variant="section">
      <Helmet>
        <title>Dashboard - Overview</title>
      </Helmet>
      <CustList sectionId="data-customer" />
    </PageScreen>
  );
};

export default OverviewTab;
