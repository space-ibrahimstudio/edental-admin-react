import React, { useEffect } from "react";
import { Helmet } from "react-helmet";
import { SupplyPO } from "../../sections/supply-po";
import { CentralPO } from "../../sections/central-po";
import { PageScreen } from "../../components/layout/page-screen";

const StockTab = () => {
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const element = document.getElementById(hash.substring(1));
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 800);
      }
    }
  }, []);

  return (
    <PageScreen pageId="dashboard-stock" variant="section">
      <Helmet>
        <title>Dashboard - Stock</title>
      </Helmet>
      <SupplyPO sectionId="po-supply" />
      <CentralPO sectionId="po-pusat" />
    </PageScreen>
  );
};

export default StockTab;
