import React from "react";
import { Helmet } from "react-helmet";
import { Order } from "../../sections/order";
import { PageScreen } from "../../components/layout/page-screen";

const OrderTab = () => {
  return (
    <PageScreen pageId="dashboard-order" variant="section">
      <Helmet>
        <title>Dashboard - Order</title>
      </Helmet>
      <Order sectionId="order-customer" />
    </PageScreen>
  );
};

export default OrderTab;
