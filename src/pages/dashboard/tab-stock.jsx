import React from "react";
import { Helmet } from "react-helmet";
import { Stocks } from "../../sections/stocks";
import { PageScreen } from "../../components/layout/page-screen";

const StockTab = () => {
  return (
    <PageScreen pageId="dashboard-stock" variant="section">
      <Helmet>
        <title>Dashboard - Stock</title>
      </Helmet>
      <Stocks sectionId="stocks" />
    </PageScreen>
  );
};

export default StockTab;
