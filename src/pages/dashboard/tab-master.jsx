import React, { useEffect } from "react";
import { Helmet } from "react-helmet";
import { UserList } from "../../sections/user-list";
import { Services } from "../../sections/services";
import { ServiceTypes } from "../../sections/service-types";
import { BranchList } from "../../sections/branch-list";
import { PageScreen } from "../../components/layout/page-screen";

const MasterTab = () => {
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
    <PageScreen pageId="dashboard-master" variant="section">
      <Helmet>
        <title>Dashboard - Master</title>
      </Helmet>
      <UserList sectionId="manajemen-user" />
      <Services sectionId="nama-layanan" />
      <ServiceTypes sectionId="jenis-layanan" />
      <BranchList sectionId="cabang-edental" />
    </PageScreen>
  );
};

export default MasterTab;
