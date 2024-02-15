import React, { useState, useEffect } from "react";
import { fetchOrderData } from "../components/tools/data";
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

export const Order = () => {
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
      <TableHeadValue value="Telepon" />
      <TableHeadValue value="Nomor Invoice" />
      <TableHeadValue value="Tanggal Order" hasIcon="yes">
        <ChevronDown width="10px" height="100%" />
      </TableHeadValue>
      <TableHeadValue value="Cabang" />
      <TableHeadValue value="Harga" position="end" />
    </TableRow>
  );

  const indexOfLastItem = currentPage * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const data = await fetchOrderData();

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
    <section id="order-order" className="tabel-section">
      <b className="tabel-section-title">Data Order</b>
      <div className="tabel-section-nav">
        <SearchInput
          id="search-keyword"
          placeholder="Search by name ..."
          property="ordername"
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
          <TableRow key={user.idorder}>
            <TableBodyValue type="num" value={indexOfFirstItem + index + 1} />
            <TableBodyValue value={user.ordername} />
            <TableBodyValue value={user.orderphone} />
            <TableBodyValue value={user.noinvoice} />
            <TableBodyValue value={user.ordercreate} />
            <TableBodyValue value={user.idbranch} />
            <TableBodyValue value={user.price} position="end" />
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
