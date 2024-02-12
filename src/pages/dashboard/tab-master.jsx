import React, { useState, useEffect } from "react";
import { UserList } from "../../sections/user-list";
import { useNotifications } from "../../components/feedback/context/notifications-context";
import { fetchTabMenus } from "../../components/tools/data";
import { Helmet } from "react-helmet";

const MasterTab = () => {
  const [tabMenus, setTabMenus] = useState([]);
  const { showNotifications } = useNotifications();

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const menus = await fetchTabMenus(showNotifications);
        setTabMenus(menus);
      } catch (error) {
        console.error("Error fetching tab menus:", error);
      }
    };

    fetchMenus();
  }, []);

  return (
    <div className="dashboard">
      <Helmet>
        <title>Dashboard - Master</title>
      </Helmet>
      {Array.isArray(tabMenus) &&
        tabMenus.map((menu) => (
          <UserList
            key={menu["Sub Menu"][0].idsubmenu}
            title={menu["Sub Menu"][0].submenu_name}
          />
        ))}
    </div>
  );
};

export default MasterTab;
