import React, { useState, useEffect } from "react";
import { fetchStockPO, fetchSearchData } from "../components/tools/data";
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
import { ChevronDown, PlusIcon, TrashIcon } from "../components/layout/icons";
import {
  PrimButton,
  SecondaryButton,
  DropDownButton,
  ButtonGroup,
} from "../components/user-input/buttons";
import { Fragment } from "../components/tools/controller";
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
  const [status, setStatus] = useState("open");
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState(null);
  const [inputData, setInputData] = useState({
    item: [{ itemname: "", sku: "", stockin: "" }],
  });
  const cleanInput = () => {
    setInputData({
      item: [{ itemname: "", sku: "", stockin: "" }],
    });
    setSuggestions([]);
  };
  const [selectedSuggest, setSelectedSuggest] = useState(
    Array(inputData.item.length).fill(false)
  );

  const buttonList = ["open", "pending", "sending", "complete", "rejected"];
  // start data paging
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  const handleLimitChange = (event) => {
    setLimit(parseInt(event.target.value));
    setCurrentPage(1);
  };
  const handleStatusChange = (status) => {
    setStatus(status);
    setCurrentPage(1);
  };
  // end data paging
  // start add data function
  const openForm = () => setIsFormOpen(true);
  const closeForm = () => {
    cleanInput();
    setIsFormOpen(false);
  };

  const handleInputChange = (index, e) => {
    const { name, value } = e.target;
    const updatedItem = [...inputData.item];
    updatedItem[index][name] = value;

    setInputData((prevState) => ({
      ...prevState,
      item: updatedItem,
    }));

    if (name === "itemname") {
      setSelectedSuggest((prevSuggestionSelected) => {
        const updatedSuggestionSelected = [...prevSuggestionSelected];
        updatedSuggestionSelected[index] = false;
        return updatedSuggestionSelected;
      });
    }
  };

  const handleSuggestionClick = (index, selectedItem, selectedSku) => {
    const updatedItem = [...inputData.item];
    updatedItem[index] = {
      ...updatedItem[index],
      itemname: selectedItem,
      sku: selectedSku,
    };

    setInputData((prevState) => ({
      ...prevState,
      item: prevState.item.map((item, i) =>
        i === index
          ? {
              ...item,
              itemname: selectedItem,
              sku: selectedSku,
            }
          : item
      ),
    }));

    const updatedSuggestionSelected = [...selectedSuggest];
    updatedSuggestionSelected[index] = true;
    setSelectedSuggest(updatedSuggestionSelected);
  };

  const handleAddRow = () => {
    setInputData((prevState) => ({
      ...prevState,
      item: [...prevState.item, { itemname: "", sku: "", stockin: "" }],
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
        const data = await fetchStockPO(offset, limit, status, "viewpostock");
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
      <TableHeadValue value="Kode PO" />
      <TableHeadValue value="Tanggal Dibuat">
        <ChevronDown width="10px" height="100%" />
      </TableHeadValue>
      <TableHeadValue value="Admin Cabang" position="end" />
    </TableRow>
  );

  useEffect(() => {
    const fetchData = async (page, limit, status) => {
      try {
        setIsLoading(true);
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
        showNotifications(
          "danger",
          "Gagal menampilkan data PO Pusat. Mohon periksa koneksi internet anda dan muat ulang halaman."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData(currentPage, limit, status);
  }, [currentPage, limit, status]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const rowPromises = inputData.item.map(async (item) => {
          if (item.itemname.trim() !== "") {
            const data = await fetchSearchData("searchstock", [item]);
            return data.map((item) => ({
              name: item.itemname,
              sku: item.sku,
            }));
          } else {
            return [];
          }
        });

        const rowData = await Promise.all(rowPromises);
        const noItemValue = inputData.item.every(
          (item) => item.itemname.trim() === ""
        );

        if (noItemValue) {
          setSuggestions([]);
        } else {
          setSuggestions(rowData);
        }

        setError(null);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setError("Error fetching suggestions");
      }
    };

    fetchData();
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
            placeholder="Search by stock code ..."
            property="postockcode"
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
      <div className={styles.tabelSectionNav}>
        <ButtonGroup
          buttonList={buttonList}
          activeButton={status}
          onGroupChange={handleStatusChange}
        />
      </div>
      <TableData
        headerData={tableHeadData}
        dataShown={isDataShown}
        loading={isLoading}
      >
        {filteredData.map((po, index) => (
          <TableRow
            type="expand"
            key={index}
            isEven={index % 2 === 0}
            expanded={
              <Fragment>
                {po["Detail PO"].map((detailPO, index) => (
                  <InputWrapper width="100%" key={index}>
                    <UserInput
                      subVariant="readonly"
                      labelText="Nama Item"
                      value={detailPO.itemname}
                    />
                    <UserInput
                      subVariant="readonly"
                      labelText="SKU Item"
                      value={detailPO.sku}
                    />
                    <UserInput
                      subVariant="readonly"
                      labelText="Jumlah"
                      value={detailPO.qty}
                    />
                  </InputWrapper>
                ))}
              </Fragment>
            }
          >
            <TableBodyValue
              type="num"
              value={(currentPage - 1) * limit + index + 1}
            />
            <TableBodyValue value={po["PO Stock"].postockcode} />
            <TableBodyValue value={po["PO Stock"].postockcreate} />
            <TableBodyValue value={po["PO Stock"].username} position="end" />
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
          {inputData.item.map((item, index) => (
            <React.Fragment key={index}>
              <InputWrapper>
                <UserInput
                  id={`item-name-${index}`}
                  subVariant="label"
                  labelText="Nama Item"
                  placeholder="Masukkan nama item"
                  type="text"
                  name="itemname"
                  value={item.itemname}
                  onChange={(e) => handleInputChange(index, e)}
                >
                  {suggestions[index] &&
                    !selectedSuggest[index] &&
                    suggestions[index].map((existItem, existIndex) => (
                      <DropDownButton
                        key={existIndex}
                        buttonText={existItem.name}
                        onClick={() =>
                          handleSuggestionClick(
                            index,
                            existItem.name,
                            existItem.sku
                          )
                        }
                      />
                    ))}
                </UserInput>
              </InputWrapper>
              <InputWrapper>
                <UserInput
                  id={`item-sku-${index}`}
                  subVariant="label"
                  labelText="SKU Item"
                  placeholder="Masukkan SKU item"
                  type="text"
                  name="sku"
                  value={item.sku}
                  onChange={(e) => handleInputChange(index, e)}
                />
                <UserInput
                  id={`item-qty-${index}`}
                  subVariant="label"
                  labelText="Jumlah Item"
                  placeholder="Masukkan jumlah item"
                  type="text"
                  name="stockin"
                  value={item.stockin}
                  onChange={(e) => handleInputChange(index, e)}
                />
                {index <= 0 ? (
                  <SecondaryButton variant="icon" subVariant="hollow">
                    <TrashIcon
                      width="20px"
                      height="100%"
                      color="var(--color-red-30)"
                    />
                  </SecondaryButton>
                ) : (
                  <SecondaryButton
                    variant="icon"
                    subVariant="hollow"
                    onClick={() => handleRemoveRow(index)}
                  >
                    <TrashIcon
                      width="20px"
                      height="100%"
                      color="var(--color-red)"
                    />
                  </SecondaryButton>
                )}
              </InputWrapper>
            </React.Fragment>
          ))}
          <SecondaryButton
            iconPosition="start"
            subVariant="hollow"
            buttonText="Tambah Item"
            onClick={handleAddRow}
          >
            <PlusIcon width="15px" height="100%" />
          </SecondaryButton>
        </SubmitForm>
      )}
    </section>
  );
};
