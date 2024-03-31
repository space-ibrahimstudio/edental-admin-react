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
  const [currentData, setCurrentData] = useState({
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
        await handleCUDBranch(inputData);
        showNotifications(
          "success",
          "Selamat! Data Cabang baru berhasil ditambahkan."
        );

        const offset = (currentPage - 1) * limit;
        const data = await fetchDataList(offset, limit, "viewoutlet");

        if (data && data.data && data.data.length > 0) {
          setBranchData(data.data);
          setFilteredData(data.data);
          setTotalPages(data.TTLPage);
          setIsDataShown(true);
        } else {
          setBranchData([]);
          setFilteredData([]);
          setTotalPages(0);
          setIsDataShown(false);
        }
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
  // start edit/delete data function
  const openEdit = (
    id,
    region,
    name,
    address,
    phone,
    mainregion,
    postcode,
    cctrGroup,
    cctr,
    coordinate
  ) => {
    setSelectedData(id);
    setCurrentData({
      region,
      name,
      address,
      phone,
      mainregion,
      postcode,
      cctrGroup,
      cctr,
      coordinate,
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
    setErrors({
      ...errors,
      [name]: "",
    });

    setCurrentData({
      ...currentData,
      [name]: value,
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

    const confirmEdit = window.confirm(
      "Apakah anda yakin untuk menyimpan perubahan?"
    );

    if (confirmEdit) {
      try {
        setIsLoading(true);
        await handleCUDBranch(currentData, "edit", selectedData);
        showNotifications(
          "success",
          "Selamat! Data Cabang berhasil diperbarui."
        );

        const offset = (currentPage - 1) * limit;
        const data = await fetchDataList(offset, limit, "viewoutlet");

        if (data && data.data && data.data.length > 0) {
          setBranchData(data.data);
          setFilteredData(data.data);
          setTotalPages(data.TTLPage);
          setIsDataShown(true);
        } else {
          setBranchData([]);
          setFilteredData([]);
          setTotalPages(0);
          setIsDataShown(false);
        }
        closeEdit();
      } catch (error) {
        console.error("Error editing branch data:", error);
        showNotifications(
          "danger",
          "Gagal menyimpan perubahan. Mohon periksa koneksi internet anda dan muat ulang halaman."
        );
      } finally {
        setIsLoading(false);
      }
    }
  };
  // end edit/delete data function
  const tableHeadData = (
    <TableRow type="heading">
      <TableHeadValue type="num" value="NO" />
      <TableHeadValue value="Nama Cabang" />
      <TableHeadValue value="Alamat Cabang" />
      <TableHeadValue value="Main Region" />
      <TableHeadValue value="Region" />
      <TableHeadValue value="CCTR Group" />
      <TableHeadValue value="CCTR" />
      <TableHeadValue value="Telepon" />
      <TableHeadValue value="Kode POS" />
      <TableHeadValue value="Titik Koordinat" position="end" />
    </TableRow>
  );

  useEffect(() => {
    const fetchData = async (page, limit) => {
      try {
        setIsLoading(true);
        const offset = (page - 1) * limit;
        const data = await fetchDataList(offset, limit, "viewoutlet");

        if (data && data.data && data.data.length > 0) {
          setBranchData(data.data);
          setFilteredData(data.data);
          setTotalPages(data.TTLPage);
          setIsDataShown(true);
        } else {
          setBranchData([]);
          setFilteredData([]);
          setTotalPages(0);
          setIsDataShown(false);
        }
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
          <TableRow
            key={index}
            isEven={index % 2 === 0}
            onClick={() =>
              openEdit(
                branch.idoutlet,
                branch.outlet_region,
                branch.outlet_name,
                branch.outlet_address,
                branch.outlet_phone,
                branch.mainregion,
                branch.postcode,
                branch.cctr_group,
                branch.cctr,
                branch.coordinate
              )
            }
          >
            <TableBodyValue
              type="num"
              value={(currentPage - 1) * limit + index + 1}
            />
            <TableBodyValue value={branch.outlet_name} />
            <TableBodyValue value={branch.outlet_address} />
            <TableBodyValue value={branch.mainregion} />
            <TableBodyValue value={branch.outlet_region} />
            <TableBodyValue value={branch.cctr_group} />
            <TableBodyValue value={branch.cctr} />
            <TableBodyValue value={branch.outlet_phone} />
            <TableBodyValue value={branch.postcode} />
            <TableBodyValue value={branch.coordinate} position="end" />
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
      {isEditOpen && (
        <SubmitForm
          formTitle="Edit Data Cabang"
          onClose={closeEdit}
          onSubmit={handleSubmitEdit}
          saveText="Simpan Perubahan"
          cancelText="Batal"
          loading={isLoading}
        >
          <InputWrapper>
            <UserInput
              id="edit-outlet-name"
              subVariant="label"
              labelText="Nama Cabang"
              placeholder="Edental Jakarta"
              type="text"
              name="name"
              value={currentData.name}
              onChange={handleInputEditChange}
              error={errors.name}
            />
            <UserInput
              id="edit-oultet-phone"
              subVariant="label"
              labelText="Nomor Kontak Cabang"
              placeholder="0882xxx"
              type="text"
              name="phone"
              value={currentData.phone}
              onChange={handleInputEditChange}
              error={errors.phone}
            />
          </InputWrapper>
          <InputWrapper>
            <UserInput
              id="edit-outlet-mainregion"
              subVariant="label"
              labelText="Main Region"
              placeholder="Jawa Barat"
              type="text"
              name="mainregion"
              value={currentData.mainregion}
              onChange={handleInputEditChange}
              error={errors.mainregion}
            />
            <UserInput
              id="edit-outlet-region"
              subVariant="label"
              labelText="Region"
              placeholder="Bandung"
              type="text"
              name="region"
              value={currentData.region}
              onChange={handleInputEditChange}
              error={errors.region}
            />
          </InputWrapper>
          <InputWrapper>
            <UserInput
              id="edit-outlet-address"
              subVariant="label"
              labelText="Alamat Cabang"
              placeholder="123 Main Street"
              type="text"
              name="address"
              value={currentData.address}
              onChange={handleInputEditChange}
              error={errors.address}
            />
            <UserInput
              id="edit-outlet-postcode"
              subVariant="label"
              labelText="Alamat Cabang"
              placeholder="123 Main Street"
              type="text"
              name="postcode"
              value={currentData.postcode}
              onChange={handleInputEditChange}
              error={errors.postcode}
            />
            <UserInput
              id="edit-outlet-coordinate"
              subVariant="label"
              labelText="Titik Koordinat"
              placeholder="Masukkan titik koordinat"
              type="text"
              name="coordinate"
              value={currentData.coordinate}
              onChange={handleInputEditChange}
              error={errors.coordinate}
            />
          </InputWrapper>
          <InputWrapper>
            <UserInput
              id="edit-outlet-cctrgroup"
              subVariant="label"
              labelText="CCTR Group"
              placeholder="Masukkan CCTR Group"
              type="text"
              name="cctrGroup"
              value={currentData.cctrGroup}
              onChange={handleInputEditChange}
              error={errors.cctrGroup}
            />
            <UserInput
              id="edit-outlet-cctr"
              subVariant="label"
              labelText="CCTR"
              placeholder="Masukkan CCTR"
              type="text"
              name="cctr"
              value={currentData.cctr}
              onChange={handleInputEditChange}
              error={errors.cctr}
            />
          </InputWrapper>
        </SubmitForm>
      )}
    </section>
  );
};
