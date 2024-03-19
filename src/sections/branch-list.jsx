import React, { useState, useEffect } from "react";
import { fetchOutletList } from "../components/tools/data";
import { handleCUDBranch } from "../components/tools/handler";
import { useNotifications } from "../components/feedback/context/notifications-context";
import {
  TableData,
  TableHeadValue,
  TableBodyValue,
  TableRow,
} from "../components/layout/tables";
import { SubmitForm } from "../components/user-input/forms";
import { PlusIcon, ChevronDown } from "../components/layout/icons";
import { InputWrapper, UserInput } from "../components/user-input/inputs";
import { PrimButton } from "../components/user-input/buttons";
import { SearchInput } from "../components/user-input/inputs";
import { Pagination } from "../components/navigator/pagination";
import styles from "./styles/tabel-section.module.css";

export const BranchList = ({ sectionId }) => {
  const { showNotifications } = useNotifications();
  const [branchData, setBranchData] = useState([]);
  const [selectedData, setSelectedData] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [isDataShown, setIsDataShown] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [limit, setLimit] = useState(5);
  const [inputData, setInputData] = useState({
    region: "",
    name: "",
    address: "",
    phone: "",
  });
  const [currentData, setCurrentData] = useState({
    region: "",
    name: "",
    address: "",
    phone: "",
  });
  const [errors, setErrors] = useState({
    region: "",
    name: "",
    address: "",
    phone: "",
  });
  const cleanInput = () => {
    setInputData({
      region: "",
      name: "",
      address: "",
      phone: "",
    });
    setErrors({
      region: "",
      name: "",
      address: "",
      phone: "",
    });
  };
  const rowsPerPage = limit;
  const startIndex = (currentPage - 1) * rowsPerPage + 1;
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  const handleLimitChange = (event) => {
    setLimit(parseInt(event.target.value, 10));
    setCurrentPage(1);
  };

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

    setInputData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const confirmSubmit = window.confirm(
      "Are you sure you want to submit this Outlet Data?"
    );

    if (confirmSubmit) {
      try {
        setIsLoading(true);
        await handleCUDBranch(
          inputData.region,
          inputData.name,
          inputData.address,
          inputData.phone
        );

        const data = await fetchOutletList(currentPage, limit, setTotalPages);
        setBranchData(data);
        setFilteredData(data);

        closeForm();
      } catch (error) {
        console.error("Error occurred during submit reservation:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const openEdit = (id, region, name, address, phone) => {
    setSelectedData(id);
    setCurrentData({
      region,
      name,
      address,
      phone,
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
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchOutletList(currentPage, limit, setTotalPages);

        setBranchData(data);
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
    setIsDataShown(filteredData.length > 0);
  }, [filteredData]);

  return (
    <section id={sectionId} className={styles.tabelSection}>
      <b className={styles.tabelSectionTitle}>Cabang Edental</b>
      <div className={styles.tabelSectionNav}>
        <InputWrapper>
          <SearchInput
            id="search-branch"
            placeholder="Search by location ..."
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
        {filteredData.map((user, index) => (
          <TableRow key={user.idoutlet} isEven={index % 2 === 0}>
            <TableBodyValue type="num" value={startIndex + index} />
            <TableBodyValue value={user.outlet_name} />
            <TableBodyValue value={user.outlet_address} />
            <TableBodyValue value={user.outlet_region} />
            <TableBodyValue value={user.outlet_phone} position="end" />
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
              id="outlet-region"
              subVariant="label"
              labelText="Provinsi"
              placeholder="Jakarta"
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
        </SubmitForm>
      )}
    </section>
  );
};
