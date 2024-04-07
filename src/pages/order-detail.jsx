import React, { useState, useEffect } from "react";
import { Button } from "@ibrahimstudio/button";
import { formatDate } from "@ibrahimstudio/function";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";
import { PageScreen } from "../components/layout/page-screen";
import { Nav } from "../components/navigator/nav";
import { fetchDataList } from "../components/tools/data";
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

const DetailOrder = () => {
  const navigate = useNavigate();
  const { showNotifications } = useNotifications();
  const { noInvoice } = useParams();
  const [orderDetail, setOrderDetail] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isDataShown, setIsDataShown] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const goBack = () => {
    navigate(-1);
  };

  // end add data function
  const tableHeadData = (
    <TableRow type="heading">
      <TableHeadValue value="NO" type="num" />
      <TableHeadValue value="Tanggal Dibuat" />
      <TableHeadValue value="Nama Layanan" />
      <TableHeadValue value="Jenis Layanan" />
      <TableHeadValue value="Harga" />
      <TableHeadValue value="Status" position="end" />
    </TableRow>
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchDataList(0, 500, "vieworder");
        const order = data.data.find(
          (order) => order["Transaction"].noinvoice === noInvoice
        );

        if (order && order["Detail Transaction"].length > 0) {
          setOrderDetail(order["Detail Transaction"]);
          setFilteredData(order["Detail Transaction"]);
          setIsDataShown(true);
        } else {
          setOrderDetail([]);
          setFilteredData([]);
          setIsDataShown(false);
        }
      } catch (error) {
        console.error("Error fetching history stock data:", error);
        showNotifications(
          "danger",
          "Gagal menampilkan data Detail Order. Mohon periksa koneksi internet anda dan muat ulang halaman."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    setIsDataShown(filteredData.length > 0);
  }, [filteredData]);

  return (
    <PageScreen pageId={`${noInvoice}-history`}>
      <Helmet>
        <title>Order Detail no.{noInvoice}</title>
      </Helmet>
      <Nav />
      <section className={styles.tabelSection}>
        <b className={styles.tabelSectionTitle}>
          Order Detail for #{noInvoice}
        </b>
        <div className={styles.tabelSectionNav}>
          <InputWrapper>
            <Button
              id={`${noInvoice}-back-previous-page`}
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
              id={`search-data-${noInvoice}`}
              placeholder="Cari data ..."
              property="service"
              userData={orderDetail}
              setUserData={setFilteredData}
            />
          </InputWrapper>
        </div>
        <TableData
          headerData={tableHeadData}
          loading={isLoading}
          dataShown={isDataShown}
        >
          {orderDetail.map((detail, index) => (
            <TableRow key={index} isEven={index % 2 === 0}>
              <TableBodyValue type="num" value={index + 1} />
              <TableBodyValue
                value={formatDate(detail.transactiondetailcreate, "en-gb")}
              />
              <TableBodyValue value={detail.service} />
              <TableBodyValue value={detail.servicetype} />
              <TableBodyValue value={detail.price} />
              <TableBodyValue value={detail.transactionstatus} position="end" />
            </TableRow>
          ))}
        </TableData>
      </section>
    </PageScreen>
  );
};

export default DetailOrder;
