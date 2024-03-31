import React, { useState, useEffect } from "react";
import { fetchDataList } from "../components/tools/data";
import { handleCUDBranch } from "../components/tools/handler";
import { useNotifications } from "../components/feedback/context/notifications-context";
import {
  TableData,
  TableHeadValue,
  TableBodyValue,
  TableRow,
} from "../components/layout/tables";
import { SubmitForm } from "../components/user-input/forms";
import { PlusIcon } from "../components/layout/icons";
import { InputWrapper, UserInput } from "../components/user-input/inputs";
import { PrimButton } from "../components/user-input/buttons";
import { SearchInput } from "../components/user-input/inputs";
import { PaginationV2 } from "../components/navigator/paginationv2";
import styles from "./styles/tabel-section.module.css";

export const BranchList = ({ sectionId }) => {
  const { showNotifications } = useNotifications();
  // data state
  const [branchData, setBranchData] = useState([]);
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
  const [inputData, setInputData] = useState({
    region: "",
    name: "",
    address: "",
    phone: "",
    mainregion: "",
    postcode: "",
    cctrGroup: "",
    cctr: "",
    coordinate: "",
  });
  const [errors, setErrors] = useState({
    region: "",
    name: "",
    address: "",
    phone: "",
    mainregion: "",
    postcode: "",
    cctrGroup: "",
    cctr: "",
    coordinate: "",
  });
  const cleanInput = () => {
    setInputData({
      region: "",
      name: "",
      address: "",
      phone: "",
      mainregion: "",
      postcode: "",
      cctrGroup: "",
      cctr: "",
      coordinate: "",
    });
    setErrors({
      region: "",
      name: "",
      address: "",
      phone: "",
      mainregion: "",
      postcode: "",
      cctrGroup: "",
      cctr: "",
      coordinate: "",
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
        await handleCUDBranch(inputData);
        showNotifications(
          "success",
          "Selamat! Data Cabang baru berhasil ditambahkan."
        );

        const offset = (currentPage - 1) * limit;
        const data = await fetchDataList(offset, limit, "viewoutlet");
        setBranchData(data.data);
        setFilteredData(data.data);
        setTotalPages(data.TTLPage);

        closeForm();
      } catch (error) {
        console.error("Error occurred during submit branch:", error);
        showNotifications(
          "danger",
          "Gagal menambahkan data Cabang. Mohon periksa koneksi internet anda dan muat ulang halaman."
        );
      } finally {
        setIsLoading(false);
      }
    }
  };
  // end add data function
  const tableHeadData = (
    <TableRow type="heading">
      <TableHeadValue type="num" value="NO" />
      <TableHeadValue value="Nama Cabang" />
      <TableHeadValue value="Alamat Cabang" />
      <TableHeadValue value="Provinsi" />
      <TableHeadValue value="Kontak" position="end" />
    </TableRow>
  );

  useEffect(() => {
    const fetchData = async (page, limit) => {
      try {
        setIsLoading(true);
        const offset = (page - 1) * limit;
        const data = await fetchDataList(offset, limit, "viewoutlet");

        setBranchData(data.data);
        setFilteredData(data.data);
        setTotalPages(data.TTLPage);
      } catch (error) {
        console.error("Error fetching branch data:", error);
        showNotifications(
          "danger",
          "Gagal menampilkan data Cabang. Mohon periksa koneksi internet anda dan muat ulang halaman."
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
      <b className={styles.tabelSectionTitle}>Cabang Edental</b>
      <div className={styles.tabelSectionNav}>
        <InputWrapper>
          <SearchInput
            id="search-branch"
            placeholder="Search data ..."
            property="outlet_name"
            userData={branchData}
            setUserData={setFilteredData}
          />
        </InputWrapper>
        <div className={styles.tabelSectionOption}>
          <InputWrapper>
            <UserInput
              variant="select"
              id="total-branch"
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
            iconPosition="start"
            onClick={openForm}
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
        {filteredData.map((branch, index) => (
          <TableRow key={index} isEven={index % 2 === 0}>
            <TableBodyValue
              type="num"
              value={(currentPage - 1) * limit + index + 1}
            />
            <TableBodyValue value={branch.outlet_name} />
            <TableBodyValue value={branch.outlet_address} />
            <TableBodyValue value={branch.outlet_region} />
            <TableBodyValue value={branch.outlet_phone} position="end" />
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
          formTitle="Tambah Cabang"
          onClose={closeForm}
          onSubmit={handleSubmit}
          saveText="Simpan"
          cancelText="Batal"
          loading={isLoading}
        >
          <InputWrapper>
            <UserInput
              id="outlet-name"
              subVariant="label"
              labelText="Nama Cabang"
              placeholder="Edental Jakarta"
              type="text"
              name="name"
              value={inputData.name}
              onChange={handleInputChange}
              error={errors.name}
            />
            <UserInput
              id="oultet-phone"
              subVariant="label"
              labelText="Nomor Kontak Cabang"
              placeholder="0882xxx"
              type="text"
              name="phone"
              value={inputData.phone}
              onChange={handleInputChange}
              error={errors.phone}
            />
          </InputWrapper>
          <InputWrapper>
            <UserInput
              id="outlet-mainregion"
              subVariant="label"
              labelText="Main Region"
              placeholder="Jawa Barat"
              type="text"
              name="mainregion"
              value={inputData.mainregion}
              onChange={handleInputChange}
              error={errors.mainregion}
            />
            <UserInput
              id="outlet-region"
              subVariant="label"
              labelText="Region"
              placeholder="Bandung"
              type="text"
              name="region"
              value={inputData.region}
              onChange={handleInputChange}
              error={errors.region}
            />
          </InputWrapper>
          <InputWrapper>
            <UserInput
              id="outlet-address"
              subVariant="label"
              labelText="Alamat Cabang"
              placeholder="123 Main Street"
              type="text"
              name="address"
              value={inputData.address}
              onChange={handleInputChange}
              error={errors.address}
            />
            <UserInput
              id="outlet-postcode"
              subVariant="label"
              labelText="Alamat Cabang"
              placeholder="123 Main Street"
              type="text"
              name="postcode"
              value={inputData.postcode}
              onChange={handleInputChange}
              error={errors.postcode}
            />
            <UserInput
              id="outlet-coordinate"
              subVariant="label"
              labelText="Titik Koordinat"
              placeholder="Masukkan titik koordinat"
              type="text"
              name="coordinate"
              value={inputData.coordinate}
              onChange={handleInputChange}
              error={errors.coordinate}
            />
          </InputWrapper>
          <InputWrapper>
            <UserInput
              id="outlet-cctrgroup"
              subVariant="label"
              labelText="CCTR Group"
              placeholder="Masukkan CCTR Group"
              type="text"
              name="cctrGroup"
              value={inputData.cctrGroup}
              onChange={handleInputChange}
              error={errors.cctrGroup}
            />
            <UserInput
              id="outlet-cctr"
              subVariant="label"
              labelText="CCTR"
              placeholder="Masukkan CCTR"
              type="text"
              name="cctr"
              value={inputData.cctr}
              onChange={handleInputChange}
              error={errors.cctr}
            />
          </InputWrapper>
        </SubmitForm>
      )}
    </section>
  );
};
