import React, { useState, useEffect } from "react";
import { useAuth } from "../../libs/securities/auth";
import { User, NetOn, NetOff, Speed, Cached, Okay } from "../contents/icons";
import styles from "./styles/bottom-bar.module.css";

const BarContent = ({ content, startContent }) => {
  return (
    <div className={styles.barContent}>
      {startContent}
      <p className={styles.contentText}>{content}</p>
    </div>
  );
};

const BarContentWrap = ({ children }) => {
  return <section className={styles.barContentwrap}>{children}</section>;
};

const BottomBar = ({ loading }) => {
  const { ip_address, username } = useAuth();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [batteryStatus, setBatteryStatus] = useState({ level: null, charging: null });
  const [memoryUsage, setMemoryUsage] = useState({ jsHeapSizeLimit: null, totalJSHeapSize: null, usedJSHeapSize: null });

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);
    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  useEffect(() => {
    const updateBatteryStatus = (battery) => {
      setBatteryStatus({ level: (battery.level * 100).toFixed(0), charging: battery.charging });
    };
    const getBatteryStatus = async () => {
      const battery = await navigator.getBattery();
      updateBatteryStatus(battery);
      battery.addEventListener("levelchange", () => updateBatteryStatus(battery));
      battery.addEventListener("chargingchange", () => updateBatteryStatus(battery));
    };
    getBatteryStatus();
  }, []);

  useEffect(() => {
    const updateMemoryUsage = () => {
      if (performance.memory) {
        const { jsHeapSizeLimit, totalJSHeapSize, usedJSHeapSize } = performance.memory;
        setMemoryUsage({
          jsHeapSizeLimit: (jsHeapSizeLimit / 1048576).toFixed(2),
          totalJSHeapSize: (totalJSHeapSize / 1048576).toFixed(2),
          usedJSHeapSize: (usedJSHeapSize / 1048576).toFixed(2),
        });
      }
    };
    updateMemoryUsage();
    const interval = setInterval(updateMemoryUsage, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className={styles.bottomBar}>
      <BarContentWrap>
        <BarContent content={username} startContent={<User />} />
        <BarContent content={loading ? "memuat data ..." : "siap digunakan"} startContent={loading ? <Cached animate /> : <Okay />} />
        <BarContent content={`${memoryUsage.usedJSHeapSize} MB`} startContent={<Speed />} />
      </BarContentWrap>
      <BarContentWrap>
        <BarContent content={`IP: ${ip_address}`} />
        <BarContent content={isOnline ? "online" : "offline"} startContent={isOnline ? <NetOn /> : <NetOff />} />
        <BarContent content={`battery: ${batteryStatus.level}%`} />
      </BarContentWrap>
    </footer>
  );
};

export default BottomBar;
