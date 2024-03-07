import React from "react";
import { Helmet } from "react-helmet";
import { Accounting } from "../../sections/accounting";
import { PageScreen } from "../../components/layout/page-screen";

const KasTab = () => {
  return (
    <PageScreen pageId="dashboard-kas" variant="section">
      <Helmet>
        <title>Dashboard - Kas</title>
      </Helmet>
      <Accounting sectionId="kas" />
    </PageScreen>
  );
};

export default KasTab;
