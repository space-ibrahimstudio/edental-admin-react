import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchTabMenus } from "../tools/data";
import { handleLogout } from "../tools/handler";
import { LogoPrimary, UserAvatar, BellNotification } from "../layout/icons";
import {
  TabButton,
  DropDownButton,
  SecondaryButton,
} from "../user-input/buttons";
import { useNotifications } from "../feedback/context/notifications-context";
import { toPathname } from "../tools/controller";
import "./styles/nav.css";

export function Nav() {
  const [tabMenus, setTabMenus] = useState([]);

  const navigate = useNavigate();
  const { showNotifications } = useNotifications();

  const logoutClick = () => {
    handleLogout();
    navigate("/");
    showNotifications("success", "Kamu berhasil logout. Mohon login kembali.");
  };

  const SubTabClick = (menuName, submenuName) => {
    const formattedMenuName = toPathname(menuName);
    const formattedSubmenuName = toPathname(submenuName);
    const url = `/dashboard/${formattedMenuName}/${formattedSubmenuName}`;
    navigate(url);
  };

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const menus = await fetchTabMenus();
        setTabMenus(menus);
      } catch (error) {
        console.error("Error fetching tab menus:", error);
        showNotifications("danger", "Error fetching tab menus.");
      }
    };

    fetchMenus();
  }, []);

  return (
    <nav className="nav">
      <div className="nav-body">
        <LogoPrimary width="140px" height="100%" />
        <div className="nav-menu">
          {Array.isArray(tabMenus) &&
            tabMenus.map((menu) => (
              <TabButton
                key={menu["Menu Utama"].idmenu}
                isActive={menu["Menu Utama"].menu_name}
                hasSubMenu={menu["Sub Menu"] && menu["Sub Menu"].length > 0}
                buttonText={menu["Menu Utama"].menu_name}
              >
                {menu["Sub Menu"] &&
                  menu["Sub Menu"].map((submenu) => (
                    <DropDownButton
                      key={submenu.idsubmenu}
                      buttonText={submenu.submenu_name}
                      onClick={() =>
                        SubTabClick(
                          menu["Menu Utama"].menu_name,
                          submenu.submenu_name
                        )
                      }
                    />
                  ))}
              </TabButton>
            ))}
        </div>
        <div className="nav-option">
          <div className="nav-notif">
            <BellNotification width="100%" height="25px" />
            <div className="nav-notif-counter">
              <div className="nav-notif-counter-text">3</div>
            </div>
          </div>
          <div className="nav-user">
            <UserAvatar width="37.6px" height="100%" />
          </div>
          <SecondaryButton buttonText="Keluar" onClick={logoutClick} />
        </div>
      </div>
    </nav>
  );
}
