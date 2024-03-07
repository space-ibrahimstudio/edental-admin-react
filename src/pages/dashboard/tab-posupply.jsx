import React from "react";
import { Helmet } from "react-helmet";
import { SupplyPO } from "../../sections/supply-po";
import { PageScreen } from "../../components/layout/page-screen";

const POSupplyTab = () => {
  return (
    <PageScreen pageId="dashboard-posupply" variant="section">
      <Helmet>
        <title>Dashboard - PO Supply</title>
      </Helmet>
      <SupplyPO sectionId="po-supply" />
    </PageScreen>
  );
};

export default POSupplyTab;
