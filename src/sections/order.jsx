import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@ibrahimstudio/input";
import { formatDate } from "@ibrahimstudio/function";
import { fetchDataList } from "../components/tools/data";
import { useNotifications } from "../components/feedback/context/notifications-context";
import { TableData, TableRow, TableHeadValue, TableBodyValue } from "../components/layout/tables";
import { InputWrapper, SearchInput } from "../components/user-input/inputs";
import { PaginationV2 } from "../components/navigator/paginationv2";
import styles from "./styles/tabel-section.module.css";

export const Order = ({ sectionId }) => {
  const navigate = useNavigate();
  const { showNotifications } = useNotifications();
  // data state
  const [orderData, setOrderData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  // conditional context
  const [isDataShown, setIsDataShown] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalPages, setTotalPages] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  // start data paging
  const options = [
    { value: 5, label: "Baris per Halaman: 5" },
    { value: 10, label: "Baris per Halaman: 10" },
    { value: 20, label: "Baris per Halaman: 20" },
    { value: 50, label: "Baris per Halaman: 50" },
  ];
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  const handleLimitChange = (value) => {
    setLimit(value);
    setCurrentPage(1);
  };
  const navigateOrderDetail = (noInvoice) => {
    navigate(`/dashboard/order/order-customer/${noInvoice}`);
  };
  // end data paging
  const tableHeadData = (
    <TableRow type="heading">
      <TableHeadValue type="num" value="NO" />
      <TableHeadValue value="Tanggal Order" />
      <TableHeadValue value="Kode Reservasi" />
      <TableHeadValue value="Nomor Invoice" />
      <TableHeadValue value="Nama Pengguna" />
      <TableHeadValue value="Telepon" />
      <TableHeadValue value="Tipe Pembayaran" />
      <TableHeadValue value="Status Pembayaran" />
      <TableHeadValue value="Kode Voucher" />
      <TableHeadValue value="Nama Dokter" />
      <TableHeadValue value="Cabang" position="end" />
    </TableRow>
  );

  useEffect(() => {
    const fetchData = async (page, limit) => {
      try {
        setIsFetching(true);
        const offset = (page - 1) * limit;
        const data = await fetchDataList(offset, limit, "vieworder");

        if (data && data.data && data.data.length > 0) {
          setOrderData(data.data);
          setFilteredData(data.data);
          setTotalPages(data.TTLPage);
          setIsDataShown(true);
        } else {
          setOrderData([]);
          setFilteredData([]);
          setTotalPages(0);
          setIsDataShown(false);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        showNotifications("danger", "Gagal menampilkan data Order. Mohon periksa koneksi internet anda dan muat ulang halaman.");
      } finally {
        setIsFetching(false);
      }
    };

    fetchData(currentPage, limit);
  }, [currentPage, limit]);

  useEffect(() => {
    setIsDataShown(filteredData.length > 0);
  }, [filteredData]);

  return (
    <section id={sectionId} className={styles.tabelSection}>
      <b className={styles.tabelSectionTitle}>Order Customer</b>
      <div className={styles.tabelSectionNav}>
        <InputWrapper>
          <SearchInput
            id={`search-data-${sectionId}`}
            placeholder="Cari data ..."
            property="transactionname"
            userData={orderData}
            setUserData={setFilteredData}
          />
        </InputWrapper>
        <InputWrapper>
          <Input
            id={`limit-data-${sectionId}`}
            variant="select"
            radius="full"
            isLabeled={false}
            placeholder="Baris per Halaman"
            value={limit}
            options={options}
            onSelect={handleLimitChange}
            isReadonly={isDataShown ? false : true}
          />
        </InputWrapper>
      </div>
      <TableData headerData={tableHeadData} dataShown={isDataShown} loading={isFetching}>
        {filteredData.map((order, index) => (
          <TableRow key={index} isEven={index % 2 === 0} isClickable={true} onClick={() => navigateOrderDetail(order["Transaction"].noinvoice)}>
            <TableBodyValue type="num" value={(currentPage - 1) * limit + index + 1} />
            <TableBodyValue value={formatDate(order["Transaction"].transactioncreate, "en-gb")} />
            <TableBodyValue value={order["Transaction"].rscode} />
            <TableBodyValue value={order["Transaction"].noinvoice} />
            <TableBodyValue value={order["Transaction"].transactionname} />
            <TableBodyValue value={order["Transaction"].transactionphone} />
            <TableBodyValue value={order["Transaction"].payment} />
            <TableBodyValue value={order["Transaction"].transactionstatus} />
            <TableBodyValue value={order["Transaction"].voucher} />
            <TableBodyValue value={order["Transaction"].dentist} />
            <TableBodyValue value={order["Transaction"].outlet_name} position="end" />
          </TableRow>
        ))}
      </TableData>
      {isDataShown && <PaginationV2 currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />}
    </section>
  );
};
