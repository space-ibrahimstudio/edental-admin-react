import React, { useState, useEffect } from "react";
import { fetchOutletList } from "../components/tools/data";
import { handleCUDReserve } from "../components/tools/handler";
import { useNotifications } from "../components/feedback/context/notifications-context";
import {
  TableData,
  TableHeadValue,
  TableBodyValue,
  TableRow,
} from "../components/layout/tables";
import { PlusIcon, ChevronDown } from "../components/layout/icons";
import { InputWrapper, UserInput } from "../components/user-input/inputs";
import { PrimButton } from "../components/user-input/buttons";
import { SearchInput } from "../components/user-input/inputs";
import { Pagination } from "../components/navigator/pagination";
import styles from "./styles/tabel-section.module.css";

export const BranchList = ({ sectionId }) => {
  const [branchData, setBranchData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isDataShown, setIsDataShown] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loadData, setLoadData] = useState(false);
  const [limit, setLimit] = useState(5);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    service: "",
    typeservice: "",
    reservationdate: "",
    reservationtime: "",
  });

  const rowsPerPage = limit;
  const startIndex = (currentPage - 1) * rowsPerPage + 1;
  const { showNotifications } = useNotifications();

  const openForm = () => setIsFormOpen(true);
  const closeForm = () => setIsFormOpen(false);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleLimitChange = (event) => {
    setLimit(parseInt(event.target.value, 10));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await handleCUDReserve(
        formData.name,
        formData.phone,
        formData.email,
        formData.service,
        formData.typeservice,
        formData.reservationdate,
        formData.reservationtime
      );
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error occurred during submit reservation:", error);
    } finally {
      window.location.reload();
    }
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
        setLoadData(true);
        const data = await fetchOutletList(currentPage, limit, setTotalPages);

        setBranchData(data);
        setFilteredData(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
        showNotifications("danger", "Error fetching user data.");
      } finally {
        setLoadData(false);
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
              subVariant="nolabel"
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
          <PrimButton buttonText="Tambah Baru" iconPosition="start">
            <PlusIcon width="17px" height="100%" />
          </PrimButton>
        </div>
      </div>
      <TableData
        headerData={tableHeadData}
        dataShown={isDataShown}
        loading={loadData}
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
      {isDataShown ? (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          handlePagination={handlePageChange}
        />
      ) : null}
    </section>
  );
};
