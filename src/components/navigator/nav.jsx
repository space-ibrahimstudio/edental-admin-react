import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchTabMenus } from "../tools/data";
import { handleLogout } from "../tools/handler";
import { TabButton, DropDownButton } from "../user-input/buttons";
import { useNotifications } from "../feedback/context/notifications-context";
import { formatPathname } from "../tools/controller";
import "./styles/nav.css";

export function Nav() {
  const [tabMenus, setTabMenus] = useState([]);

  const navigate = useNavigate();
  const { showNotifications } = useNotifications();

  const logoutClick = () => {
    handleLogout();
    navigate("/");
  };

  const SubTabClick = (menuName, submenuName) => {
    const formattedMenuName = formatPathname(menuName);
    const formattedSubmenuName = formatPathname(submenuName);
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
        <img
          src="/svg/edental-blue.svg"
          style={{ width: "140px", height: "auto" }}
          alt=""
          loading="lazy"
        />
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
            <img
              className="bell-icon"
              loading="lazy"
              alt=""
              src="/svg/bell-icon.svg"
            />
            <div className="nav-notif-counter">
              <div className="nav-notif-counter-text">3</div>
            </div>
          </div>
          <div className="nav-user">
            <img
              className="user-icon"
              loading="lazy"
              alt=""
              src="/svg/user-icon.svg"
            />
          </div>
          <button className="scnd-button" onClick={logoutClick}>
            <b className="scnd-button-text">Keluar</b>
          </button>
        </div>
      </div>
    </nav>
  );
}
