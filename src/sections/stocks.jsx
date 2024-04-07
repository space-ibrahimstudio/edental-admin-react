import React, { useState, useEffect } from "react";
import { Button } from "@ibrahimstudio/button";
import { Input } from "@ibrahimstudio/input";
import { useNavigate } from "react-router-dom";
import { fetchDataList, fetchAllDataList } from "../components/tools/data";
import { handleCUDStock } from "../components/tools/handler";
import { useNotifications } from "../components/feedback/context/notifications-context";
import {
  TableData,
  TableRow,
  TableHeadValue,
  TableBodyValue,
} from "../components/layout/tables";
import { SubmitForm } from "../components/user-input/forms";
import { InputWrapper } from "../components/user-input/inputs";
import { PlusIcon } from "../components/layout/icons";
import { SearchInput } from "../components/user-input/inputs";
import { PaginationV2 } from "../components/navigator/paginationv2";
import styles from "./styles/tabel-section.module.css";

export const Stocks = ({ sectionId }) => {
  const navigate = useNavigate();
  const { showNotifications } = useNotifications();
  // data state
  const [stockData, setStockData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [catData, setCatData] = useState([]);
  const [subCatData, setSubCatData] = useState([]);
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
  const [inputData, setInputData] = useState({
    cat: "",
    subCat: "",
    item: "",
    satuan: "",
    jumlah: "",
    nilai: "",
  });
  const [errors, setErrors] = useState({
    cat: "",
    subCat: "",
    item: "",
    satuan: "",
    jumlah: "",
    nilai: "",
  });
  const itemUnits = [
    { value: "PCS", label: "pcs" },
    { value: "PACK", label: "pack" },
    { value: "BOTTLE", label: "bottle" },
    { value: "TUBE", label: "tube" },
    { value: "BOX", label: "box" },
    { value: "SET", label: "set" },
  ];
  const cleanInput = () => {
    setInputData({
      cat: "",
      subCat: "",
      item: "",
      satuan: "",
      jumlah: "",
      nilai: "",
    });
    setErrors({
      cat: "",
      subCat: "",
      item: "",
      satuan: "",
      jumlah: "",
      nilai: "",
    });
  };
  // start data paging
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
  const navigateStockHistory = (stockName) => {
    navigate(`/dashboard/warehouse/stock/${stockName.toLowerCase()}`);
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
    setInputData((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    setErrors({
      ...errors,
      [name]: "",
    });
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
        await handleCUDStock(inputData);
        showNotifications(
          "success",
          "Selamat! Data Stok baru berhasil ditambahkan."
        );

        const offset = (currentPage - 1) * limit;
        const data = await fetchDataList(offset, limit, "viewstock");

        if (data && data.data && data.data.length > 0) {
          setStockData(data.data);
          setFilteredData(data.data);
          setTotalPages(data.TTLPage);
          setIsDataShown(true);
        } else {
          setStockData([]);
          setFilteredData([]);
          setTotalPages(0);
          setIsDataShown(false);
        }
        closeForm();
      } catch (error) {
        console.error("Error occurred during submit stock:", error);
        showNotifications(
          "danger",
          "Gagal menambahkan data. Mohon periksa koneksi internet anda dan muat ulang halaman."
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
      <TableHeadValue value="Kategori" />
      <TableHeadValue value="Sub Kategori" />
      <TableHeadValue value="SKU" />
      <TableHeadValue value="Nama Item" />
      <TableHeadValue value="Unit" />
      <TableHeadValue value="Stok Akhir" />
      <TableHeadValue value="Harga" />
      <TableHeadValue value="Total Harga" />
      <TableHeadValue value="Cabang" position="end" />
    </TableRow>
  );

  useEffect(() => {
    const fetchData = async (page, limit) => {
      try {
        setIsFetching(true);
        const offset = (page - 1) * limit;
        const data = await fetchDataList(offset, limit, "viewstock");

        if (data && data.data && data.data.length > 0) {
          setStockData(data.data);
          setFilteredData(data.data);
          setTotalPages(data.TTLPage);
          setIsDataShown(true);
        } else {
          setStockData([]);
          setFilteredData([]);
          setTotalPages(0);
          setIsDataShown(false);
        }
      } catch (error) {
        console.error("Error fetching stock data:", error);
        showNotifications(
          "danger",
          "Gagal menampilkan data Stok. Mohon periksa koneksi internet anda dan muat ulang halaman."
        );
      } finally {
        setIsFetching(false);
      }
    };

    fetchData(currentPage, limit);
  }, [currentPage, limit]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchAllDataList("searchcategorystock");
        setCatData(data);
      } catch (error) {
        console.error("Error fetching all category stock data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    setIsDataShown(filteredData.length > 0);
  }, [filteredData]);

  return (
    <section id={sectionId} className={styles.tabelSection}>
      <b className={styles.tabelSectionTitle}>Stock</b>
      <div className={styles.tabelSectionNav}>
        <InputWrapper>
          <SearchInput
            id={`search-data-${sectionId}`}
            placeholder="Cari data ..."
            property="itemname"
            userData={stockData}
            setUserData={setFilteredData}
          />
        </InputWrapper>
        <InputWrapper>
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
        </InputWrapper>
      </div>
      <TableData
        headerData={tableHeadData}
        dataShown={isDataShown}
        loading={isFetching}
      >
        {filteredData.map((stock, index) => (
          <TableRow
            key={index}
            isEven={index % 2 === 0}
            isClickable={true}
            onClick={() => navigateStockHistory(stock.itemname)}
          >
            <TableBodyValue
              type="num"
              value={(currentPage - 1) * limit + index + 1}
            />
            <TableBodyValue value={stock.categorystock} />
            <TableBodyValue value={stock.subcategorystock} />
            <TableBodyValue value={stock.sku} />
            <TableBodyValue value={stock.itemname} />
            <TableBodyValue value={stock.unit} />
            <TableBodyValue value={stock.lastqty} />
            <TableBodyValue value={stock.value} />
            <TableBodyValue value={stock.totalvalue} />
            <TableBodyValue value={stock.outletname} position="end" />
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
          formTitle="Tambah Data Stock"
          onClose={closeForm}
          onSubmit={handleSubmit}
          saveText="Simpan"
          cancelText="Batal"
          loading={isLoading}
        >
          <InputWrapper>
            {Array.isArray(catData) && (
              <Input
                id="stock-category"
                variant="select"
                labelText="Kategori"
                name="cat"
                placeholder="Pilih kategori"
                options={catData.map((cat) => ({
                  value: cat["category_stok"].categorystockname,
                  label: cat["category_stok"].categorystockname,
                }))}
                value={inputData.cat}
                onSelect={(selectedValue) =>
                  handleInputChange({
                    target: { name: "cat", value: selectedValue },
                  })
                }
                errorContent={errors.cat}
                isRequired
                isSearchable
              />
            )}
            {Array.isArray(catData) && (
              <Input
                id="stock-subcategory"
                variant="select"
                labelText="Sub Kategori"
                name="subCat"
                placeholder={
                  inputData.cat
                    ? "Pilih sub kategori"
                    : "Mohon pilih kategori dahulu"
                }
                options={
                  inputData.cat &&
                  catData
                    .find(
                      (cat) =>
                        cat["category_stok"].categorystockname === inputData.cat
                    )
                    ?.["subcategory_stok"].map((subCat) => ({
                      value: subCat.subcategorystock,
                      label: subCat.subcategorystock,
                    }))
                }
                value={inputData.subCat}
                onSelect={(selectedValue) =>
                  handleInputChange({
                    target: { name: "subCat", value: selectedValue },
                  })
                }
                errorContent={errors.subCat}
                isRequired
                isSearchable
                isDisabled={inputData.cat ? false : true}
              />
            )}
            <Input
              id="stock-item-name"
              labelText="Nama Item"
              placeholder="STERILISATOR"
              type="text"
              name="item"
              value={inputData.item}
              onChange={handleInputChange}
              errorContent={errors.item}
              isRequired
            />
          </InputWrapper>
          <InputWrapper>
            <Input
              id="stock-item-unit"
              variant="select"
              labelText="Unit/satuan"
              placeholder="Pilih satuan/unit"
              name="satuan"
              value={inputData.satuan}
              options={itemUnits}
              onSelect={(selectedValue) =>
                handleInputChange({
                  target: { name: "satuan", value: selectedValue },
                })
              }
              errorContent={errors.satuan}
              isRequired
            />
            <Input
              id="stock-item-qty"
              labelText="Jumlah"
              placeholder="40"
              type="number"
              name="jumlah"
              value={inputData.jumlah}
              onChange={handleInputChange}
              errorContent={errors.jumlah}
              isRequired
            />
            <Input
              id="stock-item-price"
              labelText="Harga Item Satuan"
              placeholder="100000"
              type="number"
              name="nilai"
              value={inputData.nilai}
              onChange={handleInputChange}
              errorContent={errors.nilai}
              isRequired
            />
          </InputWrapper>
        </SubmitForm>
      )}
    </section>
  );
};
