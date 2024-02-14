import React from "react";
import { Helmet } from "react-helmet";
import { UserList } from "../../sections/user-list";
import { PageScreen } from "../../components/layout/page-screen";

const OverviewTab = () => {
  return (
    <PageScreen pageId="dashboard-overview">
      <Helmet>
        <title>Dashboard - Overview</title>
      </Helmet>
      <UserList />
    </PageScreen>
  );
};

export default OverviewTab;
