import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { handleAuth } from "../plugins/handler";
import { useNotifications } from "../../components/feedbacks/context/notifications-context";
import LoadingScreen from "../../components/feedbacks/screens";

export const PrivateRoute = ({ element }) => {
  const [authenticated, setAuthenticated] = useState(null);
  const { showNotifications } = useNotifications();

  useEffect(() => {
    const checkAuthentication = async () => {
      const result = await handleAuth(showNotifications);
      setAuthenticated(result);
    };

    checkAuthentication();
  }, []);

  if (authenticated === null) {
    return <LoadingScreen />;
  }

  return authenticated ? element : <Navigate to="/" />;
};
