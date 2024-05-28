import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { useDevmode } from "@ibrahimstudio/react";
import { useNotifications } from "../../components/feedbacks/context/notifications-context";
import LoadingScreen from "../../components/feedbacks/screens";

const AuthContext = createContext();
const apiURL = process.env.REACT_APP_API_URL;

export const AuthProvider = ({ children }) => {
  const location = useLocation();
  const { log } = useDevmode();
  const { showNotifications } = useNotifications();
  const [isLoggedin, setIsLoggedin] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (reqdata) => {
    try {
      const formData = new FormData();
      formData.append("data", JSON.stringify({ username: reqdata.username, password: reqdata.password }));
      const url = `${apiURL}/authapi/login`;
      const response = await axios.post(url, formData, { headers: { "Content-Type": "multipart/form-data" } });
      const loginresponse = response.data;
      if (!loginresponse.error) {
        const userdata = loginresponse.data[0];
        const { username, secret, level, idoutlet, outlet_name, cctr } = userdata;
        sessionStorage.setItem("logged-in", "true");
        sessionStorage.setItem("username", username);
        sessionStorage.setItem("secret", secret);
        sessionStorage.setItem("level", level);
        sessionStorage.setItem("outlet-id", idoutlet);
        sessionStorage.setItem("outlet-name", outlet_name);
        sessionStorage.setItem("outlet-code", cctr);
        log("successfully logged in:", loginresponse);
        showNotifications("success", `Kamu berhasil login. Selamat datang kembali, ${username}!`);
        setIsLoggedin(true);
      } else if (!loginresponse.status) {
        log("invalid username or password!");
        showNotifications("danger", "Username atau Password yang kamu masukkan salah.");
        setIsLoggedin(false);
      } else {
        log("please check your internet connection and try again.");
        showNotifications("danger", "Ada kesalahan saat login. Periksa koneksi internet dan coba lagi.");
        setIsLoggedin(false);
      }
    } catch (error) {
      showNotifications("danger", "Permintaan tidak dapat di proses. Mohon coba sesaat lagi.");
      console.error("error occurred during login:", error);
      setIsLoggedin(false);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    try {
      sessionStorage.removeItem("logged-in");
      sessionStorage.removeItem("username");
      sessionStorage.removeItem("secret");
      sessionStorage.removeItem("level");
      sessionStorage.removeItem("outlet-id");
      sessionStorage.removeItem("outlet-name");
      sessionStorage.removeItem("outlet-code");
      setIsLoggedin(false);
      log("successfully logged out");
      showNotifications("success", "Kamu berhasil logout. Mohon login ulang untuk mengakses Dashboard.");
    } catch (error) {
      showNotifications("danger", "Permintaan tidak dapat di proses. Mohon coba sesaat lagi.");
      console.error("error occurred during logout:", error);
    } finally {
      setLoading(false);
    }
  };

  const auth = async () => {
    try {
      const loggedin = sessionStorage.getItem("logged-in");
      const secret = sessionStorage.getItem("secret");
      const level = sessionStorage.getItem("level");
      if (loggedin === "true" && secret && level) {
        log("user logged in");
        setIsLoggedin(true);
      } else {
        sessionStorage.removeItem("logged-in");
        sessionStorage.removeItem("username");
        sessionStorage.removeItem("secret");
        sessionStorage.removeItem("level");
        sessionStorage.removeItem("outlet-id");
        sessionStorage.removeItem("outlet-name");
        sessionStorage.removeItem("outlet-code");
        log("user is not logged in");
        setIsLoggedin(false);
      }
    } catch (error) {
      console.error("error occurred during authentication check:", error);
    } finally {
      setLoading(false);
    }
  };

  const secret = sessionStorage.getItem("secret");
  const level = sessionStorage.getItem("level");

  useEffect(() => {
    auth();
  }, [location]);

  if (isLoggedin === null || loading) {
    return <LoadingScreen />;
  }

  return <AuthContext.Provider value={{ loading, isLoggedin, login, logout, secret, level }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
