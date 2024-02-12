import React from "react";
import { Helmet } from "react-helmet";
import { LogoText } from "../layout/icons";
import "./styles/loading-screen.css";

export function LoadingScreen() {
  return (
    <div className="loading-screen">
      <Helmet>
        <title>Loading ...</title>
      </Helmet>
      <div className="loading-wrapper">
        <div className="loading-circle">
          <div className="loading-circle-body">
            <div className="circle-body" />
            <div className="circle-body" />
            <div className="circle-body" />
          </div>
          <div className="loading-circle-shadow">
            <div className="circle-shadow" />
            <div className="circle-shadow" />
            <div className="circle-shadow" />
          </div>
        </div>
        <LogoText width="100%" height="18px" />
      </div>
    </div>
  );
}
