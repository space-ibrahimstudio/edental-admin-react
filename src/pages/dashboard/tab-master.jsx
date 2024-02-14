import React from "react";
import { Helmet } from "react-helmet";
import { PageScreen } from "../../components/layout/page-screen";

const MasterTab = () => {
  return (
    <PageScreen pageId="dashboard-master">
      <Helmet>
        <title>Dashboard - Master</title>
      </Helmet>
    </PageScreen>
  );
};

export default MasterTab;
