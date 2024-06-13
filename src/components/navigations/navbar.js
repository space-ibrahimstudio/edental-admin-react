import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useContent } from "@ibrahimstudio/react";
import { Button } from "@ibrahimstudio/button";
import { useAuth } from "../../libs/securities/auth";
import { useApi } from "../../libs/apis/office";
import { useNotifications } from "../feedbacks/context/notifications-context";
import { TabButton, DropDownButton } from "../input-controls/buttons";
import { Power } from "../contents/icons";
import styles from "./styles/navbar.module.css";

const Navbar = () => {
  const navigate = useNavigate();
  const { toPathname, toTitleCase } = useContent();
  const { secret, level, logout } = useAuth();
  const { apiRead } = useApi();
  const { showNotifications } = useNotifications();
  const [tabMenus, setTabMenus] = useState([]);

  const logoutClick = () => logout();
  const SubTabClick = (menuName, submenuName) => {
    const formattedmenu = toPathname(menuName);
    const formattedsubmenu = toPathname(submenuName);
    const url = `/${formattedmenu}/${formattedsubmenu}`;
    navigate(url);
  };

  const fetchData = async () => {
    const errormsg = `Terjadi kesalahan saat memuat Dashboard. Mohon periksa koneksi internet anda dan coba lagi.`;
    const menuFormData = new FormData();
    try {
      menuFormData.append("data", JSON.stringify({ secret, level }));
      const menudata = await apiRead(menuFormData, "office", "viewmenu");
      const menuparams = menudata.data;
      if (menuparams && menuparams.length > 0) {
        setTabMenus(menuparams);
      } else {
        setTabMenus([]);
      }
    } catch (error) {
      showNotifications("danger", errormsg);
      console.error(errormsg, error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <nav className={styles.nav}>
      <section className={styles.navBody}>
        <img className={styles.navLogo} loading="lazy" alt="Navbar Logo" src="/svg/logo-primary.svg" onClick={() => navigate("/")} />
        {/* prettier-ignore */}
        <div className={styles.navMenu}>
          {Array.isArray(tabMenus) && tabMenus.map((menu, index) => (
            <TabButton key={index} isActive={menu["Menu Utama"].menu_name} hasSubMenu={menu["Sub Menu"] && menu["Sub Menu"].length > 0} buttonText={menu["Menu Utama"].menu_name}>
              {menu["Sub Menu"] && menu["Sub Menu"].map((submenu, index) => (
                <DropDownButton key={index} buttonText={toTitleCase(submenu.submenu_name)} onClick={() => SubTabClick(menu["Menu Utama"].menu_name, submenu.submenu_name)} />
              ))}
            </TabButton>
          ))}
        </div>
      </section>
      <Button id="logout" size="sm" radius="full" buttonText="Keluar" onClick={logoutClick} startContent={<Power />} />
    </nav>
  );
};

export default Navbar;
