import React from "react";
import { Helmet } from "react-helmet";
import { Reservation } from "../../sections/reservation";

const OrderTab = () => {
  return (
    <div className="dashboard">
      <Helmet>
        <title>Dashboard - Order</title>
      </Helmet>
      <Reservation />
    </div>
  );
};

export default OrderTab;
