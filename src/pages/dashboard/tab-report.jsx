import React, { useEffect } from "react";
import { Helmet } from "react-helmet";
import { Accounting } from "../../sections/accounting";
import { PageScreen } from "../../components/layout/page-screen";

const ReportTab = () => {
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
    <PageScreen pageId="dashboard-report" variant="section">
      <Helmet>
        <title>Dashboard - Report</title>
      </Helmet>
      <Accounting sectionId="kas" />
    </PageScreen>
  );
};

export default ReportTab;
