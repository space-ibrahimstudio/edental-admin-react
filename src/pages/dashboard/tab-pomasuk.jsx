import React from "react";
import { Helmet } from "react-helmet";
import { SupplyPO } from "../../sections/supply-po";
import { PageScreen } from "../../components/layout/page-screen";

const POMasukTab = () => {
  return (
    <PageScreen pageId="dashboard-pomasuk" variant="section">
      <Helmet>
        <title>Dashboard - PO Masuk</title>
      </Helmet>
      <SupplyPO sectionId="po-supply" />
    </PageScreen>
  );
};

export default POMasukTab;
