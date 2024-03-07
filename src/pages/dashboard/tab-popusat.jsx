import React from "react";
import { Helmet } from "react-helmet";
import { CentralPO } from "../../sections/central-po";
import { PageScreen } from "../../components/layout/page-screen";

const CentralPOTab = () => {
  return (
    <PageScreen pageId="dashboard-popusat" variant="section">
      <Helmet>
        <title>Dashboard - PO Pusat</title>
      </Helmet>
      <CentralPO sectionId="po-pusat" />
    </PageScreen>
  );
};

export default CentralPOTab;
