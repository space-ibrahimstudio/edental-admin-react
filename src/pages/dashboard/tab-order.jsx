import React from "react";
import { Helmet } from "react-helmet";
import { Reservation } from "../../sections/reservation";
import { Order } from "../../sections/order";
import { PageScreen } from "../../components/layout/page-screen";

const OrderTab = () => {
  return (
    <PageScreen pageId="dashboard-order">
      <Helmet>
        <title>Dashboard - Order</title>
      </Helmet>
      <Reservation />
      <Order />
    </PageScreen>
  );
};

export default OrderTab;
