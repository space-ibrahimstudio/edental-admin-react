import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useContent } from "@ibrahimstudio/react";
import { useAuth } from "../../libs/securities/auth";
import { Button } from "@ibrahimstudio/button";
import { fetchTabMenus } from "../../libs/sources/data";
import { ExitIcon } from "../layouts/icons";
import { TabButton, DropDownButton } from "../input-controls/buttons";
import { useNotifications } from "../feedbacks/context/notifications-context";
import styles from "./styles/navbar.module.css";

const Navbar = () => {
  const navigate = useNavigate();
  const { toPathname, toTitleCase } = useContent();
  const { logout } = useAuth();
  const { showNotifications } = useNotifications();
  const [tabMenus, setTabMenus] = useState([]);

  const logoutClick = () => logout();
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
      <section className={styles.navBody}>
        <img className={styles.navLogo} loading="lazy" alt="Navbar Logo" src="/svg/logo-primary.svg" onClick={() => navigate("/")} />
        {/* prettier-ignore */}
        <div className={styles.navMenu}>
          {Array.isArray(tabMenus) && tabMenus.map((menu, index) => (
            <TabButton
              key={index}
              isActive={menu["Menu Utama"].menu_name}
              hasSubMenu={menu["Sub Menu"] && menu["Sub Menu"].length > 0}
              buttonText={menu["Menu Utama"].menu_name}
            >
              {menu["Sub Menu"] && menu["Sub Menu"].map((submenu, index) => (
                <DropDownButton
                  key={index}
                  buttonText={toTitleCase(submenu.submenu_name)}
                  onClick={() => SubTabClick(menu["Menu Utama"].menu_name, submenu.submenu_name)}
                />
              ))}
            </TabButton>
          ))}
        </div>
        <Button id="logout" size="sm" radius="full" buttonText="Logout" endContent={<ExitIcon width="14px" height="100%" />} onClick={logoutClick} />
      </section>
    </nav>
  );
};

export default Navbar;
