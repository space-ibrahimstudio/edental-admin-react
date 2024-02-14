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
import { ChevronIcon, ChevronDown, PlusIcon } from "../components/layout/icons";
import { OptionButton } from "../components/user-input/buttons";
import { SearchInput } from "../components/user-input/inputs";

export const Order = () => {
  const [userData, setUserData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  const { showNotifications } = useNotifications();
  const { setLoading } = useLoading();

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
        {filteredData.map((user) => (
          <TableRow key={user.idorder}>
            <TableBodyValue type="num" value="1" />
            <TableBodyValue value={user.ordername} />
            <TableBodyValue value={user.orderphone} />
            <TableBodyValue value={user.noinvoice} />
            <TableBodyValue value={user.ordercreate} />
            <TableBodyValue value={user.idbranch} />
            <TableBodyValue value={user.price} position="end" />
          </TableRow>
        ))}
      </TableData>
      <div className="pagination">
        <button className="pagination-arrow">
          <ChevronIcon width="7px" height="100%" direction="left" />
        </button>
        <button className="pagination-arrow">
          <b className="pagination-num-text">1</b>
        </button>
        <button className="pagination-arrow">
          <b className="pagination-num-text">2</b>
        </button>
        <button className="pagination-arrow">
          <b className="pagination-num-text">3</b>
        </button>
        <button className="pagination-arrow">
          <b className="pagination-num-text">4</b>
        </button>
        <button className="pagination-arrow">
          <ChevronIcon width="7px" height="100%" />
        </button>
      </div>
    </section>
  );
};
