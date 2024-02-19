import React, { useState } from "react";
import { TableData } from "../components/layout/tables";
import { PlusIcon } from "../components/layout/icons";
import { OptionButton } from "../components/user-input/buttons";
import { SearchInput } from "../components/user-input/inputs";
import { Pagination } from "../components/navigator/pagination";
import "./styles/user-list.css";
import "../pages/styles/new.css";

export const ServiceTypes = ({ sectionId }) => {
  const [isDataShown, setIsDataShown] = useState(false);
  const [limit, setLimit] = useState(5);

  const handleLimitChange = (event) => {
    setLimit(parseInt(event.target.value, 10));
  };

  return (
    <section id={sectionId} className="tabel-section">
      <b className="tabel-section-title">Jenis Layanan</b>
      <div className="tabel-section-nav">
        <SearchInput
          id="search-datacustomer"
          placeholder="Search by name ..."
          property="username"
        />
        <div className="tabel-section-option">
          <OptionButton
            id="total-datacustomer"
            value={limit}
            onChange={handleLimitChange}
          >
            <option value={5}>Baris: 5</option>
            <option value={10}>Baris: 10</option>
            <option value={20}>Baris: 20</option>
            <option value={50}>Baris: 50</option>
          </OptionButton>
          <button className="user-list-add">
            <b className="user-list-add-text">Tambah Baru</b>
            <PlusIcon width="17px" height="100%" color="var(--color-white)" />
          </button>
        </div>
      </div>
      <TableData dataShown={isDataShown}></TableData>
      {isDataShown ? <Pagination /> : null}
    </section>
  );
};
