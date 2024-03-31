import React, { useState, useEffect } from "react";
import { Fragment } from "../components/tools/controller";
import { fetchDataList, fetchAllDataList } from "../components/tools/data";
import { handleCUDOrder } from "../components/tools/handler";
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
import {
  ChevronDown,
  PlusIcon,
  EditIcon,
  TrashIcon,
} from "../components/layout/icons";
import { PrimButton, SecondaryButton } from "../components/user-input/buttons";
import { PaginationV2 } from "../components/navigator/paginationv2";
import styles from "./styles/tabel-section.module.css";

export const Order = ({ sectionId }) => {
  const { showNotifications } = useNotifications();
  // data state
  const [orderData, setOrderData] = useState([]);
  const [serviceData, setServiceData] = useState([]);
  const [subServiceData, setSubServiceData] = useState([]);
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
    layanan: [{ service: "", servicetype: "", price: "" }],
  });
  const [currentData, setCurrentData] = useState({
    layanan: [{ service: "", servicetype: "", price: "" }],
  });
  const [errors, setErrors] = useState({
    layanan: [{ service: "", servicetype: "", price: "" }],
  });
  const cleanInput = () => {
    setInputData({
      layanan: [{ service: "", servicetype: "", price: "" }],
    });
    setCurrentData({
      layanan: [{ service: "", servicetype: "", price: "" }],
    });
    setErrors({
      layanan: [{ service: "", servicetype: "", price: "" }],
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

  const handleInputChange = (index, e) => {
    const { name, value } = e.target;
    setInputData((prevState) => ({
      ...prevState,
      layanan: prevState.layanan.map((item, idx) =>
        idx === index ? { ...item, [name]: value } : item
      ),
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      layanan: prevErrors.layanan.map((error, idx) =>
        idx === index ? { ...error, [name]: "" } : error
      ),
    }));

    const selectedService = serviceData.find(
      (service) => service["Nama Layanan"].servicename === value
    );

    if (selectedService) {
      setSubServiceData(selectedService["Jenis Layanan"]);
    }
  };

  const handleAddRow = () => {
    setInputData((prevState) => ({
      ...prevState,
      layanan: [
        ...prevState.layanan,
        { service: "", servicetype: "", price: "" },
      ],
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      layanan: [
        ...prevErrors.layanan,
        { service: "", servicetype: "", price: "" },
      ],
    }));
  };

  const handleRemoveRow = (index) => {
    const updatedService = [...inputData.layanan];
    updatedService.splice(index, 1);

    setInputData((prevState) => ({
      ...prevState,
      layanan: updatedService,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isFieldEmpty = inputData.layanan.some(
      (service) =>
        service.service.trim() === "" ||
        service.servicetype.trim() === "" ||
        service.price.trim() === ""
    );

    if (isFieldEmpty) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        layanan: inputData.layanan.map((service) => ({
          service:
            service.service.trim() === "" ? "Layanan tidak boleh kosong" : "",
          servicetype:
            service.servicetype.trim() === ""
              ? "Jenis Layanan tidak boleh kosong"
              : "",
          price:
            service.price.trim() === ""
              ? "Harga Layanan tidak boleh kosong"
              : "",
        })),
      }));
      return;
    }

    const isConfirmed = window.confirm(
      "Apakah anda yakin untuk menambahkan data?"
    );

    if (isConfirmed) {
      try {
        setIsLoading(true);
        await handleCUDOrder(inputData);
        showNotifications(
          "success",
          "Selamat! Data Order baru berhasil ditambahkan."
        );

        const offset = (currentPage - 1) * limit;
        const data = await fetchDataList(offset, limit, "vieworder");

        if (data && data.data && data.data.length > 0) {
          setOrderData(data.data);
          setFilteredData(data.data);
          setTotalPages(data.TTLPage);
          setIsDataShown(true);
        } else {
          setOrderData([]);
          setFilteredData([]);
          setTotalPages(0);
          setIsDataShown(false);
        }
        closeForm();
      } catch (error) {
        console.error("Error occurred during submit order:", error);
        showNotifications(
          "danger",
          "Gagal menambahkan data Order. Mohon periksa koneksi internet anda dan muat ulang halaman."
        );
      } finally {
        setIsLoading(false);
      }
    }
  };
  // end add data function
  // start edit/delete data function
  const openEdit = (id, jenisLayanan) => {
    setSelectedData(id);
    setCurrentData({
      layanan: jenisLayanan.map(({ service, servicetype, price }) => ({
        service: service,
        servicetype: servicetype,
        price: price,
      })),
    });
    setIsEditOpen(true);
  };
  const closeEdit = () => {
    cleanInput();
    setIsEditOpen(false);
    setSelectedData(null);
  };

  const handleRowEditChange = (index, e) => {
    const { name, value } = e.target;
    const updatedService = [...currentData.layanan];
    updatedService[index][name] = value;

    setCurrentData((prevState) => ({
      ...prevState,
      layanan: updatedService,
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      layanan: [
        ...prevErrors.layanan.slice(0, index),
        {
          ...prevErrors.layanan[index],
          service: "",
          servicetype: "",
          price: "",
        },
        ...prevErrors.layanan.slice(index + 1),
      ],
    }));

    const selectedService = serviceData.find(
      (service) => service["Nama Layanan"].servicename === value
    );

    if (selectedService) {
      setSubServiceData(selectedService["Jenis Layanan"]);
    }
  };

  const handleServiceTypeChange = (index, serviceTypeName) => {
    const updatedLayanan = [...currentData.service];
    const selectedServiceType = serviceData.find(
      (type) => type.servicetypename === serviceTypeName
    );
    updatedLayanan[index].servicetype = serviceTypeName;
    updatedLayanan[index].price = selectedServiceType
      ? selectedServiceType.serviceprice
      : "";
    setCurrentData({ ...currentData, layanan: updatedLayanan });
  };

  const handleAddEditRow = () => {
    setCurrentData((prevState) => ({
      ...prevState,
      layanan: [
        ...prevState.layanan,
        { service: "", servicetype: "", price: "" },
      ],
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      layanan: [
        ...prevErrors.layanan,
        { service: "", servicetype: "", price: "" },
      ],
    }));
  };

  const handleRemoveEditRow = (index) => {
    const updatedService = [...currentData.layanan];
    updatedService.splice(index, 1);

    setCurrentData((prevState) => ({
      ...prevState,
      layanan: updatedService,
    }));
  };

  const handleSubmitEdit = async () => {
    try {
      const isConfirmed = window.confirm(
        "Apakah anda yakin untuk menyimpan perubahan data?"
      );
      if (!isConfirmed) {
        return;
      }

      setIsLoading(true);
      await handleCUDOrder(currentData, "edit", selectedData);
      showNotifications(
        "success",
        "Selamat! Perubahan data Layanan berhasil disimpan."
      );

      const offset = (currentPage - 1) * limit;
      const data = await fetchDataList(offset, limit, "vieworder");
      setOrderData(data.data);
      setFilteredData(data.data);
      setTotalPages(data.TTLPage);

      closeEdit();
    } catch (error) {
      console.error("Error editing service:", error);
      showNotifications(
        "danger",
        "Gagal memperbarui data Layanan. Mohon periksa koneksi internet anda dan muat ulang halaman."
      );
    } finally {
      setIsLoading(false);
    }
  };
  // end edit/delete data function
  const tableHeadData = (
    <TableRow type="heading">
      <TableHeadValue type="num" value="NO" />
      <TableHeadValue hasIcon="yes" value="Nama Pengguna">
        <ChevronDown width="10px" height="100%" />
      </TableHeadValue>
      <TableHeadValue value="Kode" />
      <TableHeadValue value="Status" />
      <TableHeadValue value="Telepon" />
      <TableHeadValue value="Nomor Invoice" />
      <TableHeadValue value="Tanggal Order" hasIcon="yes">
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
        const data = await fetchDataList(offset, limit, "vieworder");

        if (data && data.data && data.data.length > 0) {
          setOrderData(data.data);
          setFilteredData(data.data);
          setTotalPages(data.TTLPage);
          setIsDataShown(true);
        } else {
          setOrderData([]);
          setFilteredData([]);
          setTotalPages(0);
          setIsDataShown(false);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        showNotifications(
          "danger",
          "Gagal menampilkan data Order. Mohon periksa koneksi internet anda dan muat ulang halaman."
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

  useEffect(() => {
    const fetchService = async () => {
      try {
        const data = await fetchAllDataList("searchservice");
        setServiceData(data);
      } catch (error) {
        showNotifications("danger", "Error fetching sub service data.");
      }
    };

    fetchService();
  }, []);

  return (
    <section id={sectionId} className={styles.tabelSection}>
      <b className={styles.tabelSectionTitle}>Data Order</b>
      <div className={styles.tabelSectionNav}>
        <InputWrapper>
          <SearchInput
            id="search-order"
            placeholder="Search data ..."
            property="transactionname"
            userData={orderData}
            setUserData={setFilteredData}
          />
        </InputWrapper>
        <div className={styles.tabelSectionOption}>
          <InputWrapper>
            <UserInput
              variant="select"
              id="total-order"
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
        {filteredData.map((order, index) => (
          <TableRow
            type="expand"
            key={index}
            isEven={index % 2 === 0}
            expanded={
              <Fragment>
                {order["Detail Transaction"].map((transaction, index) => (
                  <InputWrapper width="100%" key={index}>
                    <UserInput
                      subVariant="readonly"
                      labelText="Nama Layanan"
                      value={transaction.service}
                    />
                    <UserInput
                      subVariant="readonly"
                      labelText="Jenis Layanan"
                      value={transaction.servicetype}
                    />
                    <UserInput
                      subVariant="readonly"
                      labelText="Harga"
                      value={transaction.price}
                    />
                  </InputWrapper>
                ))}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                  }}
                >
                  <SecondaryButton
                    buttonText="Edit Data"
                    iconPosition="start"
                    onClick={() =>
                      openEdit(
                        order["Transaction"].idtransaction,
                        order["Detail Transaction"]
                      )
                    }
                  >
                    <EditIcon width="12px" height="100%" />
                  </SecondaryButton>
                </div>
              </Fragment>
            }
          >
            <TableBodyValue
              type="num"
              value={(currentPage - 1) * limit + index + 1}
            />
            <TableBodyValue value={order["Transaction"].transactionname} />
            <TableBodyValue value={order["Transaction"].rscode} />
            <TableBodyValue value={order["Transaction"].transactionstatus} />
            <TableBodyValue value={order["Transaction"].transactionphone} />
            <TableBodyValue value={order["Transaction"].noinvoice} />
            <TableBodyValue value={order["Transaction"].transactioncreate} />
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
          formTitle="Tambah Data Order"
          onClose={closeForm}
          onSubmit={handleSubmit}
          saveText="Simpan"
          cancelText="Batal"
          loading={isLoading}
        >
          {inputData.layanan.map((service, index) => (
            <InputWrapper key={index}>
              <UserInput
                id={`service-name-${index}`}
                subVariant="label"
                labelText="Jenis Layanan"
                placeholder="e.g Scaling gigi"
                type="text"
                name="servicetype"
                value={service.service}
                onChange={(e) => handleInputChange(index, e)}
                error={errors.layanan[index].service}
              />
              <UserInput
                id={`service-name-${index}`}
                subVariant="label"
                labelText="Jenis Layanan"
                placeholder="e.g Scaling gigi"
                type="text"
                name="servicetype"
                value={service.servicetype}
                onChange={(e) => handleInputChange(index, e)}
                error={errors.layanan[index].servicetype}
              />
              <UserInput
                id={`service-price-${index}`}
                subVariant="label"
                labelText="Atur Harga"
                placeholder="Masukkan Harga"
                type="text"
                name="price"
                value={service.price}
                onChange={(e) => handleInputChange(index, e)}
                error={errors.layanan[index].price}
              />
              {index <= 0 ? (
                <SecondaryButton variant="icon" subVariant="hollow">
                  <TrashIcon
                    width="20px"
                    height="100%"
                    color="var(--color-red-30)"
                  />
                </SecondaryButton>
              ) : (
                <SecondaryButton
                  variant="icon"
                  subVariant="hollow"
                  onClick={() => handleRemoveRow(index)}
                >
                  <TrashIcon
                    width="20px"
                    height="100%"
                    color="var(--color-red)"
                  />
                </SecondaryButton>
              )}
            </InputWrapper>
          ))}
          <SecondaryButton
            iconPosition="start"
            subVariant="hollow"
            buttonText="Tambah Jenis Layanan"
            onClick={handleAddRow}
          >
            <PlusIcon width="15px" height="100%" />
          </SecondaryButton>
        </SubmitForm>
      )}
      {isEditOpen && (
        <SubmitForm
          formTitle="Ubah Data Order"
          onClose={closeEdit}
          onSubmit={handleSubmitEdit}
          saveText="Simpan"
          cancelText="Batal"
          loading={isLoading}
        >
          {currentData.layanan.map((service, index) => (
            <InputWrapper key={index}>
              <UserInput
                id={`edit-service-name-${index}`}
                variant="select"
                subVariant="label"
                labelText="Nama Layanan"
                placeholder="e.g Scaling"
                name="service"
                value={service.service}
                onChange={(e) => handleRowEditChange(index, e)}
                // error={errors.service[index].service}
              >
                <option value="">Pilih layanan</option>
                {serviceData.map((service, i) => (
                  <option key={i} value={service["Nama Layanan"].servicename}>
                    {service["Nama Layanan"].servicename}
                  </option>
                ))}
              </UserInput>
              <UserInput
                id={`edit-service-type-name-${index}`}
                variant="select"
                subVariant="label"
                labelText="Jenis Layanan"
                placeholder="e.g Scaling gigi"
                name="servicetype"
                value={service.servicetype}
                onChange={(e) => handleRowEditChange(index, e)}
                // error={errors.service[index].servicetype}
              >
                <option value="">Pilih tipe layanan</option>
                {subServiceData.map((subservice, i) => (
                  <option key={i} value={subservice.servicetypename}>
                    {subservice.servicetypename}
                  </option>
                ))}
              </UserInput>
              {index <= 0 ? (
                <SecondaryButton variant="icon" subVariant="hollow">
                  <TrashIcon
                    width="20px"
                    height="100%"
                    color="var(--color-red-30)"
                  />
                </SecondaryButton>
              ) : (
                <SecondaryButton
                  variant="icon"
                  subVariant="hollow"
                  onClick={() => handleRemoveEditRow(index)}
                >
                  <TrashIcon
                    width="20px"
                    height="100%"
                    color="var(--color-red)"
                  />
                </SecondaryButton>
              )}
            </InputWrapper>
          ))}
          <SecondaryButton
            iconPosition="start"
            subVariant="hollow"
            buttonText="Tambah Jenis Layanan"
            onClick={handleAddEditRow}
          >
            <PlusIcon width="15px" height="100%" />
          </SecondaryButton>
        </SubmitForm>
      )}
    </section>
  );
};
