import React, { useState } from "react";
import { Input } from "@ibrahimstudio/input";
import { SearchIcon } from "../layouts/icons";
import styles from "./styles/user-input.module.css";

export const SearchInput = ({ id, placeholder, property, userData, setUserData, isReadonly }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e) => {
    const searchTerm = e.target.value;
    setSearchTerm(searchTerm);

    const filteredData = userData.filter((item) => {
      const findProperty = (obj, prop) => {
        if (obj && typeof obj === "object") {
          for (let key in obj) {
            if (key.toLowerCase() === prop.toLowerCase()) {
              return obj[key];
            } else if (typeof obj[key] === "object") {
              return findProperty(obj[key], prop);
            }
          }
        }
        return undefined;
      };

      const itemProperty = findProperty(item, property);

      if (itemProperty && typeof itemProperty === "string") {
        return itemProperty.toLowerCase().includes(searchTerm.toLowerCase());
      }
      return false;
    });

    setUserData(filteredData);
  };

  return (
    <Input
      id={id}
      isLabeled={false}
      placeholder={placeholder}
      type="text"
      radius="full"
      name={searchTerm}
      value={searchTerm}
      onChange={handleSearch}
      isReadonly={isReadonly}
      startContent={<SearchIcon width="17px" height="100%" />}
    />
  );
};

export const InputWrap = ({ width, isExpanded, expanded, children }) => {
  return (
    <div className={styles.inputWrap} style={{ width: width }}>
      {children}
      {isExpanded && <div className={styles.inputExpand}>{expanded}</div>}
    </div>
  );
};
