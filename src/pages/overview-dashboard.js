import React, { useState, useEffect, Fragment } from "react";
import { Navigate } from "react-router-dom";
import { useFormat } from "@ibrahimstudio/react";
import { useAuth } from "../libs/securities/auth";
import { useApi } from "../libs/apis/office";
import { useLoading } from "../components/feedbacks/context/loading-context";
import Pages from "../components/frames/pages";
import SummarySet, { SummaryCard } from "../components/contents/summary";
import styles from "./styles/dashboard.module.css";

export const DashboardBody = ({ children }) => {
  return <div className={styles.sectionBody}>{children}</div>;
};

export const DashboardTool = ({ children }) => {
  return <div className={styles.sectionTool}>{children}</div>;
};

export const DashboardToolbar = ({ children }) => {
  return <nav className={styles.sectionNav}>{children}</nav>;
};

export const DashboardHead = ({ title, desc }) => {
  return (
    <header className={styles.sectionHead}>
      <h1 className={styles.sectionTitle}>{title}</h1>
      {desc && <p className={styles.sectionDesc}>{desc}</p>}
    </header>
  );
};

export const DashboardContainer = ({ children }) => {
  return <section className={styles.section}>{children}</section>;
};

const DashboardOverviewPage = () => {
  const { isLoggedin, secret } = useAuth();
  const { newPrice } = useFormat();
  const { apiRead } = useApi();
  const { setLoading } = useLoading();
  const [summaryData, setSummaryData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const formData = new FormData();
      try {
        formData.append("data", JSON.stringify({ secret, idoutlet: "1", date: "2024-07-29 12:24:10" }));
        const summarydata = await apiRead(formData, "office", "viewdashboard");
        if (summarydata && summarydata.data) {
          setSummaryData(summarydata.data);
        } else {
          setSummaryData(null);
        }
      } catch (error) {
        console.log("error:", error);
      } finally {
        setLoading(false);
      }
    };
    if (isLoggedin) {
      fetchData();
    }
  }, []);

  if (!isLoggedin) {
    return <Navigate to="/login" />;
  }

  return (
    <Pages title="Overview | Dashboard">
      <DashboardContainer>
        <DashboardHead title="Overview" desc="Ringkasan total jumlah Reservasi, Transaksi dan Fitur lainnya." />
        {summaryData === null ? (
          <div>Loading ...</div>
        ) : (
          <Fragment>
            <SummarySet title="Reservasi" count={summaryData.reservation.totalrs} row="3">
              <SummaryCard summaryLabel="Reservasi Berlangsung" summaryValue={summaryData.reservation.pending} />
              <SummaryCard summaryLabel="Reservasi Selesai" summaryValue={summaryData.reservation.complete} />
              <SummaryCard summaryLabel="Reservasi Terbayar" summaryValue={summaryData.reservation.paid} />
              <SummaryCard summaryLabel="Reservasi Dibatalkan" summaryValue={summaryData.reservation.cancel} />
              <SummaryCard summaryLabel="Reservasi Dijadwalkan Ulang" summaryValue={summaryData.reservation.reschedule} />
              <SummaryCard summaryLabel="Pendapatan Total" summaryValue={newPrice(summaryData.reservation.totalpaid)} />
            </SummarySet>
            <SummarySet title="Transaksi" count={summaryData.order.totalorder} row="4">
              <SummaryCard summaryLabel="Transaksi Berlangsung" summaryValue={summaryData.order.pending} />
              <SummaryCard summaryLabel="Transaksi Selesai" summaryValue={summaryData.order.paid} />
              <SummaryCard summaryLabel="Transaksi Dibatalkan" summaryValue={summaryData.order.cancel} />
              <SummaryCard summaryLabel="Pendapatan Total" summaryValue={newPrice(summaryData.order.totalpaid)} />
            </SummarySet>
          </Fragment>
        )}
      </DashboardContainer>
    </Pages>
  );
};

export default DashboardOverviewPage;
