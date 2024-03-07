import React from "react";
import { Helmet } from "react-helmet";
import { Services } from "../../sections/services";
import { PageScreen } from "../../components/layout/page-screen";

const ServiceTab = () => {
  return (
    <PageScreen pageId="dashboard-service" variant="section">
      <Helmet>
        <title>Dashboard - Service</title>
      </Helmet>
      <Services sectionId="service" />
    </PageScreen>
  );
};

export default ServiceTab;
