import React from "react";
import { Helmet } from "react-helmet";
import { UserList } from "../../sections/user-list";
import { PageScreen } from "../../components/layout/page-screen";

const UserTab = () => {
  return (
    <PageScreen pageId="dashboard-user" variant="section">
      <Helmet>
        <title>Dashboard - User List</title>
      </Helmet>
      <UserList sectionId="manajemen-user" />
    </PageScreen>
  );
};

export default UserTab;
