import React from "react";
import { Helmet } from "react-helmet";
import { Reservation } from "../../sections/reservation";
import { PageScreen } from "../../components/layout/page-screen";

const ReservationTab = () => {
  return (
    <PageScreen pageId="dashboard-reservation" variant="section">
      <Helmet>
        <title>Dashboard - Reservation</title>
      </Helmet>
      <Reservation sectionId="reservation" />
    </PageScreen>
  );
};

export default ReservationTab;
