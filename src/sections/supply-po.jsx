import React, { useState } from "react";
import { TableData } from "../components/layout/tables";
import { PlusIcon } from "../components/layout/icons";
import { InputWrapper, UserInput } from "../components/user-input/inputs";
import { PrimButton } from "../components/user-input/buttons";
import { SearchInput } from "../components/user-input/inputs";
import { Pagination } from "../components/navigator/pagination";
import "./styles/user-list.css";
import "../pages/styles/new.css";

export const SupplyPO = ({ sectionId }) => {
  const [isDataShown, setIsDataShown] = useState(false);
  const [limit, setLimit] = useState(5);

  const handleLimitChange = (event) => {
    setLimit(parseInt(event.target.value, 10));
  };

  return (
    <section id={sectionId} className="tabel-section">
      <b className="tabel-section-title">PO Supply</b>
      <div className="tabel-section-nav">
        <InputWrapper maxWidth="1000px">
          <SearchInput
            id="search-reservation"
            placeholder="Search by products ..."
            property="username"
          />
        </InputWrapper>
        <div className="tabel-section-option">
          <InputWrapper>
            <UserInput
              variant="select"
              subVariant="nolabel"
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
          <PrimButton buttonText="Tambah Baru" iconPosition="start">
            <PlusIcon width="17px" height="100%" />
          </PrimButton>
        </div>
      </div>
      <TableData dataShown={isDataShown}></TableData>
      {isDataShown ? <Pagination /> : null}
    </section>
  );
};
