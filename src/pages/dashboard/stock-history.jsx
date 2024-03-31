import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useParams } from "react-router-dom";
import { PageScreen } from "../../components/layout/page-screen";
import { Nav } from "../../components/navigator/nav";
import { fetchLogStock } from "../../components/tools/data";
import { useNotifications } from "../../components/feedback/context/notifications-context";
import {
  TableData,
  TableRow,
  TableHeadValue,
  TableBodyValue,
} from "../../components/layout/tables";
import styles from "../../sections/styles/tabel-section.module.css";

const StockHistory = () => {
  const { showNotifications } = useNotifications();
  const { stockName } = useParams();
  // data state
  const [stockData, setStockData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  // conditional context
  const [isLoading, setIsLoading] = useState(false);

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
        setIsLoading(true);
        const data = await fetchLogStock(stockName);
        setStockData(data.data);
        setFilteredData(data.data);
      } catch (error) {
        console.error("Error fetching history stock data:", error);
        showNotifications("danger", "Error fetching history stock data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [stockName]);

  return (
    <PageScreen pageId={`${stockName}-history`}>
      <Helmet>
        <title>{stockName} History</title>
      </Helmet>
      <Nav />
      <section className={styles.tabelSection}>
        <b className={styles.tabelSectionTitle}>
          History Stock for {stockName}
        </b>
        {/* <div className={styles.tabelSectionNav}>
          <InputWrapper>
            <SearchInput
              id="search-reservation"
              placeholder="Search data ..."
              property="itemname"
              userData={stockData}
              setUserData={setFilteredData}
            />
          </InputWrapper>
        </div> */}
        <TableData
          headerData={tableHeadData}
          loading={isLoading}
          dataShown={true}
        >
          {filteredData.map((history, index) => (
            <TableRow key={index} isEven={index % 2 === 0}>
              <TableBodyValue type="num" value={index + 1} />
              <TableBodyValue value={history.sku} />
              <TableBodyValue value={history.logstockcreate} />
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
