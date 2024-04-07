import React, { useState, useEffect } from "react";
import { Input } from "@ibrahimstudio/input";
import { formatDate } from "@ibrahimstudio/function";
import { fetchDataList } from "../components/tools/data";
import { useNotifications } from "../components/feedback/context/notifications-context";
import {
  TableData,
  TableRow,
  TableHeadValue,
  TableBodyValue,
} from "../components/layout/tables";
import { InputWrapper, SearchInput } from "../components/user-input/inputs";
import { PaginationV2 } from "../components/navigator/paginationv2";
import styles from "./styles/tabel-section.module.css";

export const CustList = ({ sectionId }) => {
  const { showNotifications } = useNotifications();
  // data state
  const [custData, setCustData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  // conditional context
  const [isDataShown, setIsDataShown] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
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
      <TableHeadValue value="Nama Pengguna" />
      <TableHeadValue value="Alamat" />
      <TableHeadValue value="Email" />
      <TableHeadValue value="Telepon" />
      <TableHeadValue value="Tanggal Bergabung" position="end" />
    </TableRow>
  );

  useEffect(() => {
    const fetchData = async (page, limit) => {
      try {
        setIsLoading(true);
        const offset = (page - 1) * limit;
        const data = await fetchDataList(offset, limit, "viewcustomer");

        if (data && data.data && data.data.length > 0) {
          setCustData(data.data);
          setFilteredData(data.data);
          setTotalPages(data.TTLPage);
          setIsDataShown(true);
        } else {
          setCustData([]);
          setFilteredData([]);
          setTotalPages(0);
          setIsDataShown(false);
        }
      } catch (error) {
        console.error("Error fetching customer data:", error);
        showNotifications(
          "danger",
          "Gagal menampilkan data Customer. Mohon periksa koneksi internet anda dan muat ulang halaman."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData(currentPage, limit);
  }, [currentPage, limit]);

  useEffect(() => {
    setIsDataShown(filteredData.length > 0);
  }, [filteredData]);

  return (
    <section id={sectionId} className={styles.tabelSection}>
      <b className={styles.tabelSectionTitle}>Customer</b>
      <div className={styles.tabelSectionNav}>
        <InputWrapper>
          <SearchInput
            id={`search-data-${sectionId}`}
            placeholder="Cari data ..."
            property="username"
            userData={custData}
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
      <TableData
        headerData={tableHeadData}
        dataShown={isDataShown}
        loading={isLoading}
      >
        {filteredData.map((cust, index) => (
          <TableRow key={index} isEven={index % 2 === 0}>
            <TableBodyValue
              type="num"
              value={(currentPage - 1) * limit + index + 1}
            />
            <TableBodyValue value={cust.username} />
            <TableBodyValue value={cust.address} />
            <TableBodyValue value={cust.useremail} />
            <TableBodyValue value={cust.userphone} />
            <TableBodyValue
              value={formatDate(cust.usercreate, "en-gb")}
              position="end"
            />
          </TableRow>
        ))}
      </TableData>
      {isDataShown && (
        <PaginationV2
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </section>
  );
};
