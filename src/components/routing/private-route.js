import { Navigate } from "react-router-dom";

const isAuthenticated = () => {
  const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true";

  if (!isLoggedIn) {
    console.log("User is not logged in.");
    return false;
  }

  const userName = sessionStorage.getItem("username");
  const userSecret = sessionStorage.getItem("secret");
  const userLevel = sessionStorage.getItem("level");
  if (userName && userSecret && userLevel) {
    console.log(`User is logged in. Welcome back ${userName}!`);
    return true;
  } else {
    console.log("User is not logged in or session expired.");
    return false;
  }
};

export const PrivateRoute = ({ element }) => {
  return isAuthenticated() ? element : <Navigate to="/" />;
};
