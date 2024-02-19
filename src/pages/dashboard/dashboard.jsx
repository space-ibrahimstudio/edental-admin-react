import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useLocation } from "react-router-dom";
import { Nav } from "../../components/navigator/nav";
import { PageScreen } from "../../components/layout/page-screen";
import OverviewTab from "./tab-overview";
import CustomerTab from "./tab-customer";
import MasterTab from "./tab-master";
import ReportTab from "./tab-report";
import StockTab from "./tab-stock";
import OrderTab from "./tab-order";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("");
  const location = useLocation();

  useEffect(() => {
    const pathname = location.pathname;
    const paths = pathname.split("/");
    const parentTabName = paths[2]?.toUpperCase();
    setActiveTab(parentTabName);
  }, [location.pathname]);

  const renderTabContent = () => {
    switch (activeTab) {
      case "CUSTOMER":
        return <CustomerTab />;
      case "MASTER":
        return <MasterTab />;
      case "REPORT":
        return <ReportTab />;
      case "STOCK":
        return <StockTab />;
      case "ORDER":
        return <OrderTab />;
      default:
        return <OverviewTab />;
    }
  };

  return (
    <PageScreen pageId="dashboard">
      <Helmet>
        <title>Dashboard</title>
      </Helmet>
      <Nav />
      {renderTabContent()}
    </PageScreen>
  );
};

export default Dashboard;
