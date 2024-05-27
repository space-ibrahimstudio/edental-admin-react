import React, { useState, useEffect, Fragment } from "react";
import { Input } from "@ibrahimstudio/input";
import { formatDate } from "@ibrahimstudio/function";
import { fetchStockPO } from "../libs/sources/data";
import { useNotifications } from "../components/feedbacks/context/notifications-context";
import { TableData, TableRow, TableHeadValue, TableBodyValue } from "../components/layouts/tables";
import { InputWrap, SearchInput } from "../components/input-controls/inputs";
import Pagination from "../components/navigations/pagination";
import styles from "./styles/tabel-section.module.css";

export const InPO = ({ sectionId }) => {
  const { showNotifications } = useNotifications();
  // data state
  const [poData, setPoData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  // conditional context
  const [isDataShown, setIsDataShown] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalPages, setTotalPages] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  // input state
  const [status, setStatus] = useState("");
  // start data paging
  const statusList = [
    { value: "open", label: "Open" },
    { value: "pending", label: "Tertunda" },
    { value: "sending", label: "Terkirim" },
    { value: "complete", label: "Selesai" },
    { value: "rejected", label: "Ditolak" },
  ];
  const options = [
    { value: 5, label: "Baris per Halaman: 5" },
    { value: 10, label: "Baris per Halaman: 10" },
    { value: 20, label: "Baris per Halaman: 20" },
    { value: 50, label: "Baris per Halaman: 50" },
  ];
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  const handleLimitChange = (value) => {
    setLimit(value);
    setCurrentPage(1);
  };
  const handleStatusChange = (value) => {
    setStatus(value);
    setCurrentPage(1);
  };
  // end data paging
  const tableHeadData = (
    <TableRow type="heading">
      <TableHeadValue value="NO" type="num" />
      <TableHeadValue value="Tanggal Dibuat" />
      <TableHeadValue value="Nomor PO" />
      <TableHeadValue value="Nama Admin" />
      <TableHeadValue value="Nama Outlet" position="end" />
    </TableRow>
  );

  useEffect(() => {
    const fetchData = async (page, limit, status) => {
      try {
        setIsFetching(true);
        const offset = (page - 1) * limit;
        const data = await fetchStockPO(offset, limit, status, "viewpostock");

        if (data && data.data && data.data.length > 0) {
          setPoData(data.data);
          setFilteredData(data.data);
          setTotalPages(data.TTLPage);
          setIsDataShown(true);
        } else {
          setPoData([]);
          setFilteredData([]);
          setTotalPages(0);
          setIsDataShown(false);
        }
      } catch (error) {
        console.error("Error fetching central PO data:", error);
        showNotifications("danger", "Gagal menampilkan data PO Pusat. Mohon periksa koneksi internet anda dan muat ulang halaman.");
      } finally {
        setIsFetching(false);
      }
    };

    fetchData(currentPage, limit, status);
  }, [currentPage, limit, status]);

  useEffect(() => {
    setIsDataShown(filteredData.length > 0);
  }, [filteredData]);

  return (
    <section id={sectionId} className={styles.tabelSection}>
      <b className={styles.tabelSectionTitle}>Data PO Masuk</b>
      <div className={styles.tabelSectionNav}>
        <InputWrap>
          <SearchInput
            id={`search-data-${sectionId}`}
            placeholder="Cari data ..."
            property="postockcode"
            userData={poData}
            setUserData={setFilteredData}
          />
          <Input
            id={`filter-data-${sectionId}`}
            variant="select"
            radius="full"
            isLabeled={false}
            placeholder="Filter Status"
            value={status}
            options={statusList}
            onSelect={handleStatusChange}
          />
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
            isReadonly={isDataShown ? false : true}
          />
        </InputWrap>
      </div>
      <TableData headerData={tableHeadData} dataShown={isDataShown} loading={isFetching}>
        {filteredData.map((po, index) => (
          <TableRow
            type="expand"
            key={index}
            isEven={index % 2 === 0}
            isClickable={true}
            expanded={
              <Fragment>
                {po["Detail PO"].map((detailPO, index) => (
                  <Fragment key={index}>
                    <InputWrap width="100%">
                      <Input id={`item-name-${index}`} labelText="Nama Item" value={detailPO.itemname} isReadonly />
                      <Input id={`item-sku-${index}`} labelText="SKU Item" value={detailPO.sku} isReadonly />
                      <Input id={`item-qty-${index}`} labelText="Jumlah Item" value={detailPO.qty} isReadonly />
                    </InputWrap>
                    <InputWrap width="100%">
                      <Input
                        id={`item-note-${index}`}
                        variant="textarea"
                        labelText="Keterangan"
                        fallbackValue="Tidak ada keterangan."
                        value={detailPO.note}
                        isReadonly
                      />
                    </InputWrap>
                  </Fragment>
                ))}
              </Fragment>
            }
          >
            <TableBodyValue type="num" value={(currentPage - 1) * limit + index + 1} />
            <TableBodyValue value={formatDate(po["PO Stock"].postockcreate, "en-gb")} />
            <TableBodyValue value={po["PO Stock"].postockcode} />
            <TableBodyValue value={po["PO Stock"].username} />
            <TableBodyValue value={po["PO Stock"].outletname} position="end" />
          </TableRow>
        ))}
      </TableData>
      {isDataShown && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />}
    </section>
  );
};
