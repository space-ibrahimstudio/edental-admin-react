import React from "react";
import { Helmet } from "react-helmet";
import { CustList } from "../../sections/cust-list";
import { PageScreen } from "../../components/layout/page-screen";

const OverviewTab = () => {
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
