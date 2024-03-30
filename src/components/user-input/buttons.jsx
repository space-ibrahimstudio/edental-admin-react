import React, { useState, useEffect, useRef } from "react";
import { Fragment } from "../tools/controller";
import { useLocation, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { toTitleCase } from "../tools/controller";
import { LoadingElement } from "../feedback/loading-screen";
import { ChevronDown, ArrowIcon } from "../layout/icons";
import prim from "./styles/prim-button.module.css";
import scnd from "./styles/scnd-button.module.css";
import tab from "./styles/tab-button.module.css";

export function PrimButton({
  variant,
  buttonText,
  onClick,
  iconPosition,
  children,
  loading,
}) {
  if (iconPosition === "start") {
    if (variant === "hollow") {
      return (
        <button className={prim.primButtonHollow} onClick={onClick}>
          {children}
          <b className={prim.primButtonHollowText}>{buttonText}</b>
        </button>
      );
    } else {
      return (
        <button className={prim.primButton} onClick={onClick}>
          {loading ? (
            <Fragment>
              <b className={prim.primButtonHollowText}>Loading</b>
              <LoadingElement />
            </Fragment>
          ) : (
            <Fragment>
              {children}
              <b className={prim.primButtonText}>{buttonText}</b>
            </Fragment>
          )}
        </button>
      );
    }
  } else {
    if (variant === "hollow") {
      return (
        <button className={prim.primButtonHollow} onClick={onClick}>
          <b className={prim.primButtonHollowText}>{buttonText}</b>
          {children}
        </button>
      );
    } else {
      return (
        <button className={prim.primButton} onClick={onClick}>
          {loading ? (
            <Fragment>
              <b className={prim.primButtonHollowText}>Loading</b>
              <LoadingElement />
            </Fragment>
          ) : (
            <Fragment>
              <b className={prim.primButtonText}>{buttonText}</b>
              {children}
            </Fragment>
          )}
        </button>
      );
    }
  }
}

PrimButton.propTypes = {
  onClick: PropTypes.func,
  buttonText: PropTypes.string,
  iconPosition: PropTypes.string,
  children: PropTypes.node,
  variant: PropTypes.string,
};

export function SecondaryButton({
  buttonText,
  onClick,
  variant,
  subVariant,
  iconPosition,
  children,
}) {
  if (variant === "icon") {
    if (subVariant === "hollow") {
      return (
        <button className={scnd.scndButtonHollow} onClick={onClick}>
          {children}
        </button>
      );
    } else if (subVariant === "hollow-line") {
      return (
        <button className={scnd.scndButtonHollowLine} onClick={onClick}>
          {children}
        </button>
      );
    } else {
      return (
        <button className={scnd.scndButton} onClick={onClick}>
          {children}
        </button>
      );
    }
  } else {
    if (iconPosition === "start") {
      if (subVariant === "hollow") {
        return (
          <button className={scnd.scndButtonHollow} onClick={onClick}>
            {children}
            <b className={scnd.scndButtonText}>{buttonText}</b>
          </button>
        );
      } else if (subVariant === "hollow-line") {
        return (
          <button className={scnd.scndButtonHollowLine} onClick={onClick}>
            {children}
            <b className={scnd.scndButtonText}>{buttonText}</b>
          </button>
        );
      } else {
        return (
          <button className={scnd.scndButton} onClick={onClick}>
            {children}
            <b className={scnd.scndButtonText}>{buttonText}</b>
          </button>
        );
      }
    } else {
      if (subVariant === "hollow") {
        return (
          <button className={scnd.scndButtonHollow} onClick={onClick}>
            <b className={scnd.scndButtonText}>{buttonText}</b>
            {children}
          </button>
        );
      } else if (subVariant === "hollow-line") {
        return (
          <button className={scnd.scndButtonHollowLine} onClick={onClick}>
            <b className={scnd.scndButtonText}>{buttonText}</b>
            {children}
          </button>
        );
      } else {
        return (
          <button className={scnd.scndButton} onClick={onClick}>
            <b className={scnd.scndButtonText}>{buttonText}</b>
            {children}
          </button>
        );
      }
    }
  }
}

SecondaryButton.propTypes = {
  onClick: PropTypes.func,
  buttonText: PropTypes.string,
  variant: PropTypes.string,
  subVariant: PropTypes.string,
  iconPosition: PropTypes.string,
  children: PropTypes.node,
};

export function DropDownButton({ buttonText, onClick }) {
  // const titleCaseText = toTitleCase(buttonText);

  return (
    <div className={tab.dropdownButton} onClick={onClick}>
      <b className={tab.dropdownButtonText}>{buttonText}</b>
      <div className={tab.dropdownButtonIcon}>
        <ArrowIcon width="10px" height="100%" />
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
      className={`${tab.navMenuTab} ${
        activeTab === isActive ? tab.active : ""
      }`}
      onClick={handleClick}
    >
      <b className={tab.navMenuTabText}>{titleCaseText}</b>
      {hasSubMenu && (
        <ChevronDown width="10px" height="100%" flipped={dropdownOpen} />
      )}
      {dropdownOpen && (
        <section
          ref={ref}
          className={`${tab.dropdown} ${
            dropdownOpen ? tab.opened : tab.closed
          }`}
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
