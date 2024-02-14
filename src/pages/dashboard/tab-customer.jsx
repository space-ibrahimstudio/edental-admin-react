import React from "react";
import { Helmet } from "react-helmet";
import { UserList } from "../../sections/user-list";
import { PageScreen } from "../../components/layout/page-screen";

const CustomerTab = () => {
  return (
    <PageScreen pageId="dashboard-customer">
      <Helmet>
        <title>Dashboard - Customer</title>
      </Helmet>
      <UserList />
    </PageScreen>
  );
};

export default CustomerTab;
