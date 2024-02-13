import React from "react";
import { Helmet } from "react-helmet";
import { UserList } from "../../sections/user-list";

const CustomerTab = () => {
  return (
    <div className="dashboard">
      <Helmet>
        <title>Dashboard - Customer</title>
      </Helmet>
      <UserList />
    </div>
  );
};

export default CustomerTab;
