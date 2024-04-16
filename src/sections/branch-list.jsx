import React, { useState, useEffect } from "react";
import { Button } from "@ibrahimstudio/button";
import { Input } from "@ibrahimstudio/input";
import { exportToExcel } from "../components/tools/controller";
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
import { InputWrapper } from "../components/user-input/inputs";
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
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
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
          "Gagal menambahkan data. Mohon periksa koneksi internet anda dan muat ulang halaman."
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

  const handleSubmitEdit = async (e) => {
    e.preventDefault();

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
        setIsFetching(true);
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
        setIsFetching(false);
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
            id={`search-data-${sectionId}`}
            placeholder="Cari data ..."
            property="outlet_name"
            userData={branchData}
            setUserData={setFilteredData}
          />
          <Button
            id={`export-data-${sectionId}`}
            buttonText="Export ke Excel"
            radius="full"
            bgColor="var(--color-green)"
            onClick={() =>
              exportToExcel(filteredData, "Daftar Cabang", "daftar_cabang")
            }
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
        {filteredData.map((branch, index) => (
          <TableRow
            key={index}
            isEven={index % 2 === 0}
            isClickable={true}
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
          formTitle="Tambah Data Cabang"
          onClose={closeForm}
          onSubmit={handleSubmit}
          saveText="Simpan"
          cancelText="Batal"
          loading={isLoading}
        >
          <InputWrapper>
            <Input
              id="outlet-name"
              labelText="Nama Cabang"
              placeholder="Edental Jakarta"
              type="text"
              name="name"
              value={inputData.name}
              onChange={handleInputChange}
              errorContent={errors.name}
              isRequired
            />
            <Input
              id="outlet-phone"
              labelText="Nomor Kontak Cabang"
              placeholder="0882xxx"
              type="tel"
              name="phone"
              value={inputData.phone}
              onChange={handleInputChange}
              errorContent={errors.phone}
              isRequired
            />
            <Input
              id="outlet-mainregion"
              labelText="Main Region"
              placeholder="Jawa Barat"
              type="text"
              name="mainregion"
              value={inputData.mainregion}
              onChange={handleInputChange}
              errorContent={errors.mainregion}
              isRequired
            />
          </InputWrapper>
          <InputWrapper>
            <Input
              id="outlet-region"
              labelText="Region"
              placeholder="Bandung"
              type="text"
              name="region"
              value={inputData.region}
              onChange={handleInputChange}
              errorContent={errors.region}
              isRequired
            />
            <Input
              id="outlet-address"
              labelText="Alamat Cabang"
              placeholder="123 Main Street"
              type="text"
              name="address"
              value={inputData.address}
              onChange={handleInputChange}
              errorContent={errors.address}
              isRequired
            />
            <Input
              id="outlet-postcode"
              labelText="Kode Pos"
              placeholder="40282"
              type="number"
              name="postcode"
              value={inputData.postcode}
              onChange={handleInputChange}
              errorContent={errors.postcode}
              isRequired
            />
          </InputWrapper>
          <InputWrapper>
            <Input
              id="outlet-coordinate"
              labelText="Titik Koordinat"
              placeholder="Masukkan titik koordinat"
              type="number"
              name="coordinate"
              value={inputData.coordinate}
              onChange={handleInputChange}
              errorContent={errors.coordinate}
              isRequired
            />
            <Input
              id="outlet-cctrgroup"
              labelText="CCTR Group"
              placeholder="Masukkan CCTR group"
              type="text"
              name="cctrGroup"
              value={inputData.cctrGroup}
              onChange={handleInputChange}
              errorContent={errors.cctrGroup}
              isRequired
            />
            <Input
              id="outlet-cctr"
              labelText="CCTR"
              placeholder="Masukkan CCTR"
              type="text"
              name="cctr"
              value={inputData.cctr}
              onChange={handleInputChange}
              errorContent={errors.cctr}
              isRequired
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
            <Input
              id="edit-outlet-name"
              labelText="Nama Cabang"
              placeholder="Edental Jakarta"
              type="text"
              name="name"
              value={currentData.name}
              onChange={handleInputEditChange}
              errorContent={errors.name}
              isRequired
            />
            <Input
              id="edit-outlet-phone"
              labelText="Nomor Kontak Cabang"
              placeholder="0882xxx"
              type="tel"
              name="phone"
              value={currentData.phone}
              onChange={handleInputEditChange}
              errorContent={errors.phone}
              isRequired
            />
            <Input
              id="edit-outlet-mainregion"
              labelText="Main Region"
              placeholder="Jawa Barat"
              type="text"
              name="mainregion"
              value={currentData.mainregion}
              onChange={handleInputEditChange}
              errorContent={errors.mainregion}
              isRequired
            />
          </InputWrapper>
          <InputWrapper>
            <Input
              id="edit-outlet-region"
              labelText="Region"
              placeholder="Bandung"
              type="text"
              name="region"
              value={currentData.region}
              onChange={handleInputEditChange}
              errorContent={errors.region}
              isRequired
            />
            <Input
              id="edit-outlet-address"
              labelText="Alamat Cabang"
              placeholder="123 Main Street"
              type="text"
              name="address"
              value={currentData.address}
              onChange={handleInputEditChange}
              errorContent={errors.address}
              isRequired
            />
            <Input
              id="edit-outlet-postcode"
              labelText="Kode Pos"
              placeholder="40282"
              type="number"
              name="postcode"
              value={currentData.postcode}
              onChange={handleInputEditChange}
              errorContent={errors.postcode}
              isRequired
            />
          </InputWrapper>
          <InputWrapper>
            <Input
              id="edit-outlet-coordinate"
              labelText="Titik Koordinat"
              placeholder="Masukkan titik koordinat"
              type="number"
              name="coordinate"
              value={currentData.coordinate}
              onChange={handleInputEditChange}
              errorContent={errors.coordinate}
              isRequired
            />
            <Input
              id="edit-outlet-cctrgroup"
              labelText="CCTR Group"
              placeholder="Masukkan CCTR group"
              type="text"
              name="cctrGroup"
              value={currentData.cctrGroup}
              onChange={handleInputEditChange}
              errorContent={errors.cctrGroup}
              isRequired
            />
            <Input
              id="edit-outlet-cctr"
              labelText="CCTR"
              placeholder="Masukkan CCTR"
              type="text"
              name="cctr"
              value={currentData.cctr}
              onChange={handleInputEditChange}
              errorContent={errors.cctr}
              isRequired
            />
          </InputWrapper>
        </SubmitForm>
      )}
    </section>
  );
};
