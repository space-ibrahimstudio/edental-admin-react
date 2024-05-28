import React, { useEffect, useState, Fragment } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { useContent } from "@ibrahimstudio/react";
import { useAuth } from "./libs/securities/auth";
import { PrivateRoute } from "./libs/securities/routes";
import LoginPage from "./pages/login";
import DashboardOverviewPage from "./pages/overview-dashboard";
import DashboardSlugPage from "./pages/slug-dashboard";
import Dashboard from "./pages/dashboard";
import StockHistory from "./pages/stock-history";
import DetailOrder from "./pages/order-detail";
import { fetchTabMenus } from "./libs/sources/data";

function App() {
  const { pathname } = useLocation();
  const { toPathname } = useContent();
  const { isLoggedin } = useAuth();
  const [tabMenus, setTabMenus] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const menus = await fetchTabMenus();
        setTabMenus(menus);
      } catch (error) {
        console.error("Error fetching tab menus:", error);
      }
    };
    if (isLoggedin) {
      fetchMenus();
    }
  }, [isLoggedin]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<DashboardOverviewPage />} />
      <Route path="/dashboard" element={<PrivateRoute element={<Dashboard />} />} />
      {/* prettier-ignore */}
      <Fragment>
        {Array.isArray(tabMenus) && tabMenus.map((menu, index) => (
          <Fragment key={index}>
            <Route path={`/dashboard/${toPathname(menu["Menu Utama"].menu_name)}`} element={<PrivateRoute element={<Dashboard />} />} />
            {menu["Sub Menu"] && menu["Sub Menu"].map((submenu, index) => (
              <Fragment key={index}>
                <Route
                  path={`/dashboard/${toPathname(menu["Menu Utama"].menu_name)}/${toPathname(submenu.submenu_name)}`}
                  element={<PrivateRoute element={<Dashboard />} />}
                />
                <Route
                  path={`/${toPathname(menu["Menu Utama"].menu_name)}/${toPathname(submenu.submenu_name)}`}
                  element={<DashboardSlugPage parent={menu["Menu Utama"].menu_name} slug={submenu.submenu_name} />} />
              </Fragment>
            ))}
          </Fragment>
        ))}
      </Fragment>
      <Route path="/dashboard/warehouse/stock/:stockName" element={<StockHistory />} />
      <Route path="/dashboard/order/order-customer/:noInvoice" element={<DetailOrder />} />
    </Routes>
  );
}

export default App;
