import React, { useState } from "react";
import PropTypes from "prop-types";
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
    <div className={styles.inputLabel}>
      <label htmlFor={id} className={styles.inputLabelField}>
        <div className={styles.closeWrapper} style={{ padding: "0 0 0 10px" }}>
          <SearchIcon width="17px" height="100%" />
        </div>
        <input
          id={id}
          className={styles.inputLabelFieldInput}
          placeholder={placeholder}
          type="text"
          value={searchTerm}
          onChange={handleSearch}
        />
      </label>
    </div>
  );
}

export function InputWrapper({ maxWidth, children }) {
  return (
    <div className={styles.inputWrap} style={{ maxWidth: maxWidth }}>
      {children}
    </div>
  );
}

export function UserInput({
  variant,
  subVariant,
  children,
  id,
  labelText,
  error,
  min,
  placeholder,
  type,
  name,
  value,
  isRequired,
  onChange,
}) {
  const [passwordSeen, setPasswordSeen] = useState(false);
  const togglePasswordSeen = () => {
    setPasswordSeen(!passwordSeen);
  };

  if (variant === "select") {
    if (subVariant === "nolabel") {
      return (
        <div className={styles.inputLabel}>
          <label htmlFor={id} className={styles.inputLabelField}>
            <select
              id={id}
              className={styles.inputLabelFieldInput}
              name={name}
              value={value}
              onChange={onChange}
              required={isRequired}
            >
              {children}
            </select>
          </label>
          {error && (
            <h6
              className={styles.inputLabelText}
              style={{ color: "var(--color-red)" }}
            >
              {error}
            </h6>
          )}
        </div>
      );
    } else {
      return (
        <div className={styles.inputLabel}>
          <h6 className={styles.inputLabelText}>{labelText}</h6>
          <label htmlFor={id} className={styles.inputLabelField}>
            <select
              id={id}
              className={styles.inputLabelFieldInput}
              name={name}
              value={value}
              onChange={onChange}
              required={isRequired}
            >
              {children}
            </select>
          </label>
          {error && (
            <h6
              className={styles.inputLabelText}
              style={{ color: "var(--color-red)" }}
            >
              {error}
            </h6>
          )}
        </div>
      );
    }
  } else {
    if (type === "password") {
      if (subVariant === "nolabel") {
        return (
          <div className={styles.inputLabel}>
            <label htmlFor={id} className={styles.inputLabelField}>
              <input
                id={id}
                className={styles.inputLabelFieldInput}
                placeholder={placeholder}
                type={passwordSeen ? "text" : "password"}
                name={name}
                value={value}
                onChange={onChange}
                min={min}
                required={isRequired}
              />
              <div
                className={styles.closeWrapper}
                style={{ padding: "0 10px 0 0" }}
                onClick={togglePasswordSeen}
              >
                {passwordSeen ? (
                  <EyeSlash width="19px" height="100%" color="#3880EB" />
                ) : (
                  <EyeOpen width="19px" height="100%" color="#3880EB" />
                )}
              </div>
            </label>
            {error && (
              <h6
                className={styles.inputLabelText}
                style={{ color: "var(--color-red)" }}
              >
                {error}
              </h6>
            )}
          </div>
        );
      } else {
        return (
          <div className={styles.inputLabel}>
            <h6 className={styles.inputLabelText}>{labelText}</h6>
            <label htmlFor={id} className={styles.inputLabelField}>
              <input
                id={id}
                className={styles.inputLabelFieldInput}
                placeholder={placeholder}
                type={passwordSeen ? "text" : "password"}
                name={name}
                value={value}
                onChange={onChange}
                min={min}
                required={isRequired}
              />
              <div
                className={styles.closeWrapper}
                style={{ padding: "0 10px 0 0" }}
                onClick={togglePasswordSeen}
              >
                {passwordSeen ? (
                  <EyeSlash width="19px" height="100%" color="#3880EB" />
                ) : (
                  <EyeOpen width="19px" height="100%" color="#3880EB" />
                )}
              </div>
            </label>
            {error && (
              <h6
                className={styles.inputLabelText}
                style={{ color: "var(--color-red)" }}
              >
                {error}
              </h6>
            )}
          </div>
        );
      }
    } else {
      if (subVariant === "nolabel") {
        return (
          <div className={styles.inputLabel}>
            <label htmlFor={id} className={styles.inputLabelField}>
              <input
                id={id}
                className={styles.inputLabelFieldInput}
                placeholder={placeholder}
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                min={min}
                required={isRequired}
              />
            </label>
            {error && (
              <h6
                className={styles.inputLabelText}
                style={{ color: "var(--color-red)" }}
              >
                {error}
              </h6>
            )}
          </div>
        );
      } else {
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
                min={min}
                required={isRequired}
              />
            </label>
            {error && (
              <h6
                className={styles.inputLabelText}
                style={{ color: "var(--color-red)" }}
              >
                {error}
              </h6>
            )}
          </div>
        );
      }
    }
  }
}
