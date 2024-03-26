import React, { useState, useEffect } from "react";
import { Fragment } from "../components/tools/controller";
import {
  fetchHoursList,
  fetchDataList,
  fetchAllDataList,
} from "../components/tools/data";
import { handleCUDReserve } from "../components/tools/handler";
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
import { PaginationV2 } from "../components/navigator/paginationv2";
import styles from "./styles/tabel-section.module.css";

export const Reservation = ({ sectionId }) => {
  const { showNotifications } = useNotifications();
  // data state
  const [reserveData, setReserveData] = useState([]);
  const [allData, setAllData] = useState([]);
  const [selectedData, setSelectedData] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [serviceData, setServiceData] = useState([]);
  const [subServiceData, setSubServiceData] = useState([]);
  // conditional context
  const [custExist, setCustExist] = useState(false);
  const [isDataShown, setIsDataShown] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  // perform action state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  // input state
  const [hours, setHours] = useState([]);
  const [inputData, setInputData] = useState({
    name: "",
    phone: "",
    email: "",
    service: "",
    typeservice: "",
    reservationdate: "",
    reservationtime: "",
  });
  const [currentData, setCurrentData] = useState({
    name: "",
    phone: "",
    email: "",
    service: "",
    typeservice: "",
    reservationdate: "",
    reservationtime: "",
  });
  const [errors, setErrors] = useState({
    name: "",
    phone: "",
    email: "",
    service: "",
    typeservice: "",
    reservationdate: "",
    reservationtime: "",
  });
  const cleanInput = () => {
    setInputData({
      name: "",
      phone: "",
      email: "",
      service: "",
      typeservice: "",
      reservationdate: "",
      reservationtime: "",
    });
    setErrors({
      name: "",
      phone: "",
      email: "",
      service: "",
      typeservice: "",
      reservationdate: "",
      reservationtime: "",
    });
    setCustExist(false);
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

    if (name === "phone") {
      let phoneExists = false;
      let matchedData = null;

      allData.forEach((item) => {
        if (item.userphone === value) {
          phoneExists = true;
          matchedData = item;
        }
      });

      if (phoneExists) {
        setCustExist(true);
        setInputData((prevState) => ({
          ...prevState,
          name: matchedData.username,
          email: matchedData.useremail,
        }));
      } else {
        setCustExist(false);
      }
    }

    const selectedService = serviceData.find(
      (service) => service["Nama Layanan"].servicename === value
    );

    if (selectedService) {
      setSubServiceData(selectedService["Jenis Layanan"]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let hasError = false;
    const newErrors = { ...errors };

    for (const key in inputData) {
      if (inputData[key].trim() === "") {
        newErrors[key] = "This field is required.";
        hasError = true;
      } else {
        newErrors[key] = "";
      }
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    const confirmSubmit = window.confirm(
      "Are you sure you want to submit this Reservation Data?"
    );

    if (confirmSubmit) {
      try {
        setIsLoading(true);
        await handleCUDReserve(inputData);

        const offset = (currentPage - 1) * limit;
        const data = await fetchDataList(offset, limit, "viewreservation");
        setReserveData(data.data);
        setFilteredData(data.data);
        setTotalPages(data.TTLPage);

        closeForm();
      } catch (error) {
        console.error("Error occurred during submit reservation:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };
  // end add data function
  // start edit/delete data function
  const openEdit = (
    id,
    name,
    phone,
    email,
    service,
    typeservice,
    reservationdate,
    reservationtime
  ) => {
    setSelectedData(id);
    setCurrentData({
      name,
      phone,
      email,
      service,
      typeservice,
      reservationdate,
      reservationtime,
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

    if (name === "phone") {
      let phoneExists = false;

      allData.forEach((item) => {
        if (item.userphone === value) {
          phoneExists = true;
        }
      });

      if (phoneExists) {
        setCustExist(true);
      } else {
        setCustExist(false);
      }
    }

    const selectedService = serviceData.find(
      (service) => service["Nama Layanan"].servicename === value
    );

    if (selectedService) {
      setSubServiceData(selectedService["Jenis Layanan"]);
    }
  };

  const handleSubmitEdit = async () => {
    let hasError = false;
    const newErrors = { ...errors };

    for (const key in currentData) {
      if (currentData[key].trim() === "") {
        newErrors[key] = "This field is required.";
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
      "Are you sure you want to submit this Reservation Data?"
    );

    if (confirmEdit) {
      try {
        setIsLoading(true);
        await handleCUDReserve(currentData, "edit", selectedData);

        const offset = (currentPage - 1) * limit;
        const data = await fetchDataList(offset, limit, "viewreservation");
        setReserveData(data.data);
        setFilteredData(data.data);
        setTotalPages(data.TTLPage);

        closeEdit();
      } catch (error) {
        console.error("Error editing booking:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSubmitDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this Reservation Data?"
    );
    if (confirmDelete) {
      try {
        await handleCUDReserve("", "delete", id);

        const offset = (currentPage - 1) * limit;
        const data = await fetchDataList(offset, limit, "viewreservation");
        setReserveData(data.data);
        setFilteredData(data.data);
        setTotalPages(data.TTLPage);

        setReserveData(
          reserveData.filter((reserve) => reserve.idreservation !== id)
        );
      } catch (error) {
        console.error("Error deleting booking:", error);
      }
    }
  };
  // end edit/delete data function
  const tableHeadData = (
    <TableRow type="heading">
      <TableHeadValue value="NO" type="num" />
      <TableHeadValue value="Action" type="atn" />
      <TableHeadValue value="Nama Pengguna">
        <ChevronDown width="10px" height="100%" />
      </TableHeadValue>
      <TableHeadValue value="Kode" />
      <TableHeadValue value="Email" />
      <TableHeadValue value="Telepon" />
      <TableHeadValue value="Layanan" />
      <TableHeadValue value="Tipe Layanan" />
      <TableHeadValue value="Tanggal Reservasi">
        <ChevronDown width="10px" height="100%" />
      </TableHeadValue>
      <TableHeadValue value="Jam Reservasi">
        <ChevronDown width="10px" height="100%" />
      </TableHeadValue>
      <TableHeadValue value="Cabang" position="end" />
    </TableRow>
  );

  useEffect(() => {
    const fetchData = async (page, limit) => {
      try {
        setIsLoading(true);
        const offset = (page - 1) * limit;
        const data = await fetchDataList(offset, limit, "viewreservation");

        setReserveData(data.data);
        setFilteredData(data.data);
        setTotalPages(data.TTLPage);
      } catch (error) {
        console.error("Error fetching user data:", error);
        showNotifications("danger", "Error fetching user data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData(currentPage, limit);
  }, [currentPage, limit]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchAllDataList("searchcustomer");
        setAllData(data);
      } catch (error) {
        showNotifications("danger", "Error fetching user data.");
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    setIsDataShown(filteredData.length > 0);
  }, [filteredData]);

  useEffect(() => {
    const fetchHours = async () => {
      try {
        const data = await fetchHoursList();
        setHours(data);
      } catch (error) {
        showNotifications("danger", "Error fetching hours data.");
      }
    };

    fetchHours();
  }, []);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const data = await fetchAllDataList("searchservice");
        setServiceData(data);
        setSubServiceData(data);
      } catch (error) {
        showNotifications("danger", "Error fetching sub service data.");
      }
    };

    fetchService();
  }, []);

  return (
    <section id={sectionId} className={styles.tabelSection}>
      <b className={styles.tabelSectionTitle}>Data Reservasi</b>
      <div className={styles.tabelSectionNav}>
        <InputWrapper>
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
        {filteredData.map((reserve, index) => (
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
                  openEdit(
                    reserve.idreservation,
                    reserve.name,
                    reserve.phone,
                    reserve.email,
                    reserve.service,
                    reserve.typeservice,
                    reserve.reservationdate,
                    reserve.reservationtime
                  )
                }
              >
                <EditIcon width="12px" height="100%" />
              </SecondaryButton>
              <SecondaryButton
                variant="icon"
                subVariant="hollow"
                onClick={() => handleSubmitDelete(reserve.idreservation)}
              >
                <TrashIcon
                  width="20px"
                  height="100%"
                  color="var(--color-red)"
                />
              </SecondaryButton>
            </TableBodyValue>
            <TableBodyValue value={reserve.name} />
            <TableBodyValue value={reserve.rscode} />
            <TableBodyValue value={reserve.email} />
            <TableBodyValue value={reserve.phone} />
            <TableBodyValue value={reserve.service} />
            <TableBodyValue value={reserve.typeservice} />
            <TableBodyValue value={reserve.reservationdate} />
            <TableBodyValue value={reserve.reservationtime} />
            <TableBodyValue
              value={sessionStorage.getItem("outletName")}
              position="end"
            />
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
          formTitle="Tambah Reservasi"
          onClose={closeForm}
          onSubmit={handleSubmit}
          saveText="Simpan"
          cancelText="Batal"
          loading={isLoading}
        >
          <InputWrapper>
            <UserInput
              id="user-phone"
              subVariant="label"
              labelText="Nomor Telepon"
              placeholder="0882xxx"
              type="text"
              name="phone"
              value={inputData.phone}
              onChange={handleInputChange}
              error={errors.phone}
              info={
                custExist
                  ? "Existing Customer, Name and Email will auto-fill."
                  : ""
              }
            />
          </InputWrapper>
          <InputWrapper>
            <UserInput
              id="user-name"
              subVariant={custExist ? "readonly" : "label"}
              labelText="Nama Pelanggan"
              placeholder="John Doe"
              type="text"
              name="name"
              value={inputData.name}
              onChange={handleInputChange}
              error={errors.name}
            />
            <UserInput
              id="user-email"
              subVariant={custExist ? "readonly" : "label"}
              labelText="Email"
              placeholder="customer@gmail.com"
              type="email"
              name="email"
              value={inputData.email}
              onChange={handleInputChange}
              error={errors.email}
            />
          </InputWrapper>
          <InputWrapper>
            <UserInput
              variant="select"
              id="service"
              subVariant="label"
              labelText="Nama Layanan"
              name="service"
              value={inputData.service}
              onChange={handleInputChange}
              error={errors.service}
            >
              <option value="">Pilih layanan</option>
              {Array.isArray(serviceData) &&
                serviceData.map((service) => (
                  <option
                    key={service["Nama Layanan"].idservice}
                    value={service["Nama Layanan"].servicename}
                  >
                    {service["Nama Layanan"].servicename}
                  </option>
                ))}
            </UserInput>
            <UserInput
              variant="select"
              id="service-type"
              subVariant="label"
              labelText="Tipe Layanan"
              name="typeservice"
              value={inputData.typeservice}
              onChange={handleInputChange}
              error={errors.typeservice}
            >
              {inputData.service ? (
                <Fragment>
                  <option value="">Pilih tipe layanan</option>
                  {Array.isArray(subServiceData) &&
                    subServiceData.map((subservice) => (
                      <option
                        key={subservice.idservicetype}
                        value={subservice.servicetypename}
                      >
                        {subservice.servicetypename}
                      </option>
                    ))}
                </Fragment>
              ) : (
                <option value="">Mohon pilih layanan dahulu</option>
              )}
            </UserInput>
          </InputWrapper>
          <InputWrapper>
            <UserInput
              id="date"
              subVariant="label"
              labelText="Tanggal Reservasi"
              placeholder="Atur tanggal"
              type="date"
              name="reservationdate"
              value={inputData.reservationdate}
              onChange={handleInputChange}
              error={errors.reservationdate}
              min={getCurrentDate()}
            />
            <UserInput
              variant="select"
              id="time"
              subVariant="label"
              labelText="Jam Reservasi"
              name="reservationtime"
              value={inputData.reservationtime}
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
          onClose={closeEdit}
          onSubmit={handleSubmitEdit}
          saveText="Simpan Perubahan"
          cancelText="Batal"
          loading={isLoading}
        >
          <InputWrapper>
            <UserInput
              id="edit-user-phone"
              subVariant="readonly"
              labelText="Nomor Telepon"
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
              id="edit-user-name"
              subVariant="readonly"
              labelText="Nama Pelanggan"
              placeholder="John Doe"
              type="text"
              name="name"
              value={currentData.name}
              onChange={handleInputEditChange}
              error={errors.name}
            />
            <UserInput
              id="edit-user-email"
              subVariant="readonly"
              labelText="Email"
              placeholder="customer@gmail.com"
              type="email"
              name="email"
              value={currentData.email}
              onChange={handleInputEditChange}
              error={errors.email}
            />
          </InputWrapper>
          <InputWrapper>
            <UserInput
              variant="select"
              id="edit-service"
              subVariant="label"
              labelText="Nama Layanan"
              name="service"
              value={currentData.service}
              onChange={handleInputEditChange}
              error={errors.service}
            >
              <option value="">Pilih layanan</option>
              {Array.isArray(serviceData) &&
                serviceData.map((service) => (
                  <option
                    key={service["Nama Layanan"].idservice}
                    value={service["Nama Layanan"].servicename}
                  >
                    {service["Nama Layanan"].servicename}
                  </option>
                ))}
            </UserInput>
            <UserInput
              variant="select"
              id="edit-service-type"
              subVariant="label"
              labelText="Tipe Layanan"
              name="typeservice"
              value={currentData.typeservice}
              onChange={handleInputEditChange}
              error={errors.typeservice}
            >
              {currentData.service ? (
                <Fragment>
                  <option value="">Pilih tipe layanan</option>
                  {Array.isArray(subServiceData) &&
                    subServiceData.map((subservice, index) => (
                      <option key={index} value={subservice.servicetypename}>
                        {subservice.servicetypename}
                      </option>
                    ))}
                </Fragment>
              ) : (
                <option value="">Mohon pilih layanan dahulu</option>
              )}
            </UserInput>
          </InputWrapper>
          <InputWrapper>
            <UserInput
              id="edit-date"
              subVariant="label"
              labelText="Tanggal Reservasi"
              placeholder="Atur tanggal"
              type="date"
              name="reservationdate"
              value={currentData.reservationdate}
              onChange={handleInputEditChange}
              error={errors.reservationdate}
            />
            <UserInput
              variant="select"
              id="edit-time"
              subVariant="label"
              labelText="Jam Reservasi"
              name="reservationtime"
              value={currentData.reservationtime}
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
