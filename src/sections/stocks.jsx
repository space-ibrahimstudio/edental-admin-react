import React, { useState, useEffect } from "react";
import { Fragment } from "../components/tools/controller";
import { fetchStockList, fetchAllCatList } from "../components/tools/data";
import { handleCUDStock } from "../components/tools/handler";
import { useNotifications } from "../components/feedback/context/notifications-context";
import {
  TableData,
  TableRow,
  TableHeadValue,
  TableBodyValue,
} from "../components/layout/tables";
import { SubmitForm } from "../components/user-input/forms";
import { InputWrapper, UserInput } from "../components/user-input/inputs";
import { PlusIcon } from "../components/layout/icons";
import { PrimButton } from "../components/user-input/buttons";
import { SearchInput } from "../components/user-input/inputs";
import { Pagination } from "../components/navigator/pagination";
import styles from "./styles/tabel-section.module.css";

export const Stocks = ({ sectionId }) => {
  const { showNotifications } = useNotifications();
  // data state
  const [stockData, setStockData] = useState([]);
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [catData, setCatData] = useState([]);
  const [subCatData, setSubCatData] = useState([]);
  // conditional context
  const [custExist, setCustExist] = useState(false);
  const [isDataShown, setIsDataShown] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
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
    setCustExist(false);
  };
  // start data paging
  const rowsPerPage = limit;
  const startIndex = (currentPage - 1) * rowsPerPage + 1;
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  const handleLimitChange = (event) => {
    setLimit(parseInt(event.target.value, 10));
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
    setErrors({
      ...errors,
      [name]: "",
    });

    setInputData((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    // if (name === "phone") {
    //   let phoneExists = false;
    //   let matchedData = null;

    //   allData.forEach((item) => {
    //     if (item.userphone === value) {
    //       phoneExists = true;
    //       matchedData = item;
    //     }
    //   });

    //   if (phoneExists) {
    //     setCustExist(true);
    //     setInputData((prevState) => ({
    //       ...prevState,
    //       name: matchedData.username,
    //       email: matchedData.useremail,
    //     }));
    //   } else {
    //     setCustExist(false);
    //   }
    // }

    const selectedCategory = catData.find(
      (service) => service["category_stok"].categorystockname === value
    );

    if (selectedCategory) {
      setSubCatData(selectedCategory["subcategory_stok"]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // let hasError = false;
    // const newErrors = { ...errors };

    // for (const key in inputData) {
    //   if (inputData[key].trim() === "") {
    //     newErrors[key] = "This field is required.";
    //     hasError = true;
    //   } else {
    //     newErrors[key] = "";
    //   }
    // }

    // if (hasError) {
    //   setErrors(newErrors);
    //   return;
    // }

    const confirmSubmit = window.confirm(
      "Are you sure you want to submit this Stock Data?"
    );

    if (confirmSubmit) {
      try {
        setIsLoading(true);
        await handleCUDStock(inputData);

        const data = await fetchStockList(currentPage, limit, setTotalPages);
        setStockData(data);
        setFilteredData(data);

        closeForm();
      } catch (error) {
        console.error("Error occurred during submit stock po:", error);
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
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchStockList(currentPage, limit, setTotalPages);

        setStockData(data);
        setFilteredData(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
        showNotifications("danger", "Error fetching user data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentPage, limit]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchAllCatList();
        setAllData(data);
      } catch (error) {
        showNotifications("danger", "Error fetching stock data.");
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    setIsDataShown(filteredData.length > 0);
  }, [filteredData]);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const data = await fetchAllCatList();
        setCatData(data);
        setSubCatData(data);
      } catch (error) {
        showNotifications("danger", "Error fetching sub service data.");
      }
    };

    fetchService();
  }, []);

  return (
    <section id={sectionId} className={styles.tabelSection}>
      <b className={styles.tabelSectionTitle}>Data Stock</b>
      <div className={styles.tabelSectionNav}>
        <InputWrapper>
          <SearchInput
            id="search-reservation"
            placeholder="Search by Item name ..."
            property="itemname"
            userData={stockData}
            setUserData={setFilteredData}
          />
        </InputWrapper>
        <div className={styles.tabelSectionOption}>
          <InputWrapper>
            <UserInput
              variant="select"
              id="total-reservation"
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
        {filteredData.map((user, index) => (
          <TableRow key={index} isEven={index % 2 === 0}>
            <TableBodyValue type="num" value={startIndex + index} />
            <TableBodyValue value={user.categorystock} />
            <TableBodyValue value={user.subcategorystock} />
            <TableBodyValue value={user.sku} />
            <TableBodyValue value={user.itemname} />
            <TableBodyValue value={user.unit} />
            <TableBodyValue value={user.lastqty} />
            <TableBodyValue value={user.value} />
            <TableBodyValue value={user.stockin} />
            <TableBodyValue value={user.idoutlet} position="end" />
          </TableRow>
        ))}
      </TableData>
      {isDataShown && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          handlePagination={handlePageChange}
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
            <UserInput
              variant="select"
              id="category"
              subVariant="label"
              labelText="Kategori"
              name="cat"
              value={inputData.cat}
              onChange={handleInputChange}
              error={errors.cat}
            >
              <option value="">Pilih kategori</option>
              {Array.isArray(catData) &&
                catData.map((service) => (
                  <option
                    key={service["category_stok"].idcategorystock}
                    value={service["category_stok"].categorystockname}
                  >
                    {service["category_stok"].categorystockname}
                  </option>
                ))}
            </UserInput>
            <UserInput
              variant="select"
              id="sub-category"
              subVariant="label"
              labelText="Sub Kategori"
              name="subCat"
              value={inputData.subCat}
              onChange={handleInputChange}
              error={errors.subCat}
            >
              {inputData.cat ? (
                <Fragment>
                  <option value="">Pilih sub kategori</option>
                  {Array.isArray(subCatData) &&
                    subCatData.map((subservice) => (
                      <option
                        key={subservice.idsubcategorystock}
                        value={subservice.subcategorystock}
                      >
                        {subservice.subcategorystock}
                      </option>
                    ))}
                </Fragment>
              ) : (
                <option value="">Mohon pilih kategori dahulu</option>
              )}
            </UserInput>
          </InputWrapper>
          <InputWrapper>
            <UserInput
              id="item-name"
              subVariant="label"
              labelText="Nama Item"
              placeholder="STERILISATOR"
              type="text"
              name="item"
              value={inputData.item}
              onChange={handleInputChange}
              error={errors.item}
            />
            <UserInput
              variant="select"
              id="item-unit"
              subVariant="label"
              labelText="Unit/satuan"
              name="satuan"
              value={inputData.satuan}
              onChange={handleInputChange}
              error={errors.satuan}
            >
              <option value="">Pilih Satuan</option>
              <option value="PCS">PCS</option>
              <option value="PACK">PACK</option>
              <option value="BOTTLE">BOTTLE</option>
              <option value="TUBE">TUBE</option>
              <option value="BOX">BOX</option>
              <option value="SET">SET</option>
            </UserInput>
          </InputWrapper>
          <InputWrapper>
            <UserInput
              id="total-item"
              subVariant="label"
              labelText="Jumlah"
              placeholder="40"
              type="text"
              name="jumlah"
              value={inputData.jumlah}
              onChange={handleInputChange}
              error={errors.jumlah}
            />
            <UserInput
              id="value-item"
              subVariant="label"
              labelText="Nilai Unit"
              placeholder="100000"
              type="text"
              name="nilai"
              value={inputData.nilai}
              onChange={handleInputChange}
              error={errors.nilai}
            />
          </InputWrapper>
        </SubmitForm>
      )}
    </section>
  );
};
