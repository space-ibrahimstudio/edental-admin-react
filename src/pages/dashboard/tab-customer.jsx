import React from "react";
import { Helmet } from "react-helmet";
import { CustList } from "../../sections/cust-list";
import { PageScreen } from "../../components/layout/page-screen";

const CustomerTab = () => {
  return (
    <PageScreen pageId="dashboard-customer" variant="section">
      <Helmet>
        <title>Dashboard - Customer</title>
      </Helmet>
      <CustList sectionId="data-customer" />
    </PageScreen>
  );
};

export default CustomerTab;
