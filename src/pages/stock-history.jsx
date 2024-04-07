import React, { useState, useEffect } from "react";
import { Button } from "@ibrahimstudio/button";
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
import { InputWrapper, SearchInput } from "../components/user-input/inputs";
import { ArrowIcon } from "../components/layout/icons";
import styles from "../sections/styles/tabel-section.module.css";

const StockHistory = () => {
  const navigate = useNavigate();
  const { showNotifications } = useNotifications();
  const { stockName } = useParams();
  const [stockData, setStockData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isDataShown, setIsDataShown] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  const goBack = () => {
    navigate(-1);
  };

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
          setFilteredData(data.data);
          setIsDataShown(true);
        } else {
          setStockData([]);
          setFilteredData([]);
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
    <PageScreen pageId={`${stockName}-history`}>
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
          </InputWrapper>
          <InputWrapper>
            <SearchInput
              id={`search-data-${stockName}`}
              placeholder="Cari data ..."
              property="sku"
              userData={stockData}
              setUserData={setFilteredData}
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
