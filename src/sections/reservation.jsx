import React, { useState, useEffect } from "react";
import { Button } from "@ibrahimstudio/button";
import { Input } from "@ibrahimstudio/input";
import { formatDate } from "@ibrahimstudio/function";
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
import { InputWrapper } from "../components/user-input/inputs";
import { PlusIcon } from "../components/layout/icons";
import { SearchInput } from "../components/user-input/inputs";
import { PaginationV2 } from "../components/navigator/paginationv2";
import styles from "./styles/tabel-section.module.css";

export const Reservation = ({ sectionId }) => {
  const { showNotifications } = useNotifications();
  // data state
  const [reserveData, setReserveData] = useState([]);
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [serviceData, setServiceData] = useState([]);
  // conditional context
  const [dataExist, setDataExist] = useState(false);
  const [isDataShown, setIsDataShown] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  // perform action state
  const [isFormOpen, setIsFormOpen] = useState(false);
  // input state
  const [hours, setHours] = useState([]);
  const [inputData, setInputData] = useState({
    idservice: "",
    idservicetype: "",
    name: "",
    phone: "",
    email: "",
    service: "",
    typeservice: "",
    reservationdate: "",
    reservationtime: "",
  });
  const [errors, setErrors] = useState({
    idservice: "",
    idservicetype: "",
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
      idservice: "",
      idservicetype: "",
      name: "",
      phone: "",
      email: "",
      service: "",
      typeservice: "",
      reservationdate: "",
      reservationtime: "",
    });
    setErrors({
      idservice: "",
      idservicetype: "",
      name: "",
      phone: "",
      email: "",
      service: "",
      typeservice: "",
      reservationdate: "",
      reservationtime: "",
    });
    setDataExist(false);
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
        setDataExist(true);
        setInputData((prevState) => ({
          ...prevState,
          name: matchedData.username,
          email: matchedData.useremail,
        }));
      } else {
        setDataExist(false);
      }
    }

    if (name === "service") {
      const selectedService = serviceData.find(
        (service) => service["Nama Layanan"].servicename === value
      );

      setInputData({
        ...inputData,
        idservice: selectedService["Nama Layanan"].idservice,
        [name]: value,
      });

      console.log(
        `id service set to ${selectedService["Nama Layanan"].idservice}`
      );
    }

    if (name === "typeservice") {
      const selectedService = serviceData.find(
        (s) => s["Nama Layanan"].servicename === inputData.service
      );
      const selectedSubService = selectedService["Jenis Layanan"].find(
        (type) => type.servicetypename === value
      );

      setInputData({
        ...inputData,
        idservicetype: selectedSubService.idservicetype,
        [name]: value,
      });

      console.log(`id servicetype set to ${selectedSubService.idservicetype}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let hasError = false;
    const newErrors = { ...errors };

    for (const key in inputData) {
      if (inputData[key].trim() === "") {
        newErrors[key] = "Data ini tidak boleh kosong.";
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
        await handleCUDReserve(inputData);
        showNotifications(
          "success",
          "Selamat! Data Reservasi baru berhasil ditambahkan."
        );

        const offset = (currentPage - 1) * limit;
        const data = await fetchDataList(offset, limit, "viewreservation");

        if (data && data.data && data.data.length > 0) {
          setReserveData(data.data);
          setFilteredData(data.data);
          setTotalPages(data.TTLPage);
          setIsDataShown(true);
        } else {
          setReserveData([]);
          setFilteredData([]);
          setTotalPages(0);
          setIsDataShown(false);
        }
        closeForm();
      } catch (error) {
        console.error("Error occurred during submit reservation:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };
  // end add data function
  const tableHeadData = (
    <TableRow type="heading">
      <TableHeadValue value="NO" type="num" />
      <TableHeadValue value="Tanggal Dibuat" />
      <TableHeadValue value="Tanggal Reservasi" />
      <TableHeadValue value="Jam Reservasi" />
      <TableHeadValue value="Kode Reservasi" />
      <TableHeadValue value="Nama Pengguna" />
      <TableHeadValue value="Telepon" />
      <TableHeadValue value="Email" />
      <TableHeadValue value="Layanan" />
      <TableHeadValue value="Jenis Layanan" />
      <TableHeadValue value="Kode Voucher" />
      <TableHeadValue value="Cabang" position="end" />
    </TableRow>
  );

  useEffect(() => {
    const fetchData = async (page, limit) => {
      try {
        setIsFetching(true);
        const offset = (page - 1) * limit;
        const data = await fetchDataList(offset, limit, "viewreservation");

        if (data && data.data && data.data.length > 0) {
          setReserveData(data.data);
          setFilteredData(data.data);
          setTotalPages(data.TTLPage);
          setIsDataShown(true);
        } else {
          setReserveData([]);
          setFilteredData([]);
          setTotalPages(0);
          setIsDataShown(false);
        }
      } catch (error) {
        console.error("Error fetching reservation data:", error);
        showNotifications(
          "danger",
          "Gagal menampilkan data Reservasi. Mohon periksa koneksi internet anda dan muat ulang halaman."
        );
      } finally {
        setIsFetching(false);
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
        console.error("Error fetching all customer data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchAllDataList("searchservice");
        setServiceData(data);
      } catch (error) {
        console.error("Error fetching all service data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchHoursList();
        setHours(data);
      } catch (error) {
        console.error("Error fetching hours data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    setIsDataShown(filteredData.length > 0);
  }, [filteredData]);

  return (
    <section id={sectionId} className={styles.tabelSection}>
      <b className={styles.tabelSectionTitle}>Reservasi</b>
      <div className={styles.tabelSectionNav}>
        <InputWrapper>
          <SearchInput
            id={`search-data-${sectionId}`}
            placeholder="Cari data ..."
            property="name"
            userData={reserveData}
            setUserData={setFilteredData}
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
        {filteredData.map((reserve, index) => (
          <TableRow key={index} isEven={index % 2 === 0}>
            <TableBodyValue
              type="num"
              value={(currentPage - 1) * limit + index + 1}
            />
            <TableBodyValue
              value={formatDate(reserve.datetimecreate, "en-gb")}
            />
            <TableBodyValue value={reserve.reservationdate} />
            <TableBodyValue value={reserve.reservationtime} />
            <TableBodyValue value={reserve.rscode} />
            <TableBodyValue value={reserve.name} />
            <TableBodyValue value={reserve.phone} />
            <TableBodyValue value={reserve.email} />
            <TableBodyValue value={reserve.service} />
            <TableBodyValue value={reserve.typeservice} />
            <TableBodyValue value={reserve.voucher} />
            <TableBodyValue value={reserve.outlet_name} position="end" />
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
          formTitle="Tambah Data Reservasi"
          onClose={closeForm}
          onSubmit={handleSubmit}
          saveText="Simpan"
          cancelText="Batal"
          loading={isLoading}
        >
          <InputWrapper>
            <Input
              id="reservation-user-phone"
              labelText="Nomor Telepon"
              placeholder="0882xxx"
              type="tel"
              name="phone"
              value={inputData.phone}
              onChange={handleInputChange}
              errorContent={errors.phone}
              infoContent={
                dataExist
                  ? "Customer sudah terdaftar. Nama dan Email otomatis terisi."
                  : ""
              }
              isRequired
            />
            <Input
              id="reservation-user-name"
              labelText="Nama Pelanggan"
              placeholder="e.g. John Doe"
              type="text"
              name="name"
              value={inputData.name}
              onChange={handleInputChange}
              errorContent={errors.name}
              isReadonly={dataExist ? true : false}
              isRequired
            />
            <Input
              id="reservation-user-email"
              labelText="Email"
              placeholder="customer@gmail.com"
              type="email"
              name="email"
              value={inputData.email}
              onChange={handleInputChange}
              errorContent={errors.email}
              isReadonly={dataExist ? true : false}
              isRequired
            />
          </InputWrapper>
          <InputWrapper>
            {Array.isArray(serviceData) && (
              <Input
                id="reservation-service"
                variant="select"
                labelText="Nama Layanan"
                name="service"
                placeholder="Pilih layanan"
                options={serviceData.map((service) => ({
                  value: service["Nama Layanan"].servicename,
                  label: service["Nama Layanan"].servicename,
                }))}
                value={inputData.service}
                onSelect={(selectedValue) =>
                  handleInputChange({
                    target: { name: "service", value: selectedValue },
                  })
                }
                errorContent={errors.service}
                isRequired
                isSearchable
              />
            )}
            {Array.isArray(serviceData) && (
              <Input
                id="reservation-typeservice"
                variant="select"
                labelText="Jenis Layanan"
                name="typeservice"
                placeholder={
                  inputData.service
                    ? "Pilih jenis layanan"
                    : "Mohon pilih layanan dahulu"
                }
                options={
                  inputData.service &&
                  serviceData
                    .find(
                      (s) => s["Nama Layanan"].servicename === inputData.service
                    )
                    ?.["Jenis Layanan"].map((type) => ({
                      value: type.servicetypename,
                      label: type.servicetypename,
                    }))
                }
                value={inputData.typeservice}
                onSelect={(selectedValue) =>
                  handleInputChange({
                    target: { name: "typeservice", value: selectedValue },
                  })
                }
                errorContent={errors.typeservice}
                isRequired
                isSearchable
                isDisabled={inputData.service ? false : true}
              />
            )}
          </InputWrapper>
          <InputWrapper>
            <Input
              id="reservation-date"
              labelText="Tanggal Reservasi"
              type="date"
              placeholder="Atur tanggal"
              name="reservationdate"
              min={getCurrentDate()}
              value={inputData.reservationdate}
              onChange={handleInputChange}
              errorContent={errors.reservationdate}
              isRequired
            />
            <Input
              id="reservation-time"
              variant="select"
              labelText="Jam Reservasi"
              name="reservationtime"
              placeholder="Pilih jadwal tersedia"
              options={hours.map((hour) => ({
                value: hour,
                label: hour,
              }))}
              value={inputData.reservationtime}
              onSelect={(selectedValue) =>
                handleInputChange({
                  target: { name: "reservationtime", value: selectedValue },
                })
              }
              errorContent={errors.reservationtime}
              isRequired
              isSearchable
            />
          </InputWrapper>
        </SubmitForm>
      )}
    </section>
  );
};
