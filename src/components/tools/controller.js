import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function toTitleCase(str) {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

export function toPathname(pathname) {
  return pathname.toLowerCase().replace(/\s+/g, "-");
}

export function getCurrentDate() {
  const today = new Date();
  const year = today.getFullYear();
  let month = today.getMonth() + 1;
  let day = today.getDate();

  month = month < 10 ? "0" + month : month;
  day = day < 10 ? "0" + day : day;

  return `${year}-${month}-${day}`;
}

export function Fragment({ children }) {
  return <React.Fragment>{children}</React.Fragment>;
}

export function ResetScrolling() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
