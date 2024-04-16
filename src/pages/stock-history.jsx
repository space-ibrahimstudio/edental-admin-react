import React, { useState, useEffect } from "react";
import { Button } from "@ibrahimstudio/button";
import { Input } from "@ibrahimstudio/input";
import { exportToExcel } from "../components/tools/controller";
import { formatDate, toTitleCase } from "@ibrahimstudio/function";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";
import { PageScreen } from "../components/layout/page-screen";
import { Nav } from "../components/navigator/nav";
import { fetchLogStock } from "../components/tools/data";
import { useNotifications } from "../components/feedback/context/notifications-context";
import {
  TableData,
  TableRow,
  TableHeadValue,
  TableBodyValue,
} from "../components/layout/tables";
import { InputWrapper } from "../components/user-input/inputs";
import { ArrowIcon } from "../components/layout/icons";
import styles from "../sections/styles/tabel-section.module.css";

const StockHistory = () => {
  const navigate = useNavigate();
  const { showNotifications } = useNotifications();
  const { stockName } = useParams();
  const [stockData, setStockData] = useState([]);
  const [isDataShown, setIsDataShown] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const goBack = () => {
    navigate(-1);
  };

  const handleStartDateChange = (event) => {
    setStartDate(event.target.value);
  };

  const handleEndDateChange = (event) => {
    setEndDate(event.target.value);
  };

  const filteredData = stockData.filter((history) => {
    if (!startDate || !endDate) return true;
    const historyDate = new Date(history.logstockcreate);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return historyDate >= start && historyDate <= end;
  });

  // end add data function
  const tableHeadData = (
    <TableRow type="heading">
      <TableHeadValue value="NO" type="num" />
      <TableHeadValue value="SKU" />
      <TableHeadValue value="Tanggal Dibuat" />
      <TableHeadValue value="Status" />
      <TableHeadValue value="Harga" />
      <TableHeadValue value="QTY." />
      <TableHeadValue value="Total Harga" />
      <TableHeadValue value="Cabang" position="end" />
    </TableRow>
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsFetching(true);
        const data = await fetchLogStock(stockName);

        if (data && data.data && data.data.length > 0) {
          setStockData(data.data);
          setIsDataShown(true);
        } else {
          setStockData([]);
          setIsDataShown(false);
        }
      } catch (error) {
        console.error("Error fetching history stock data:", error);
        showNotifications("danger", "Error fetching history stock data.");
      } finally {
        setIsFetching(false);
      }
    };

    fetchData();
  }, [stockName]);

  useEffect(() => {
    setIsDataShown(filteredData.length > 0);
  }, [filteredData]);

  return (
    <PageScreen pageId={`${stockName}-history`} variant="section">
      <Helmet>
        <title>{toTitleCase(stockName)} Stock History</title>
      </Helmet>
      <Nav />
      <section className={styles.tabelSection}>
        <b className={styles.tabelSectionTitle}>
          History Stock for {toTitleCase(stockName)}
        </b>
        <div className={styles.tabelSectionNav}>
          <InputWrapper>
            <Button
              id={`${stockName}-back-previous-page`}
              buttonText="Kembali"
              radius="full"
              startContent={
                <ArrowIcon direction="left" width="17px" height="100%" />
              }
              onClick={goBack}
            />
            <Button
              id={`export-data-${stockName}`}
              buttonText="Export ke Excel"
              radius="full"
              bgColor="var(--color-green)"
              onClick={() =>
                exportToExcel(filteredData, "Histori Stok", "histori_stok")
              }
            />
          </InputWrapper>
          <InputWrapper>
            <Input
              id={`${stockName}-filter-start`}
              isLabeled={false}
              type="date"
              placeholder="Pilih tanggal"
              name="startDate"
              value={startDate}
              onChange={handleStartDateChange}
            />
            <Input
              id={`${stockName}-filter-end`}
              isLabeled={false}
              type="date"
              placeholder="Pilih tanggal"
              name="endDate"
              value={endDate}
              onChange={handleEndDateChange}
            />
          </InputWrapper>
        </div>
        <TableData
          headerData={tableHeadData}
          loading={isFetching}
          dataShown={isDataShown}
        >
          {filteredData.map((history, index) => (
            <TableRow key={index} isEven={index % 2 === 0}>
              <TableBodyValue type="num" value={index + 1} />
              <TableBodyValue value={history.sku} />
              <TableBodyValue
                value={formatDate(history.logstockcreate, "en-gb")}
              />
              <TableBodyValue value={history.status} />
              <TableBodyValue value={history.value} />
              <TableBodyValue value={history.qty} />
              <TableBodyValue value={history.totalvalue} />
              <TableBodyValue value={history.outletname} position="end" />
            </TableRow>
          ))}
        </TableData>
      </section>
    </PageScreen>
  );
};

export default StockHistory;
