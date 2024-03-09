import React, { useState, useEffect } from "react";
import { Fragment } from "../components/tools/controller";
import { fetchOrderList } from "../components/tools/data";
import { handleCUDReserve } from "../components/tools/handler";
import { useNotifications } from "../components/feedback/context/notifications-context";
import {
  TableData,
  TableRow,
  TableHeadValue,
  TableBodyValue,
} from "../components/layout/tables";
import { ChevronDown, PlusIcon } from "../components/layout/icons";
import { InputWrapper, UserInput } from "../components/user-input/inputs";
import { SearchInput } from "../components/user-input/inputs";
import { PrimButton, SecondaryButton } from "../components/user-input/buttons";
import { Pagination } from "../components/navigator/pagination";
import styles from "./styles/tabel-section.module.css";

export const Order = ({ sectionId }) => {
  const [orderData, setOrderData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isDataShown, setIsDataShown] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [loadData, setLoadData] = useState(false);
  const [limit, setLimit] = useState(5);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    service: "",
    typeservice: "",
    reservationdate: "",
    reservationtime: "",
  });

  const rowsPerPage = limit;
  const startIndex = (currentPage - 1) * rowsPerPage + 1;
  const { showNotifications } = useNotifications();

  const openForm = () => setIsFormOpen(true);
  const closeForm = () => setIsFormOpen(false);

  const openDetail = () => setDetailOpen(true);
  const closeDetail = () => setDetailOpen(false);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleLimitChange = (event) => {
    setLimit(parseInt(event.target.value, 10));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await handleCUDReserve(
        formData.name,
        formData.phone,
        formData.email,
        formData.service,
        formData.typeservice,
        formData.reservationdate,
        formData.reservationtime
      );
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error occurred during submit reservation:", error);
    } finally {
      window.location.reload();
    }
  };

  const tableHeadData = (
    <TableRow type="heading">
      <TableHeadValue type="num" value="NO" />
      <TableHeadValue hasIcon="yes" value="Nama Pengguna">
        <ChevronDown width="10px" height="100%" />
      </TableHeadValue>
      <TableHeadValue value="Kode" />
      <TableHeadValue value="Telepon" />
      <TableHeadValue value="Nomor Invoice" />
      <TableHeadValue value="Tanggal Order" hasIcon="yes">
        <ChevronDown width="10px" height="100%" />
      </TableHeadValue>
      <TableHeadValue value="Cabang" position="end" />
    </TableRow>
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadData(true);
        const data = await fetchOrderList(currentPage, limit, setTotalPages);

        setOrderData(data);
        setFilteredData(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
        showNotifications("danger", "Error fetching user data.");
      } finally {
        setLoadData(false);
      }
    };

    fetchData();
  }, [currentPage, limit]);

  useEffect(() => {
    setIsDataShown(filteredData.length > 0);
  }, [filteredData]);

  return (
    <section id={sectionId} className={styles.tabelSection}>
      <b className={styles.tabelSectionTitle}>Data Order</b>
      <div className={styles.tabelSectionNav}>
        <InputWrapper>
          <SearchInput
            id="search-order"
            placeholder="Search by name ..."
            property="transactionname"
            userData={orderData}
            setUserData={setFilteredData}
          />
        </InputWrapper>
        <div className={styles.tabelSectionOption}>
          <InputWrapper>
            <UserInput
              variant="select"
              id="total-order"
              value={limit}
              onChange={handleLimitChange}
            >
              <option value={5}>Baris per Halaman: 5</option>
              <option value={10}>Baris per Halaman: 10</option>
              <option value={20}>Baris per Halaman: 20</option>
              <option value={50}>Baris per Halaman: 50</option>
            </UserInput>
          </InputWrapper>
          <PrimButton buttonText="Tambah Baru" iconPosition="start">
            <PlusIcon width="17px" height="100%" />
          </PrimButton>
        </div>
      </div>
      <TableData
        headerData={tableHeadData}
        dataShown={isDataShown}
        loading={loadData}
      >
        {filteredData.map((user, index) => (
          <TableRow
            type="expand"
            key={user["Transaction"].idtransaction}
            isEven={index % 2 === 0}
            expanded={
              <Fragment>
                {user["Detail Transaction"].map((transaction, index) => (
                  <InputWrapper width="100%" key={index}>
                    <UserInput
                      subVariant="readonly"
                      labelText="Nama Layanan"
                      value={transaction.service}
                    />
                    <UserInput
                      subVariant="readonly"
                      labelText="Jenis Layanan"
                      value={transaction.servicetype}
                    />
                    <UserInput
                      subVariant="readonly"
                      labelText="Harga"
                      value={transaction.price}
                    />
                  </InputWrapper>
                ))}
              </Fragment>
            }
          >
            <TableBodyValue type="num" value={startIndex + index} />
            <TableBodyValue value={user["Transaction"].transactionname} />
            <TableBodyValue value={user["Transaction"].rscode} />
            <TableBodyValue value={user["Transaction"].transactionphone} />
            <TableBodyValue value={user["Transaction"].noinvoice} />
            <TableBodyValue value={user["Transaction"].transactioncreate} />
            <TableBodyValue
              value={user["Transaction"].idbranch}
              position="end"
            />
          </TableRow>
        ))}
      </TableData>
      {isDataShown && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          handlePagination={handlePageChange}
        />
      )}
    </section>
  );
};
