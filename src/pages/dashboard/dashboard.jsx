import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useLocation } from "react-router-dom";
import { Nav } from "../../components/navigator/nav";
import MasterTab from "./tab-master";
import CustomerTab from "./tab-customer";
import OverviewTab from "./tab-overview";
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
        return <MasterTab />;
      case "STOCK":
        return <MasterTab />;
      case "ORDER":
        return <OrderTab />;
      default:
        return <OverviewTab />;
    }
  };

  return (
    <div className="dashboard">
      <Helmet>
        <title>Dashboard</title>
      </Helmet>
      <Nav />
      {renderTabContent()}
    </div>
  );
};

export default Dashboard;
