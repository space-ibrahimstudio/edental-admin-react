import React, { useState, useEffect, Fragment } from "react";
import { Button } from "@ibrahimstudio/button";
import { Input } from "@ibrahimstudio/input";
import { formatDate } from "@ibrahimstudio/function";
import { fetchStockPO, fetchSearchData } from "../libs/sources/data";
import { handleCUDCentralPO } from "../libs/plugins/handler";
import { useNotifications } from "../components/feedbacks/context/notifications-context";
import { TableData, TableRow, TableHeadValue, TableBodyValue } from "../components/layouts/tables";
import { SubmitForm } from "../components/input-controls/forms";
import { InputWrap, SearchInput } from "../components/input-controls/inputs";
import { PlusIcon, TrashIcon } from "../components/layouts/icons";
import Pagination from "../components/navigations/pagination";
import styles from "./styles/tabel-section.module.css";

export const CentralPO = ({ sectionId }) => {
  const { showNotifications } = useNotifications();
  // data state
  const [poData, setPoData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [stockData, setStockData] = useState([]);
  // conditional context
  const [isDataShown, setIsDataShown] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  // perform action state
  const [isFormOpen, setIsFormOpen] = useState(false);
  // input state
  const [status, setStatus] = useState("");
  const [inputData, setInputData] = useState({
    item: [{ itemname: "", sku: "", stockin: "", note: "" }],
  });
  const [errors, setErrors] = useState({
    item: [{ itemname: "", sku: "", stockin: "", note: "" }],
  });
  const cleanInput = () => {
    setInputData({
      item: [{ itemname: "", sku: "", stockin: "", note: "" }],
    });
    setErrors({
      item: [{ itemname: "", sku: "", stockin: "", note: "" }],
    });
  };
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
  // start add data function
  const openForm = () => setIsFormOpen(true);
  const closeForm = () => {
    cleanInput();
    setIsFormOpen(false);
  };

  const handleInputChange = async (index, e) => {
    const { name, value } = e.target;
    setInputData((prevState) => ({
      ...prevState,
      item: prevState.item.map((item, idx) => (idx === index ? { ...item, [name]: value } : item)),
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      item: prevErrors.item.map((error, idx) => (idx === index ? { ...error, [name]: "" } : error)),
    }));
  };

  const handleAddRow = () => {
    setInputData((prevState) => ({
      ...prevState,
      item: [...prevState.item, { itemname: "", sku: "", stockin: "" }],
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      item: [...prevErrors.item, { itemname: "", sku: "", stockin: "" }],
    }));
  };

  const handleRemoveRow = (index) => {
    const updatedItem = [...inputData.item];
    updatedItem.splice(index, 1);

    setInputData((prevState) => ({
      ...prevState,
      item: updatedItem,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isFieldEmpty = inputData.item.some(
      (itemDetail) => itemDetail.itemname.trim() === "" || itemDetail.sku.trim() === "" || itemDetail.stockin.trim() === ""
    );

    if (isFieldEmpty) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        item: inputData.item.map((itemDetal) => ({
          itemname: itemDetal.itemname.trim() === "" ? "Nama Item tidak boleh kosong" : "",
          sku: itemDetal.sku.trim() === "" ? "SKU Item tidak boleh kosong" : "",
          stockin: itemDetal.stockin.trim() === "" ? "Jumlah item tidak boleh kosong" : "",
        })),
      }));
      return;
    }

    const isConfirmed = window.confirm("Apakah anda yakin untuk menambahkan data?");

    if (isConfirmed) {
      try {
        setIsLoading(true);
        await handleCUDCentralPO(inputData);
        showNotifications("success", "Selamat! Permintaan PO Pusat baru berhasil ditambahkan.");

        const offset = (currentPage - 1) * limit;
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
        closeForm();
      } catch (error) {
        console.error("Error occurred during submit central PO:", error);
        showNotifications("danger", "Gagal menambahkan data. Mohon periksa koneksi internet anda dan muat ulang halaman.");
      } finally {
        setIsLoading(false);
      }
    }
  };
  // end add data function
  const tableHeadData = (
    <TableRow type="heading">
      <TableHeadValue value="NO" type="num" />
      <TableHeadValue value="Tanggal Dibuat" />
      <TableHeadValue value="Nomor PO" />
      <TableHeadValue value="Nama Admin" position="end" />
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
    const fetchData = async () => {
      try {
        const data = await fetchSearchData("searchstock", "");
        setStockData(data);
      } catch (error) {
        console.error("Error fetching all customer data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    setIsDataShown(filteredData.length > 0);
  }, [filteredData]);

  return (
    <section id={sectionId} className={styles.tabelSection}>
      <b className={styles.tabelSectionTitle}>PO Pusat</b>
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
          <Button
            id={`add-new-data-${sectionId}`}
            radius="full"
            buttonText="Tambah Baru"
            onClick={openForm}
            startContent={<PlusIcon width="17px" height="100%" />}
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
            <TableBodyValue value={po["PO Stock"].username} position="end" />
          </TableRow>
        ))}
      </TableData>
      {isDataShown && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />}
      {isFormOpen && (
        <SubmitForm
          formTitle="Form Permintaan PO Pusat"
          onClose={closeForm}
          onSubmit={handleSubmit}
          saveText="Simpan"
          cancelText="Batal"
          loading={isLoading}
        >
          {inputData.item.map((item, index) => (
            <Fragment key={index}>
              <InputWrap>
                {Array.isArray(stockData) && (
                  <Input
                    id={`item-name-${index}`}
                    variant="select"
                    labelText="Nama Item"
                    name="itemname"
                    placeholder="Pilih item"
                    options={stockData.map((stock) => ({
                      value: stock.itemname,
                      label: stock.itemname,
                    }))}
                    value={item.itemname}
                    onSelect={(selectedValue) =>
                      handleInputChange(index, {
                        target: { name: "itemname", value: selectedValue },
                      })
                    }
                    errorContent={errors.item[index].itemname}
                    isRequired
                    isSearchable
                  />
                )}
                <Input
                  id={`item-sku-${index}`}
                  labelText="SKU Item"
                  placeholder="Masukkan SKU item"
                  type="text"
                  name="sku"
                  value={item.sku}
                  onChange={(e) => handleInputChange(index, e)}
                  errorContent={errors.item[index].sku}
                  isRequired
                />
                <Input
                  id={`item-qty-${index}`}
                  labelText="Jumlah Item"
                  placeholder="Masukkan jumlah item"
                  type="number"
                  name="stockin"
                  value={item.stockin}
                  onChange={(e) => handleInputChange(index, e)}
                  errorContent={errors.item[index].stockin}
                  isRequired
                />
              </InputWrap>
              <InputWrap>
                <Input
                  id={`item-note-${index}`}
                  variant="textarea"
                  rows={3}
                  labelText="Keterangan"
                  placeholder="Tambah keterangan"
                  name="note"
                  value={item.note}
                  onChange={(e) => handleInputChange(index, e)}
                />
                {index <= 0 ? (
                  <Button
                    id={`delete-row-${index}`}
                    variant="dashed"
                    subVariant="icon"
                    size="sm"
                    radius="full"
                    color="var(--color-red-30)"
                    isTooltip
                    tooltipText="Hapus"
                    iconContent={<TrashIcon width="15px" height="100%" />}
                    isDisabled
                  />
                ) : (
                  <Button
                    id={`delete-row-${index}`}
                    variant="dashed"
                    subVariant="icon"
                    size="sm"
                    radius="full"
                    color="var(--color-red)"
                    isTooltip
                    tooltipText="Hapus"
                    iconContent={<TrashIcon width="15px" height="100%" />}
                    onClick={() => handleRemoveRow(index)}
                  />
                )}
              </InputWrap>
            </Fragment>
          ))}
          <Button
            id="add-new-row"
            variant="hollow"
            size="sm"
            radius="full"
            color="var(--color-hint)"
            buttonText="Tambah Data Item"
            startContent={<PlusIcon width="15px" height="100%" />}
            onClick={handleAddRow}
          />
        </SubmitForm>
      )}
    </section>
  );
};
