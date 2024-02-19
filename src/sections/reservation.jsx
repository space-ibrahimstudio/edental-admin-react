import React, { useState, useEffect } from "react";
import { fetchUserBooking } from "../components/tools/data";
import { handleAddReserve } from "../components/tools/handler";
import { useNotifications } from "../components/feedback/context/notifications-context";
import {
  TableData,
  TableRow,
  TableHeadValue,
  TableBodyValue,
} from "../components/layout/tables";
import { SubmitForm } from "../components/user-input/forms";
import { InputWrapper, UserInput } from "../components/user-input/inputs";
import { ChevronDown, PlusIcon } from "../components/layout/icons";
import { OptionButton } from "../components/user-input/buttons";
import { SearchInput } from "../components/user-input/inputs";
import { Pagination } from "../components/navigator/pagination";
import "./styles/user-list.css";
import "../pages/styles/new.css";

export const Reservation = ({ sectionId }) => {
  const [reserveData, setReserveData] = useState([]);
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
      await handleAddReserve(
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

  const openForm = () => setIsFormOpen(true);
  const closeForm = () => setIsFormOpen(false);

  const tableHeadData = (
    <TableRow type="heading">
      <TableHeadValue type="num" value="NO" />
      <TableHeadValue hasIcon="yes" value="Nama Pengguna">
        <ChevronDown width="10px" height="100%" />
      </TableHeadValue>
      <TableHeadValue value="Email" />
      <TableHeadValue value="Telepon" />
      <TableHeadValue value="Layanan" />
      <TableHeadValue value="Tipe Layanan" />
      <TableHeadValue hasIcon="yes" value="Tanggal Reservasi">
        <ChevronDown width="10px" height="100%" />
      </TableHeadValue>
      <TableHeadValue hasIcon="yes" value="Jam Reservasi">
        <ChevronDown width="10px" height="100%" />
      </TableHeadValue>
      <TableHeadValue value="Cabang" position="end" />
    </TableRow>
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadData(true);
        const data = await fetchUserBooking(currentPage, limit, setTotalPages);

        setReserveData(data);
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
    <section id={sectionId} className="tabel-section">
      <b className="tabel-section-title">Data Reservasi</b>
      <div className="tabel-section-nav">
        <SearchInput
          id="search-reservation"
          placeholder="Search by name ..."
          property="name"
          userData={reserveData}
          setUserData={setFilteredData}
        />
        <div className="tabel-section-option">
          <OptionButton
            id="total-reservation"
            value={limit}
            onChange={handleLimitChange}
          >
            <option value={5}>Baris: 5</option>
            <option value={10}>Baris: 10</option>
            <option value={20}>Baris: 20</option>
            <option value={50}>Baris: 50</option>
          </OptionButton>
          <button className="user-list-add" onClick={openForm}>
            <b className="user-list-add-text">Tambah Baru</b>
            <PlusIcon width="17px" height="100%" color="var(--color-white)" />
          </button>
        </div>
      </div>
      <TableData
        headerData={tableHeadData}
        dataShown={isDataShown}
        loading={loadData}
      >
        {filteredData.map((user, index) => (
          <TableRow key={user.idreservation}>
            <TableBodyValue type="num" value={startIndex + index} />
            <TableBodyValue value={user.name} />
            <TableBodyValue value={user.email} />
            <TableBodyValue value={user.phone} />
            <TableBodyValue value={user.service} />
            <TableBodyValue value={user.typeservice} />
            <TableBodyValue value={user.reservationdate} />
            <TableBodyValue value={user.reservationtime} />
            <TableBodyValue value={user.idbranch} position="end" />
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
      {isFormOpen && (
        <SubmitForm
          formTitle="Tambah Reservasi"
          formSubtitle="Percayakan perawatan gigi anda dan keluarga kepada Edental"
          onClose={closeForm}
          onSubmit={handleSubmit}
        >
          <InputWrapper>
            <UserInput
              id="user-name"
              labelText="Nama Pelanggan"
              placeholder="John Doe"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
            />
          </InputWrapper>
          <InputWrapper>
            <UserInput
              id="user-phone"
              labelText="Nomor Telepon"
              placeholder="0882xxx"
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
            />
            <UserInput
              id="user-email"
              labelText="Email"
              placeholder="customer@gmail.com"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
            />
          </InputWrapper>
          <InputWrapper>
            <UserInput
              id="service"
              labelText="Nama Layanan"
              placeholder="Pilih layanan"
              type="text"
              name="service"
              value={formData.service}
              onChange={handleInputChange}
            />
            <UserInput
              id="service-type"
              labelText="Tipe Layanan"
              placeholder="Pilih tipe layanan"
              type="text"
              name="typeservice"
              value={formData.typeservice}
              onChange={handleInputChange}
            />
          </InputWrapper>
          <InputWrapper>
            <UserInput
              id="date"
              labelText="Tanggal Reservasi"
              placeholder="Atur tanggal"
              type="date"
              name="reservationdate"
              value={formData.reservationdate}
              onChange={handleInputChange}
            />
            <UserInput
              id="time"
              labelText="Jam Reservasi"
              placeholder="Pilih jadwal tersedia"
              type="text"
              name="reservationtime"
              value={formData.reservationtime}
              onChange={handleInputChange}
            />
          </InputWrapper>
        </SubmitForm>
      )}
    </section>
  );
};
