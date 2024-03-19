import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useLocation } from "react-router-dom";
import { Nav } from "../../components/navigator/nav";
import { PageScreen } from "../../components/layout/page-screen";
import OverviewTab from "./tab-overview";
import CustomerTab from "./tab-customer";
import UserTab from "./tab-user";
import ServiceTab from "./tab-service";
import BranchTab from "./tab-branch";
import KasTab from "./tab-kas";
import POSupplyTab from "./tab-posupply";
import StockTab from "./tab-stock";
import CentralPOTab from "./tab-popusat";
import ReservationTab from "./tab-reservation";
import OrderTab from "./tab-order";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("");
  const location = useLocation();

  useEffect(() => {
    const pathname = location.pathname;
    const paths = pathname.split("/");
    const parentTabName = paths[3];
    setActiveTab(parentTabName);
  }, [location.pathname]);

  const renderTabContent = () => {
    switch (activeTab) {
      case "data-customer":
        return <CustomerTab />;
      case "manajemen-user":
        return <UserTab />;
      case "layanan":
        return <ServiceTab />;
      case "cabang-edental":
        return <BranchTab />;
      case "kas":
        return <KasTab />;
      case "po-masuk":
        return <POSupplyTab />;
      case "stock":
        return <StockTab />;
      case "po-keluar":
        return <CentralPOTab />;
      case "reservation":
        return <ReservationTab />;
      case "order-customer":
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
