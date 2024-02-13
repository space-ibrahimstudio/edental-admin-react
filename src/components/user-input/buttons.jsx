import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { toTitleCase } from "../tools/controller";
import { ChevronDown, ArrowLeft } from "../layout/icons";
import "./styles/prim-button.css";
import "./styles/tab-button.css";

export function PrimButton({ buttonText, onClick }) {
  return (
    <button className="prim-button" onClick={onClick}>
      <b className="prim-button-text">{buttonText}</b>
    </button>
  );
}

PrimButton.propTypes = {
  onClick: PropTypes.func,
  buttonText: PropTypes.string.isRequired,
};

export function DropDownButton({ buttonText, onClick }) {
  const titleCaseText = toTitleCase(buttonText);

  return (
    <div className="dropdown-button" onClick={onClick}>
      <b className="dropdown-button-text">{titleCaseText}</b>
      <div className="dropdown-button-icon">
        <ArrowLeft width="10px" height="100%" />
      </div>
    </div>
  );
}

DropDownButton.propTypes = {
  onClick: PropTypes.func,
  buttonText: PropTypes.string.isRequired,
};

export function TabButton({ isActive, hasSubMenu, buttonText, children }) {
  const [activeTab, setActiveTab] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const titleCaseText = toTitleCase(buttonText);
  const navigate = useNavigate();
  const location = useLocation();
  const ref = useRef(null);

  const toggleDropdown = () => {
    setDropdownOpen((prevOpen) => !prevOpen);
  };

  const TabClick = (tabName) => {
    setActiveTab(tabName);
    navigate(`/dashboard/${tabName.toLowerCase()}`);
  };

  const handleClick = () => {
    if (hasSubMenu) {
      toggleDropdown();
    } else {
      TabClick(buttonText);
    }
  };

  const handleClickOutside = (event) => {
    if (ref.current && !ref.current.contains(event.target)) {
      setDropdownOpen(false);
    }
  };

  useEffect(() => {
    const pathname = location.pathname;
    const paths = pathname.split("/");
    const parentTabName = paths[2]?.toUpperCase();
    setActiveTab(parentTabName);
  }, [location.pathname]);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <button
      className={`nav-menu-tab ${activeTab === isActive ? "active" : ""}`}
      onClick={handleClick}
    >
      <b className="nav-menu-tab-text">{titleCaseText}</b>
      {hasSubMenu && (
        <ChevronDown width="10px" height="100%" flipped={dropdownOpen} />
      )}
      {dropdownOpen && (
        <section
          ref={ref}
          className={`dropdown ${dropdownOpen ? "opened" : "closed"}`}
        >
          {children}
        </section>
      )}
    </button>
  );
}

TabButton.propTypes = {
  isActive: PropTypes.string.isRequired,
  hasSubMenu: PropTypes.bool.isRequired,
  buttonText: PropTypes.string.isRequired,
  children: PropTypes.node,
};
