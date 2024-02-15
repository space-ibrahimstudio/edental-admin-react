import React, { useState, useEffect } from "react";
import { fetchCustData } from "../components/tools/data";
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
import "./styles/user-list.css";

export const UserList = () => {
  const [userData, setUserData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const rowsPerPage = 5;
  const totalRows = 18;

  const { showNotifications } = useNotifications();
  const { setLoading } = useLoading();

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const tableHeadData = (
    <TableRow type="heading">
      <TableHeadValue type="num" value="NO" />
      <TableHeadValue hasIcon="yes" value="Nama Pengguna">
        <ChevronDown width="10px" height="100%" />
      </TableHeadValue>
      <TableHeadValue value="User ID" />
      <TableHeadValue value="Email" />
      <TableHeadValue value="Telepon" />
      <TableHeadValue value="Tanggal Bergabung" position="end" />
    </TableRow>
  );

  const indexOfLastItem = currentPage * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const limit = rowsPerPage;
        const hal = Math.ceil(totalRows / rowsPerPage);
        const data = await fetchCustData(limit, hal);

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

  return (
    <section id="customer-data" className="tabel-section">
      <b className="tabel-section-title">Data Customer</b>
      <div className="tabel-section-nav">
        <SearchInput
          id="search-keyword"
          placeholder="Search by name ..."
          property="username"
          userData={userData}
          setUserData={setFilteredData}
        />
        <div className="tabel-section-option">
          <OptionButton />
          <button className="user-list-add">
            <b className="user-list-add-text">Tambah Baru</b>
            <PlusIcon width="17px" height="100%" color="var(--color-white)" />
          </button>
        </div>
      </div>
      <TableData headerData={tableHeadData}>
        {currentItems.map((user, index) => (
          <TableRow key={user.idauthuser}>
            <TableBodyValue type="num" value={indexOfFirstItem + index + 1} />
            <TableBodyValue value={user.username} />
            <TableBodyValue value={user.idauthuser} />
            <TableBodyValue value={user.useremail} />
            <TableBodyValue value={user.userphone} />
            <TableBodyValue value={user.usercreate} position="end" />
          </TableRow>
        ))}
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
