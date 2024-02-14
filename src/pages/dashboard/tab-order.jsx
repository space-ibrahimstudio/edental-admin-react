import React from "react";
import { Helmet } from "react-helmet";
import { Reservation } from "../../sections/reservation";
import { PageScreen } from "../../components/layout/page-screen";

const OrderTab = () => {
  return (
    <PageScreen pageId="dashboard-order">
      <Helmet>
        <title>Dashboard - Order</title>
      </Helmet>
      <Reservation />
    </PageScreen>
  );
};

export default OrderTab;
