import React, { useState } from "react";
import { Button } from "@ibrahimstudio/button";
import { Input } from "@ibrahimstudio/input";
import { TableData } from "../components/layouts/tables";
import { PlusIcon } from "../components/layouts/icons";
import { InputWrap } from "../components/input-controls/inputs";
import { SearchInput } from "../components/input-controls/inputs";
import styles from "./styles/tabel-section.module.css";

export const UserList = ({ sectionId }) => {
  const [limit, setLimit] = useState(5);

  const options = [
    { value: 5, label: "Baris per Halaman: 5" },
    { value: 10, label: "Baris per Halaman: 10" },
    { value: 20, label: "Baris per Halaman: 20" },
    { value: 50, label: "Baris per Halaman: 50" },
  ];
  const handleLimitChange = (value) => {
    setLimit(value);
  };

  return (
    <section id={sectionId} className={styles.tabelSection}>
      <b className={styles.tabelSectionTitle}>Manajemen User</b>
      <div className={styles.tabelSectionNav}>
        <InputWrap>
          <SearchInput id={`search-data-${sectionId}`} placeholder="Cari data ..." property="username" isReadonly={true} />
        </InputWrap>
        <InputWrap>
          <Input
            id={`limit-data-${sectionId}`}
            variant="select"
            radius="full"
            isLabeled={false}
            placeholder="Baris per Halaman"
            value={limit}
            options={options}
            onSelect={handleLimitChange}
            isReadonly={true}
          />
          <Button
            id={`add-new-data-${sectionId}`}
            radius="full"
            buttonText="Tambah Baru"
            startContent={<PlusIcon width="17px" height="100%" />}
            isDisabled
          />
        </InputWrap>
      </div>
      <TableData dataShown={false}></TableData>
    </section>
  );
};
