import React, { useState, useEffect } from "react";
import { fetchUserBooking, checkExistingData } from "../components/tools/data";
import { handleAddReserve } from "../components/tools/handler";
import { getCurrentDate } from "../components/tools/controller";
import { useNotifications } from "../components/feedback/context/notifications-context";
import {
  TableData,
  TableRow,
  TableHeadValue,
  TableBodyValue,
} from "../components/layout/tables";
import { SubmitForm } from "../components/user-input/forms";
import { InputWrapper, UserInput } from "../components/user-input/inputs";
import {
  ChevronDown,
  PlusIcon,
  EditIcon,
  TrashIcon,
} from "../components/layout/icons";
import { SecondaryButton, PrimButton } from "../components/user-input/buttons";
import { SearchInput } from "../components/user-input/inputs";
import { Pagination } from "../components/navigator/pagination";
import styles from "./styles/tabel-section.module.css";

export const Reservation = ({ sectionId }) => {
  const [reserveData, setReserveData] = useState([]);
  const [data, setData] = useState([]);
  const [phoneExist, setPhoneExist] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [isDataShown, setIsDataShown] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [hours, setHours] = useState([]);
  const [loadData, setLoadData] = useState(false);
  const [limit, setLimit] = useState(5);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    service: "",
    typeservice: "",
    price: "",
    reservationdate: "",
    reservationtime: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    phone: "",
    email: "",
    service: "",
    typeservice: "",
    price: "",
    reservationdate: "",
    reservationtime: "",
  });

  const [existingData, setExistingData] = useState({
    name: "",
    phone: "",
    email: "",
    service: "",
    typeservice: "",
    price: "",
    reservationdate: "",
    reservationtime: "",
  });

  const fetchAvailableHours = async () => {
    const availableHours = [
      "10:00",
      "10:30",
      "11:00",
      "11:30",
      "12:00",
      "12:30",
      "13:00",
      "15:00",
      "15:30",
      "16:00",
      "16:30",
      "17:00",
      "17:30",
      "18:00",
      "18:30",
      "19:00",
    ];
    setHours(availableHours);
  };

  const rowsPerPage = limit;
  const startIndex = (currentPage - 1) * rowsPerPage + 1;
  const { showNotifications } = useNotifications();

  const openForm = () => setIsFormOpen(true);
  const closeForm = () => setIsFormOpen(false);

  const closeEdit = () => {
    setIsEditOpen(false);
    setSelectedData(null);
    setExistingData({
      name: "",
      phone: "",
      email: "",
      service: "",
      typeservice: "",
      price: "",
      reservationdate: "",
      reservationtime: "",
    });
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setErrors({
      ...errors,
      [name]: "",
    });

    setFormData({
      ...formData,
      [name]: value,
    });

    if (name === "phone") {
      let phoneExists = false;

      data.forEach((item) => {
        if (item.userphone === value) {
          phoneExists = true;
        }
      });

      if (phoneExists) {
        // setErrors({
        //   ...errors,
        //   [name]: 'Phone number already exists. Please input a different number.',
        // });
        setPhoneExist(true);
      } else {
        setPhoneExist(false);
      }
    }
  };

  const handleInputEditChange = (e) => {
    const { name, value } = e.target;
    setErrors({
      ...errors,
      [name]: "",
    });

    setExistingData({
      ...existingData,
      [name]: value,
    });

    if (name === "phone") {
      let phoneExists = false;

      data.forEach((item) => {
        if (item.userphone === value) {
          phoneExists = true;
        }
      });

      if (phoneExists) {
        setPhoneExist(true);
      } else {
        setPhoneExist(false);
      }
    }
  };

  const handleLimitChange = (event) => {
    setLimit(parseInt(event.target.value, 10));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let newErrors = {};

    if (formData.name === "") {
      newErrors.name = "Name is required";
    }
    if (formData.phone === "") {
      newErrors.phone = "Phone is required";
    }
    if (formData.email === "") {
      newErrors.email = "Email is required";
    }
    if (formData.service === "") {
      newErrors.service = "This field is required";
    }
    if (formData.typeservice === "") {
      newErrors.typeservice = "This field is required";
    }
    if (formData.reservationdate === "") {
      newErrors.reservationdate = "This option is required";
    }
    if (formData.reservationtime === "") {
      newErrors.reservationtime = "This option is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await handleAddReserve(
        formData.name,
        formData.phone,
        formData.email,
        formData.service,
        formData.typeservice,
        formData.price,
        formData.reservationdate,
        formData.reservationtime
      );
      setIsFormOpen(false);
      window.location.reload();
    } catch (error) {
      console.error("Error occurred during submit reservation:", error);
    }
  };

  const handleEdit = (
    id,
    name,
    phone,
    email,
    service,
    typeservice,
    price,
    reservationdate,
    reservationtime
  ) => {
    setSelectedData(id);
    setExistingData({
      name,
      phone,
      email,
      service,
      typeservice,
      price,
      reservationdate,
      reservationtime,
    });
    setIsEditOpen(true);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this Reservation Data?"
    );
    if (confirmDelete) {
      try {
        await handleAddReserve("", "", "", "", "", "", "", "", "delete", id);
        setReserveData(
          reserveData.filter((reserve) => reserve.idreservation !== id)
        );
        window.location.reload();
      } catch (error) {
        console.error("Error deleting booking:", error);
      }
    }
  };

  const handleSubmitEdit = async () => {
    let newErrors = {};

    if (existingData.name === "") {
      newErrors.name = "Name is required";
    }
    if (existingData.phone === "") {
      newErrors.phone = "Phone is required";
    }
    if (existingData.email === "") {
      newErrors.email = "Email is required";
    }
    if (existingData.service === "") {
      newErrors.service = "This field is required";
    }
    if (existingData.typeservice === "") {
      newErrors.typeservice = "This field is required";
    }
    if (existingData.reservationdate === "") {
      newErrors.reservationdate = "This option is required";
    }
    if (existingData.reservationtime === "") {
      newErrors.reservationtime = "This option is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await handleAddReserve(
        existingData.name,
        existingData.phone,
        existingData.email,
        existingData.service,
        existingData.typeservice,
        existingData.price,
        existingData.reservationdate,
        existingData.reservationtime,
        "edit",
        selectedData
      );
      const data = await fetchUserBooking(currentPage, limit, setTotalPages);
      setReserveData(data);
      setFilteredData(data);
      closeEdit();
    } catch (error) {
      console.error("Error editing booking:", error);
    }
  };

  const tableHeadData = (
    <TableRow type="heading">
      <TableHeadValue value="NO" type="num" />
      <TableHeadValue value="Nama Pengguna">
        <ChevronDown width="10px" height="100%" />
      </TableHeadValue>
      <TableHeadValue value="Email" />
      <TableHeadValue value="Telepon" />
      <TableHeadValue value="Layanan" />
      <TableHeadValue value="Tipe Layanan" />
      <TableHeadValue value="Harga" />
      <TableHeadValue value="Tanggal Reservasi">
        <ChevronDown width="10px" height="100%" />
      </TableHeadValue>
      <TableHeadValue value="Jam Reservasi">
        <ChevronDown width="10px" height="100%" />
      </TableHeadValue>
      <TableHeadValue value="Cabang" />
      <TableHeadValue value="Action" type="atn" position="end" />
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
    const fetchData = async () => {
      try {
        const data = await checkExistingData();

        setData(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
        showNotifications("danger", "Error fetching user data.");
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    setIsDataShown(filteredData.length > 0);
  }, [filteredData]);

  useEffect(() => {
    fetchAvailableHours(formData.reservationdate);
  }, [formData.reservationdate]);

  return (
    <section id={sectionId} className={styles.tabelSection}>
      <b className={styles.tabelSectionTitle}>Data Reservasi</b>
      <div className={styles.tabelSectionNav}>
        <InputWrapper maxWidth="1000px">
          <SearchInput
            id="search-reservation"
            placeholder="Search by name ..."
            property="name"
            userData={reserveData}
            setUserData={setFilteredData}
          />
        </InputWrapper>
        <div className={styles.tabelSectionOption}>
          <InputWrapper>
            <UserInput
              variant="select"
              subVariant="nolabel"
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
            <TableBodyValue value={user.price} />
            <TableBodyValue value={user.reservationdate} />
            <TableBodyValue value={user.reservationtime} />
            <TableBodyValue value={user.idbranch} />
            <TableBodyValue type="atn" position="end">
              <SecondaryButton
                buttonText="Edit"
                iconPosition="start"
                onClick={() =>
                  handleEdit(
                    user.idreservation,
                    user.name,
                    user.phone,
                    user.email,
                    user.service,
                    user.typeservice,
                    user.price,
                    user.reservationdate,
                    user.reservationtime
                  )
                }
              >
                <EditIcon width="12px" height="100%" />
              </SecondaryButton>
              <SecondaryButton
                variant="icon"
                subVariant="hollow"
                onClick={() => handleDelete(user.idreservation)}
              >
                <TrashIcon
                  width="20px"
                  height="100%"
                  color="var(--color-red)"
                />
              </SecondaryButton>
            </TableBodyValue>
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
          saveText="Simpan"
          cancelText="Batal"
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
              error={errors.name}
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
              error={errors.phone}
            />
            <UserInput
              id="user-email"
              labelText="Email"
              placeholder="customer@gmail.com"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              error={errors.email}
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
              error={errors.service}
            />
            <UserInput
              id="service-type"
              labelText="Tipe Layanan"
              placeholder="Pilih tipe layanan"
              type="text"
              name="typeservice"
              value={formData.typeservice}
              onChange={handleInputChange}
              error={errors.typeservice}
            />
            {!phoneExist && (
              <UserInput
                id="service-price"
                labelText="Harga"
                placeholder="Masukkan harga"
                type="text"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                error={errors.price}
              />
            )}
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
              error={errors.reservationdate}
              min={getCurrentDate()}
            />
            <UserInput
              variant="select"
              id="time"
              labelText="Jam Reservasi"
              name="reservationtime"
              value={formData.reservationtime}
              onChange={handleInputChange}
              error={errors.reservationtime}
            >
              <option value="">Pilih jadwal tersedia</option>
              {hours.map((hour, index) => (
                <option key={index} value={hour}>
                  {hour}
                </option>
              ))}
            </UserInput>
          </InputWrapper>
        </SubmitForm>
      )}
      {isEditOpen && (
        <SubmitForm
          formTitle="Edit Reservasi"
          formSubtitle="Percayakan perawatan gigi anda dan keluarga kepada Edental"
          onClose={closeEdit}
          onSubmit={handleSubmitEdit}
          saveText="Simpan Perubahan"
          cancelText="Batal"
        >
          <InputWrapper>
            <UserInput
              id="edit-user-name"
              labelText="Nama Pelanggan"
              placeholder="John Doe"
              type="text"
              name="name"
              value={existingData.name}
              onChange={handleInputEditChange}
              error={errors.name}
            />
          </InputWrapper>
          <InputWrapper>
            <UserInput
              id="edit-user-phone"
              labelText="Nomor Telepon"
              placeholder="0882xxx"
              type="text"
              name="phone"
              value={existingData.phone}
              onChange={handleInputEditChange}
              error={errors.phone}
            />
            <UserInput
              id="edit-user-email"
              labelText="Email"
              placeholder="customer@gmail.com"
              type="email"
              name="email"
              value={existingData.email}
              onChange={handleInputEditChange}
              error={errors.email}
            />
          </InputWrapper>
          <InputWrapper>
            <UserInput
              id="edit-service"
              labelText="Nama Layanan"
              placeholder="Pilih layanan"
              type="text"
              name="service"
              value={existingData.service}
              onChange={handleInputEditChange}
              error={errors.service}
            />
            <UserInput
              id="edit-service-type"
              labelText="Tipe Layanan"
              placeholder="Pilih tipe layanan"
              type="text"
              name="typeservice"
              value={existingData.typeservice}
              onChange={handleInputEditChange}
              error={errors.typeservice}
            />
            {!phoneExist && (
              <UserInput
                id="edit-service-price"
                labelText="Harga"
                placeholder="Masukkan harga"
                type="text"
                name="price"
                value={existingData.price}
                onChange={handleInputEditChange}
                error={errors.price}
              />
            )}
          </InputWrapper>
          <InputWrapper>
            <UserInput
              id="edit-date"
              labelText="Tanggal Reservasi"
              placeholder="Atur tanggal"
              type="date"
              name="reservationdate"
              value={existingData.reservationdate}
              onChange={handleInputEditChange}
              error={errors.reservationdate}
            />
            <UserInput
              variant="select"
              id="edit-time"
              labelText="Jam Reservasi"
              name="reservationtime"
              value={existingData.reservationtime}
              onChange={handleInputEditChange}
              error={errors.reservationtime}
            >
              <option value="">Pilih jadwal tersedia</option>
              {hours.map((hour, index) => (
                <option key={index} value={hour}>
                  {hour}
                </option>
              ))}
            </UserInput>
          </InputWrapper>
        </SubmitForm>
      )}
    </section>
  );
};
