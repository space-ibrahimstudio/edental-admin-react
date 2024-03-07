import React from "react";
import { Helmet } from "react-helmet";
import { BranchList } from "../../sections/branch-list";
import { PageScreen } from "../../components/layout/page-screen";

const BranchTab = () => {
  return (
    <PageScreen pageId="dashboard-cabang" variant="section">
      <Helmet>
        <title>Dashboard - Cabang Edental</title>
      </Helmet>
      <BranchList sectionId="cabang" />
    </PageScreen>
  );
};

export default BranchTab;
