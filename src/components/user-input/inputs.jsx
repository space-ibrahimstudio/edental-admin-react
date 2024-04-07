import React, { useState } from "react";
import PropTypes from "prop-types";
import { Input } from "@ibrahimstudio/input";
import { EyeOpen, EyeSlash, SearchIcon } from "../layout/icons";
import "./styles/field-input.css";
import styles from "./styles/user-input.module.css";

export function FieldInput({
  id,
  type,
  name,
  placeholder,
  autoComplete,
  value,
  onChange,
  errorMssg,
  forgotFunction,
}) {
  const [passwordSeen, setPasswordSeen] = useState(false);
  const togglePasswordSeen = () => {
    setPasswordSeen(!passwordSeen);
  };

  if (type === "password") {
    return (
      <div className="input-field">
        <label htmlFor={id} style={{ display: "none" }}>
          {placeholder}
        </label>
        <div className="input-field-input">
          <input
            id={id}
            className="input-field-value"
            placeholder={placeholder}
            type={passwordSeen ? "text" : "password"}
            name={name}
            value={value}
            onChange={onChange}
            autoComplete={autoComplete}
          />
          <div className="input-field-toggle" onClick={togglePasswordSeen}>
            {passwordSeen ? (
              <EyeSlash width="19px" height="100%" color="#3880EB" />
            ) : (
              <EyeOpen width="19px" height="100%" color="#3880EB" />
            )}
          </div>
        </div>
        {errorMssg && (
          <div className="input-field-mssg">
            <h6 className="input-field-mssg-text">{errorMssg}</h6>
          </div>
        )}
        <div className="input-field-mssg" onClick={forgotFunction}>
          <h6 className="input-field-help-text">Lupa Password?</h6>
        </div>
      </div>
    );
  } else {
    return (
      <div className="input-field">
        <label htmlFor={id} style={{ display: "none" }}>
          {placeholder}
        </label>
        <div className="input-field-input">
          <input
            id={id}
            className="input-field-value"
            placeholder={placeholder}
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            autoComplete={autoComplete}
          />
        </div>
        {errorMssg && (
          <div className="input-field-mssg">
            <h6 className="input-field-mssg-text">{errorMssg}</h6>
          </div>
        )}
      </div>
    );
  }
}

FieldInput.propTypes = {
  id: PropTypes.string.isRequired,
  type: PropTypes.string,
  name: PropTypes.string,
  placeholder: PropTypes.string,
  autoComplete: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  errorMssg: PropTypes.string,
  forgotFunction: PropTypes.func,
};

export function SearchInput({
  id,
  placeholder,
  property,
  userData,
  setUserData,
  isReadonly,
}) {
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
}

SearchInput.propTypes = {
  id: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  property: PropTypes.string.isRequired,
  userData: PropTypes.array,
  setUserData: PropTypes.func,
  isReadonly: PropTypes.bool,
};

export function InputWrapper({ width, isExpanded, expanded, children }) {
  return (
    <div className={styles.inputWrap} style={{ width: width }}>
      {children}
      {isExpanded && <div className={styles.inputExpand}>{expanded}</div>}
    </div>
  );
}

InputWrapper.propTypes = {
  width: PropTypes.string,
  isExpanded: PropTypes.bool,
  expanded: PropTypes.node,
  children: PropTypes.node.isRequired,
};
