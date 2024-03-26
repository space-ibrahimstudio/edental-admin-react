import React, { useState, useEffect } from "react";
import { fetchDataList } from "../components/tools/data";
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
import { ChevronDown, PlusIcon, EditIcon } from "../components/layout/icons";
import { SecondaryButton, PrimButton } from "../components/user-input/buttons";
import { PaginationV2 } from "../components/navigator/paginationv2";
import styles from "./styles/tabel-section.module.css";

export const CentralPO = ({ sectionId }) => {
  const { showNotifications } = useNotifications();
  // data state
  const [poData, setPoData] = useState([]);
  const [selectedData, setSelectedData] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  // conditional context
  const [isDataShown, setIsDataShown] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  // perform action state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  // input state
  const [inputData, setInputData] = useState({
    item: "",
    sku: "",
    jumlah: "",
  });
  const [currentData, setCurrentData] = useState({
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
    setCurrentData({
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

    setInputData((prevState) => {
      return { ...prevState, [name]: value };
    });

    setErrors((prevErrors) => {
      return { ...prevErrors, [name]: "" };
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
  // start edit/delete data function
  const openEdit = (id, item, sku, jumlah) => {
    setSelectedData(id);
    setCurrentData({
      item,
      sku,
      jumlah,
    });
    setIsEditOpen(true);
  };
  const closeEdit = () => {
    cleanInput();
    setIsEditOpen(false);
    setSelectedData(null);
  };

  const handleInputEditChange = (e) => {
    const { name, value } = e.target;

    setCurrentData((prevState) => {
      return { ...prevState, [name]: value };
    });

    setErrors((prevErrors) => {
      return { ...prevErrors, [name]: "" };
    });
  };

  const handleSubmitEdit = async () => {
    let hasError = false;
    const newErrors = { ...errors };

    for (const key in currentData) {
      if (currentData[key].trim() === "") {
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
      "Apakah anda yakin untuk menyimpan perubahan data?"
    );

    if (isConfirmed) {
      try {
        setIsLoading(true);
        await handleCUDCentralPO(currentData, "edit", selectedData);
        showNotifications(
          "success",
          "Selamat! Perubahan data PO Pusat berhasil disimpan."
        );

        const offset = (currentPage - 1) * limit;
        const data = await fetchDataList(offset, limit, "viewpostock");
        setPoData(data.data);
        setFilteredData(data.data);
        setTotalPages(data.TTLPage);

        closeEdit();
      } catch (error) {
        console.error("Error editing central PO:", error);
        showNotifications(
          "danger",
          "Gagal memperbarui data PO Pusat. Mohon periksa koneksi internet anda dan muat ulang halaman."
        );
      } finally {
        setIsLoading(false);
      }
    }
  };
  // end edit/delete data function
  const tableHeadData = (
    <TableRow type="heading">
      <TableHeadValue value="NO" type="num" />
      <TableHeadValue value="Action" type="atn" />
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
            <TableBodyValue type="atn">
              <SecondaryButton
                buttonText="Edit"
                iconPosition="start"
                onClick={() =>
                  openEdit(po.idpostock, po.itemname, po.sku, po.qty)
                }
              >
                <EditIcon width="12px" height="100%" />
              </SecondaryButton>
            </TableBodyValue>
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
      {isEditOpen && (
        <SubmitForm
          formTitle="Edit Permintaan PO Pusat"
          onClose={closeEdit}
          onSubmit={handleSubmitEdit}
          saveText="Simpan Perubahan"
          cancelText="Batal"
          loading={isLoading}
        >
          <InputWrapper>
            <UserInput
              id="edit-item-name"
              subVariant="label"
              labelText="Nama Item"
              placeholder="Masukkan nama item"
              type="text"
              name="item"
              value={currentData.item}
              onChange={handleInputEditChange}
              error={errors.item}
            />
          </InputWrapper>
          <InputWrapper>
            <UserInput
              id="edit-item-sku"
              subVariant="label"
              labelText="SKU Item"
              placeholder="Masukkan SKU item"
              type="text"
              name="sku"
              value={currentData.sku}
              onChange={handleInputEditChange}
              error={errors.sku}
            />
            <UserInput
              id="edit-item-qty"
              subVariant="label"
              labelText="Jumlah Item"
              placeholder="Masukkan jumlah item"
              type="text"
              name="jumlah"
              value={currentData.jumlah}
              onChange={handleInputEditChange}
              error={errors.jumlah}
            />
          </InputWrapper>
        </SubmitForm>
      )}
    </section>
  );
};
