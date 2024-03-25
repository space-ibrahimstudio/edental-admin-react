import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  const [totalPages, setTotalPages] = useState(1);
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

        const offset = (currentPage - 1) * limit;
        const data = await fetchStockList(offset, limit);
        setStockData(data.data);
        setFilteredData(data.data);
        setTotalPages(data.TTLPage);

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

  const navigateStockHistory = (stockName) => {
    navigate(`/dashboard/warehouse/stock/${stockName.toLowerCase()}`);
  };

  useEffect(() => {
    const fetchData = async (page, limit) => {
      try {
        setIsLoading(true);
        const offset = (page - 1) * limit;
        const data = await fetchStockList(offset, limit);

        setStockData(data.data);
        setFilteredData(data.data);
        setTotalPages(data.TTLPage);
      } catch (error) {
        console.error("Error fetching stock data:", error);
        showNotifications("danger", "Error fetching stock data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData(currentPage, limit);
  }, [currentPage, limit]);

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
        {filteredData.map((stock, index) => (
          <TableRow
            key={index}
            isEven={index % 2 === 0}
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
