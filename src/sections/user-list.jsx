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
import { ChevronIcon, ChevronDown, PlusIcon } from "../components/layout/icons";
import { OptionButton } from "../components/user-input/buttons";
import { SearchInput } from "../components/user-input/inputs";
import "./styles/user-list.css";

export const UserList = () => {
  const [userData, setUserData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  const { showNotifications } = useNotifications();
  const { setLoading } = useLoading();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const limit = 100;
        const hal = 0;
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
        {filteredData.map((user) => (
          <TableRow key={user.idauthuser}>
            <TableBodyValue type="num" value="1" />
            <TableBodyValue value={user.username} />
            <TableBodyValue value={user.idauthuser} />
            <TableBodyValue value={user.useremail} />
            <TableBodyValue value={user.userphone} />
            <TableBodyValue value={user.usercreate} position="end" />
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
