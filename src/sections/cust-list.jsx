import React, { useState, useEffect } from "react";
import { fetchDataList } from "../components/tools/data";
import { useNotifications } from "../components/feedback/context/notifications-context";
import {
  TableData,
  TableRow,
  TableHeadValue,
  TableBodyValue,
} from "../components/layout/tables";
import { ChevronDown, PlusIcon } from "../components/layout/icons";
import {
  InputWrapper,
  UserInput,
  SearchInput,
} from "../components/user-input/inputs";
import { PrimButton } from "../components/user-input/buttons";
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
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  // start data paging
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  const handleLimitChange = (event) => {
    setLimit(parseInt(event.target.value));
    setCurrentPage(1);
  };
  // end data paging
  const tableHeadData = (
    <TableRow type="heading">
      <TableHeadValue type="num" value="NO" />
      <TableHeadValue hasIcon="yes" value="Nama Pengguna">
        <ChevronDown width="10px" height="100%" />
      </TableHeadValue>
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

        setCustData(data.data);
        setFilteredData(data.data);
        setTotalPages(data.TTLPage);
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
      <b className={styles.tabelSectionTitle}>Data Customer</b>
      <div className={styles.tabelSectionNav}>
        <InputWrapper>
          <SearchInput
            id="search-datacustomer"
            placeholder="Search data ..."
            property="username"
            userData={custData}
            setUserData={setFilteredData}
          />
        </InputWrapper>
        <div className={styles.tabelSectionOption}>
          <InputWrapper>
            <UserInput
              variant="select"
              id="total-datacustomer"
              value={limit}
              onChange={handleLimitChange}
            >
              <option value={5}>Baris per Halaman: 5</option>
              <option value={10}>Baris per Halaman: 10</option>
              <option value={20}>Baris per Halaman: 20</option>
              <option value={50}>Baris per Halaman: 50</option>
            </UserInput>
          </InputWrapper>
          {/* <PrimButton buttonText="Tambah Baru" iconPosition="start">
            <PlusIcon width="17px" height="100%" />
          </PrimButton> */}
        </div>
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
            <TableBodyValue value={cust.usercreate} position="end" />
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
