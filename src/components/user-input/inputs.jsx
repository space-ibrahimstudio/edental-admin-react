import React, { useState } from "react";
import PropTypes from "prop-types";
import { EyeOpen, EyeSlash, SearchIcon } from "../layout/icons";
import "./styles/field-input.css";
import "./styles/search-input.css";
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
  }
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
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e) => {
    const searchTerm = e.target.value;
    setSearchTerm(searchTerm);
    const filteredData = userData.filter((item) =>
      item[property].toLowerCase().includes(searchTerm.toLowerCase())
    );
    setUserData(filteredData);
  };

  return (
    <div className="user-list-searchbar">
      <SearchIcon
        height="100%"
        width="17px"
        color="var(--color-semidarkblue)"
      />
      <label htmlFor={id} style={{ display: "none" }}>
        {placeholder}
      </label>
      <input
        id={id}
        className="user-list-searchbar-field"
        placeholder={placeholder}
        type="text"
        value={searchTerm}
        onChange={handleSearch}
      />
    </div>
  );
}

export function InputWrapper({ children }) {
  return <div className={styles.inputWrap}>{children}</div>;
}

export function UserInput({
  id,
  labelText,
  error,
  placeholder,
  type,
  name,
  value,
  onChange,
}) {
  return (
    <div className={styles.inputLabel}>
      <h6 className={styles.inputLabelText}>{labelText}</h6>
      <label htmlFor={id} className={styles.inputLabelField}>
        <input
          id={id}
          className={styles.inputLabelFieldInput}
          placeholder={placeholder}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
        />
      </label>
      {error && <h6 className={styles.inputLabelText}>{error}</h6>}
    </div>
  );
}
