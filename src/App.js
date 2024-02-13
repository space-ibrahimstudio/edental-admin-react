import React, { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { useLoading } from "./components/feedback/context/loading-context";
import { PrivateRoute } from "./components/routing/private-route";
import HomeReplace from "./pages/home-replace";
import Dashboard from "./pages/dashboard/dashboard";
import SubmitReservation from "./pages/submit-reservation";
import { fetchTabMenus } from "./components/tools/data";
import { formatPathname } from "./components/tools/controller";

function App() {
  const [tabMenus, setTabMenus] = useState([]);
  const { setLoading } = useLoading();

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        setLoading(true);

        const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true";
        if (isLoggedIn) {
          const menus = await fetchTabMenus();
          setTabMenus(menus);
        } else {
          console.log("User is not logged in.");
        }
      } catch (error) {
        console.error("Error fetching tab menus:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenus();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<HomeReplace />} />
      <Route
        path="/dashboard/"
        element={<PrivateRoute element={<Dashboard />} />}
      />
      {Array.isArray(tabMenus) &&
        tabMenus.map((menu) => (
          <React.Fragment key={menu["Menu Utama"].idmenu}>
            <Route
              path={`/dashboard/${formatPathname(
                menu["Menu Utama"].menu_name
              )}`}
              element={<PrivateRoute element={<Dashboard />} />}
            />
            {menu["Sub Menu"] &&
              menu["Sub Menu"].map((submenu) => (
                <Route
                  key={submenu.idsubmenu}
                  path={`/dashboard/${formatPathname(
                    menu["Menu Utama"].menu_name
                  )}/${formatPathname(submenu.submenu_name)}`}
                  element={<PrivateRoute element={<Dashboard />} />}
                />
              ))}
          </React.Fragment>
        ))}
      <Route path="/submit-reservation" element={<SubmitReservation />} />
    </Routes>
  );
}

export default App;
