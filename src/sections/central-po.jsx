import React, { useState, useEffect } from "react";
import { fetchDataList, fetchSearchData } from "../components/tools/data";
import { handleCUDCentralPO } from "../components/tools/handler";
import { useNotifications } from "../components/feedback/context/notifications-context";
import {
  TableData,
  TableRow,
  TableHeadValue,
  TableBodyValue,
} from "../components/layout/tables";
import { SubmitForm } from "../components/user-input/forms";
import {
  InputWrapper,
  UserInput,
  SearchInput,
} from "../components/user-input/inputs";
import { ChevronDown, PlusIcon } from "../components/layout/icons";
import { PrimButton } from "../components/user-input/buttons";
import { PaginationV2 } from "../components/navigator/paginationv2";
import styles from "./styles/tabel-section.module.css";

export const CentralPO = ({ sectionId }) => {
  const { showNotifications } = useNotifications();
  // data state
  const [poData, setPoData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  // conditional context
  const [isDataShown, setIsDataShown] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  // perform action state
  const [isFormOpen, setIsFormOpen] = useState(false);
  // input state
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState(null);
  const [inputData, setInputData] = useState({
    item: "",
    sku: "",
    jumlah: "",
  });
  const [errors, setErrors] = useState({
    item: "",
    sku: "",
    jumlah: "",
  });
  const cleanInput = () => {
    setInputData({
      item: "",
      sku: "",
      jumlah: "",
    });
    setErrors({
      item: "",
      sku: "",
      jumlah: "",
    });
  };
  // start data paging
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  const handleLimitChange = (event) => {
    setLimit(parseInt(event.target.value));
    setCurrentPage(1);
  };
  // end data paging
  // start add data function
  const openForm = () => setIsFormOpen(true);
  const closeForm = () => {
    cleanInput();
    setIsFormOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSuggestionClick = (selectedItem, selectedSku) => {
    setInputData((prevData) => ({
      ...prevData,
      item: selectedItem,
      sku: selectedSku,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let hasError = false;
    const newErrors = { ...errors };

    for (const key in inputData) {
      if (inputData[key].trim() === "") {
        newErrors[key] = "Data ini tidak boleh kosong";
        hasError = true;
      } else {
        newErrors[key] = "";
      }
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    const isConfirmed = window.confirm(
      "Apakah anda yakin untuk menambahkan data?"
    );

    if (isConfirmed) {
      try {
        setIsLoading(true);
        await handleCUDCentralPO(inputData);
        showNotifications(
          "success",
          "Selamat! Data PO Pusat baru berhasil ditambahkan."
        );

        const offset = (currentPage - 1) * limit;
        const data = await fetchDataList(offset, limit, "viewpostock");
        setPoData(data.data);
        setFilteredData(data.data);
        setTotalPages(data.TTLPage);

        closeForm();
      } catch (error) {
        console.error("Error occurred during submit central PO:", error);
        showNotifications(
          "danger",
          "Gagal menambahkan data PO Pusat. Mohon periksa koneksi internet anda dan muat ulang halaman."
        );
      } finally {
        setIsLoading(false);
      }
    }
  };
  // end add data function
  const tableHeadData = (
    <TableRow type="heading">
      <TableHeadValue value="NO" type="num" />
      <TableHeadValue value="Nama Item" />
      <TableHeadValue value="SKU Item" />
      <TableHeadValue value="Kode PO" />
      <TableHeadValue value="Tanggal Dibuat">
        <ChevronDown width="10px" height="100%" />
      </TableHeadValue>
      <TableHeadValue value="QTY." />
      <TableHeadValue value="Admin Cabang" />
      <TableHeadValue value="Cabang" />
      <TableHeadValue value="Status" position="end" />
    </TableRow>
  );

  useEffect(() => {
    const fetchData = async (page, limit) => {
      try {
        setIsLoading(true);
        const offset = (page - 1) * limit;
        const data = await fetchDataList(offset, limit, "viewpostock");

        setPoData(data.data);
        setFilteredData(data.data);
        setTotalPages(data.TTLPage);
      } catch (error) {
        console.error("Error fetching central PO data:", error);
        showNotifications(
          "danger",
          "Gagal menampilkan data PO Pusat. Mohon periksa koneksi internet anda dan muat ulang halaman."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData(currentPage, limit);
  }, [currentPage, limit]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchSearchData("searchstock", inputData.item);
        setSuggestions(
          data.map((item) => ({
            name: item.itemname,
            sku: item.sku,
          }))
        );
        setError(null);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setError("Error fetching suggestions");
      }
    };

    if (inputData.item.trim() !== "") {
      fetchData();
    } else {
      setSuggestions([]);
    }
  }, [inputData.item]);

  useEffect(() => {
    setIsDataShown(filteredData.length > 0);
  }, [filteredData]);

  return (
    <section id={sectionId} className={styles.tabelSection}>
      <b className={styles.tabelSectionTitle}>PO Pusat</b>
      <div className={styles.tabelSectionNav}>
        <InputWrapper>
          <SearchInput
            id="search-services"
            placeholder="Search by item name ..."
            property="itemname"
            userData={poData}
            setUserData={setFilteredData}
          />
        </InputWrapper>
        <div className={styles.tabelSectionOption}>
          <InputWrapper>
            <UserInput
              variant="select"
              id="total-centralpo"
              value={limit}
              onChange={handleLimitChange}
            >
              <option value={5}>Baris per Halaman: 5</option>
              <option value={10}>Baris per Halaman: 10</option>
              <option value={20}>Baris per Halaman: 20</option>
              <option value={50}>Baris per Halaman: 50</option>
            </UserInput>
          </InputWrapper>
          <PrimButton
            buttonText="Tambah Baru"
            onClick={openForm}
            iconPosition="start"
          >
            <PlusIcon width="17px" height="100%" />
          </PrimButton>
        </div>
      </div>
      <TableData
        headerData={tableHeadData}
        dataShown={isDataShown}
        loading={isLoading}
      >
        {filteredData.map((po, index) => (
          <TableRow key={index} isEven={index % 2 === 0}>
            <TableBodyValue
              type="num"
              value={(currentPage - 1) * limit + index + 1}
            />
            <TableBodyValue value={po.itemname} />
            <TableBodyValue value={po.sku} />
            <TableBodyValue value={po.postockcode} />
            <TableBodyValue value={po.postockcreate} />
            <TableBodyValue value={po.qty} />
            <TableBodyValue value={po.username} />
            <TableBodyValue value={po.outletname} />
            <TableBodyValue value={po.status} position="end" />
          </TableRow>
        ))}
      </TableData>
      {isDataShown && (
        <PaginationV2
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
      {isFormOpen && (
        <SubmitForm
          formTitle="Form Permintaan PO Pusat"
          onClose={closeForm}
          onSubmit={handleSubmit}
          saveText="Simpan"
          cancelText="Batal"
          loading={isLoading}
        >
          <InputWrapper>
            <UserInput
              id="item-name"
              subVariant="label"
              labelText="Nama Item"
              placeholder="Masukkan nama item"
              type="text"
              name="item"
              value={inputData.item}
              onChange={handleInputChange}
              error={errors.item}
            />
          </InputWrapper>
          <InputWrapper>
            {suggestions.map((item, index) => (
              <li
                key={index}
                onClick={() => handleSuggestionClick(item.name, item.sku)}
              >
                {item.name} - {item.sku}
              </li>
            ))}
          </InputWrapper>
          <InputWrapper>
            <UserInput
              id="item-sku"
              subVariant="label"
              labelText="SKU Item"
              placeholder="Masukkan SKU item"
              type="text"
              name="sku"
              value={inputData.sku}
              onChange={handleInputChange}
              error={errors.sku}
            />
            <UserInput
              id="item-qty"
              subVariant="label"
              labelText="Jumlah Item"
              placeholder="Masukkan jumlah item"
              type="text"
              name="jumlah"
              value={inputData.jumlah}
              onChange={handleInputChange}
              error={errors.jumlah}
            />
          </InputWrapper>
        </SubmitForm>
      )}
    </section>
  );
};
