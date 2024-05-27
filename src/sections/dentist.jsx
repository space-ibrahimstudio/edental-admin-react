import React, { useState, useEffect } from "react";
import { exportToExcel } from "../libs/plugins/controller";
import { Input } from "@ibrahimstudio/input";
import { Button } from "@ibrahimstudio/button";
import { fetchDataList } from "../libs/sources/data";
import { useNotifications } from "../components/feedbacks/context/notifications-context";
import { TableData, TableRow, TableHeadValue, TableBodyValue } from "../components/layouts/tables";
import { InputWrap, SearchInput } from "../components/input-controls/inputs";
import Pagination from "../components/navigations/pagination";
import styles from "./styles/tabel-section.module.css";

export const DentistList = ({ sectionId }) => {
  const { showNotifications } = useNotifications();
  // data state
  const [dentistData, setDentistData] = useState([]);
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
  // end data paging
  const tableHeadData = (
    <TableRow type="heading">
      <TableHeadValue type="num" value="NO" />
      <TableHeadValue value="Nama Dokter" />
      <TableHeadValue value="Kode Outlet" />
      <TableHeadValue value="Nomor Telepon" />
      <TableHeadValue value="Email" position="end" />
    </TableRow>
  );

  useEffect(() => {
    const fetchData = async (page, limit) => {
      try {
        setIsFetching(true);
        const offset = (page - 1) * limit;
        const data = await fetchDataList(offset, limit, "viewdentist");

        if (data && data.data && data.data.length > 0) {
          setDentistData(data.data);
          setFilteredData(data.data);
          setTotalPages(data.TTLPage);
          setIsDataShown(true);
        } else {
          setDentistData([]);
          setFilteredData([]);
          setTotalPages(0);
          setIsDataShown(false);
        }
      } catch (error) {
        console.error("Error fetching customer data:", error);
        showNotifications("danger", "Gagal menampilkan data Customer. Mohon periksa koneksi internet anda dan muat ulang halaman.");
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
      <b className={styles.tabelSectionTitle}>List Dokter</b>
      <div className={styles.tabelSectionNav}>
        <InputWrap>
          <SearchInput
            id={`search-data-${sectionId}`}
            placeholder="Cari data ..."
            property="username"
            userData={dentistData}
            setUserData={setFilteredData}
          />
        </InputWrap>
        <InputWrap>
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
          <Button
            id={`export-data-${sectionId}`}
            buttonText="Export ke Excel"
            radius="full"
            bgColor="var(--color-green)"
            onClick={() => exportToExcel(filteredData, "Daftar Dokter", "daftar_dokter")}
          />
        </InputWrap>
      </div>
      <TableData headerData={tableHeadData} dataShown={isDataShown} loading={isFetching}>
        {filteredData.map((cust, index) => (
          <TableRow key={index} isEven={index % 2 === 0}>
            <TableBodyValue type="num" value={(currentPage - 1) * limit + index + 1} />
            <TableBodyValue value={cust.name_dentist} />
            <TableBodyValue value={cust.id_branch} />
            <TableBodyValue value={cust.phone} />
            <TableBodyValue value={cust.email} position="end" />
          </TableRow>
        ))}
      </TableData>
      {isDataShown && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />}
    </section>
  );
};
