import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useNotifications } from "../../components/feedback/context/notifications-context";
import { useLoading } from "../../components/feedback/context/loading-context";
import { fetchTabMenus } from "../../components/tools/data";
import { UserList } from "../../sections/user-list";

const CustomerTab = () => {
  const [tabMenus, setTabMenus] = useState([]);

  const { showNotifications } = useNotifications();
  const { setLoading } = useLoading();

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        setLoading(true);
        const menus = await fetchTabMenus(showNotifications);
        setTabMenus(menus);
      } catch (error) {
        console.error("Error fetching tab menus:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenus();
  }, []);

  return (
    <div className="dashboard">
      <Helmet>
        <title>Dashboard - Customer</title>
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

export default CustomerTab;
