import React from "react";
import { Helmet } from "react-helmet";
import { UserList } from "../../sections/user-list";

const OverviewTab = () => {
  return (
    <div className="dashboard">
      <Helmet>
        <title>Dashboard - Master</title>
      </Helmet>
      <UserList title="Overview" />
    </div>
  );
};

export default OverviewTab;
