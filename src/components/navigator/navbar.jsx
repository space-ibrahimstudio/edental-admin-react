import React, { useState, useEffect } from "react";
import { Button } from "@ibrahimstudio/button";
import { useNavigate } from "react-router-dom";
import { fetchTabMenus } from "../tools/data";
import { handleLogout } from "../tools/handler";
import { LogoPrimary, UserAvatar, BellNotification, ExitIcon } from "../layout/icons";
import { TabButton, DropDownButton } from "../user-input/buttons";
import { useNotifications } from "../feedback/context/notifications-context";
import { toPathname, toTitleCase } from "../tools/controller";
import styles from "./styles/nav.module.css";

const Navbar = () => {
  const [tabMenus, setTabMenus] = useState([]);

  const navigate = useNavigate();
  const { showNotifications } = useNotifications();

  const logoutClick = () => {
    handleLogout();
    showNotifications("success", "Kamu berhasil logout. Mohon login kembali.");
  };

  const logoClick = () => {
    navigate("/dashboard");
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
    <nav className={styles.nav}>
      <div className={styles.navBody}>
        <div style={{ cursor: "pointer" }} onClick={logoClick}>
          <LogoPrimary width="140px" height="100%" />
        </div>
        <div className={styles.navMenu}>
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
                      buttonText={toTitleCase(submenu.submenu_name)}
                      onClick={() => SubTabClick(menu["Menu Utama"].menu_name, submenu.submenu_name)}
                    />
                  ))}
              </TabButton>
            ))}
        </div>
        <div className={styles.navOption}>
          <div className={styles.navNotif}>
            <BellNotification width="100%" height="25px" />
            <div className={styles.navNotifCounter}>
              <div className={styles.navNotifCounterText}>3</div>
            </div>
          </div>
          <div className={styles.navUser}>
            <UserAvatar width="37.6px" height="100%" />
          </div>
          <Button
            id="logout"
            size="sm"
            radius="full"
            bgColor="var(--color-hint)"
            buttonText="Log out"
            endContent={<ExitIcon width="14px" height="100%" />}
            onClick={logoutClick}
          />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
