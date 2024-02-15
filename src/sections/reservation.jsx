import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchUserBooking } from "../components/tools/data";
import { useNotifications } from "../components/feedback/context/notifications-context";
import { useLoading } from "../components/feedback/context/loading-context";
import {
  TableData,
  TableRow,
  TableHeadValue,
  TableBodyValue,
} from "../components/layout/tables";
import { ChevronDown, PlusIcon } from "../components/layout/icons";
import { OptionButton } from "../components/user-input/buttons";
import { SearchInput } from "../components/user-input/inputs";
import { Pagination } from "../components/navigator/pagination";

export const Reservation = () => {
  const [userData, setUserData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isDataShown, setIsDataShown] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const rowsPerPage = 5;
  const totalRows = 18;

  const { showNotifications } = useNotifications();
  const { setLoading } = useLoading();
  const navigate = useNavigate();

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const tableHeadData = (
    <TableRow type="heading">
      <TableHeadValue type="num" value="NO" />
      <TableHeadValue hasIcon="yes" value="Nama Pengguna">
        <ChevronDown width="10px" height="100%" />
      </TableHeadValue>
      <TableHeadValue value="Email" />
      <TableHeadValue value="Telepon" />
      <TableHeadValue value="Layanan" />
      <TableHeadValue value="Tipe Layanan" />
      <TableHeadValue hasIcon="yes" value="Tanggal Reservasi">
        <ChevronDown width="10px" height="100%" />
      </TableHeadValue>
      <TableHeadValue hasIcon="yes" value="Jam Reservasi">
        <ChevronDown width="10px" height="100%" />
      </TableHeadValue>
      <TableHeadValue value="Cabang" position="end" />
    </TableRow>
  );

  const indexOfLastItem = currentPage * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const addNewClick = () => {
    navigate("/submit-reservation");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const limit = rowsPerPage;
        const hal = Math.ceil(totalRows / rowsPerPage);
        const data = await fetchUserBooking(limit, hal);

        setUserData(data);
        setFilteredData(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
        showNotifications("danger", "Error fetching user data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    setIsDataShown(filteredData.length > 0);
  }, [filteredData]);

  return (
    <section id="order-reservation" className="tabel-section">
      <b className="tabel-section-title">Data Reservasi</b>
      <div className="tabel-section-nav">
        <SearchInput
          id="search-keyword"
          placeholder="Search by name ..."
          property="name"
          userData={userData}
          setUserData={setFilteredData}
        />
        <div className="tabel-section-option">
          <OptionButton />
          <button className="user-list-add" onClick={addNewClick}>
            <b className="user-list-add-text">Tambah Baru</b>
            <PlusIcon width="17px" height="100%" color="var(--color-white)" />
          </button>
        </div>
      </div>
      <TableData headerData={tableHeadData}>
        {isDataShown ? (
          currentItems.map((user, index) => (
            <TableRow key={user.idreservation}>
              <TableBodyValue type="num" value={indexOfFirstItem + index + 1} />
              <TableBodyValue value={user.name} />
              <TableBodyValue value={user.email} />
              <TableBodyValue value={user.phone} />
              <TableBodyValue value={user.service} />
              <TableBodyValue value={user.typeservice} />
              <TableBodyValue value={user.reservationdate} />
              <TableBodyValue value={user.reservationtime} />
              <TableBodyValue value={user.idbranch} position="end" />
            </TableRow>
          ))
        ) : (
          <p>No data available</p>
        )}
      </TableData>
      <Pagination
        rowsPerPage={rowsPerPage}
        totalRows={totalRows}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
    </section>
  );
};
