import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { Nav } from "../components/navigator/nav";
import { PageScreen } from "../components/layout/page-screen";
import { Accounting } from "../sections/accounting";
import { BranchList } from "../sections/branch-list";
import { CentralPO } from "../sections/central-po";
import { CustList } from "../sections/cust-list";
import { Order } from "../sections/order";
import { InPO } from "../sections/in-po";
import { OutPO } from "../sections/out-po";
import { Reservation } from "../sections/reservation";
import { Services } from "../sections/services";
import { Stocks } from "../sections/stocks";
import { UserList } from "../sections/user-list";
import { MedicRecord } from "../sections/rekam-medis";

const componentMap = {
  "data-customer": CustList,
  "manajemen-user": UserList,
  layanan: Services,
  "cabang-edental": BranchList,
  kas: Accounting,
  "po-masuk": InPO,
  "po-keluar": OutPO,
  "po-pusat": CentralPO,
  stock: Stocks,
  reservation: Reservation,
  "order-customer": Order,
  "rekam-medis": MedicRecord,
};

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("");
  const [pageTitle, setPageTitle] = useState("");
  const [pageId, setPageId] = useState("overview");
  const location = useLocation();

  useEffect(() => {
    const pathname = location.pathname;
    const paths = pathname.split("/");
    const parentTabName = paths[3];
    setActiveTab(parentTabName);
  }, [location.pathname]);

  useEffect(() => {
    const pageTitleMap = {
      "data-customer": " - Data Customer",
      "manajemen-user": " - Manajemen User",
      layanan: " - Layanan",
      "cabang-edental": " - Cabang Edental",
      kas: " - Kas",
      "po-masuk": " - PO Masuk",
      "po-keluar": " - PO Keluar",
      "po-pusat": " - PO Pusat",
      stock: " - Data Stok",
      reservation: " - Reservasi",
      "order-customer": " - Data Order",
      "rekam-medis": " - Rekam Medis",
    };
    setPageTitle(pageTitleMap[activeTab] || "");
    setPageId(activeTab || "overview");
  }, [activeTab]);

  const RenderSectionContent = componentMap[activeTab] || CustList;

  return (
    <PageScreen pageId="edental-office-dashboard">
      <Helmet>
        <title>Dashboard{pageTitle}</title>
      </Helmet>
      <Nav />
      <PageScreen pageId={`dashboard-${pageId}`} variant="section">
        <RenderSectionContent sectionId={activeTab || "overview"} />
      </PageScreen>
    </PageScreen>
  );
};

export default Dashboard;
