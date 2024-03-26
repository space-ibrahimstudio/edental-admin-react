import React, { useState, useEffect } from "react";
import { Fragment } from "../components/tools/controller";
import { fetchDataList, fetchAllDataList } from "../components/tools/data";
import { handleCUDService } from "../components/tools/handler";
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

export const Services = ({ sectionId }) => {
  const { showNotifications } = useNotifications();
  // data state
  const [serviceData, setServiceData] = useState([]);
  const [allData, setAllData] = useState([]);
  const [selectedData, setSelectedData] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  // conditional context
  const [isDataShown, setIsDataShown] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  // perform action state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  // input state
  const [inputData, setInputData] = useState({
    service: "",
    subService: [{ id: "", servicetype: "", price: "" }],
  });
  const [currentData, setCurrentData] = useState({
    service: "",
    subService: [{ id: "", servicetype: "", price: "" }],
  });
  const [errors, setErrors] = useState({
    service: "",
    subService: [{ id: "", servicetype: "", price: "" }],
  });
  const cleanInput = () => {
    setInputData({
      service: "",
      subService: [{ id: "", servicetype: "", price: "" }],
    });
    setCurrentData({
      service: "",
      subService: [{ id: "", servicetype: "", price: "" }],
    });
    setErrors({
      service: "",
      subService: [{ id: "", servicetype: "", price: "" }],
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

    if (name === "service") {
      const lowercaseValue = value.toLowerCase();

      let serviceExists = allData.some((item) => {
        const lowercaseServiceName = (
          item["Nama Layanan"] && item["Nama Layanan"].servicename
        ).toLowerCase();
        return lowercaseServiceName === lowercaseValue;
      });

      if (serviceExists) {
        setErrors((prevErrors) => {
          return {
            ...prevErrors,
            service: "Layanan dengan nama yang sama sudah ada.",
          };
        });
      }
    }
  };

  const handleRowChange = (index, e) => {
    const { name, value } = e.target;
    const updatedSubService = [...inputData.subService];
    updatedSubService[index][name] = value;

    setInputData((prevState) => ({
      ...prevState,
      subService: updatedSubService,
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      subService: {
        ...prevErrors.subService,
        [index]: "",
      },
    }));
  };

  const handleAddRow = () => {
    setInputData((prevState) => ({
      ...prevState,
      subService: [
        ...prevState.subService,
        { id: "", servicetype: "", price: "" },
      ],
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      subService: [...prevErrors.subService, { servicetype: "", price: "" }],
    }));
  };

  const handleRemoveRow = (index) => {
    const updatedSubService = [...inputData.subService];
    updatedSubService.splice(index, 1);

    setInputData((prevState) => ({
      ...prevState,
      subService: updatedSubService,
    }));
  };

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();

      if (errors.service !== "") {
        return;
      }

      const isSubServiceEmpty = inputData.subService.some(
        (subService) =>
          subService.servicetype.trim() === "" || subService.price.trim() === ""
      );

      if (inputData.service.trim() === "" || isSubServiceEmpty) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          service:
            inputData.service.trim() === ""
              ? "Nama Layanan tidak boleh kosong"
              : "",
          subService: inputData.subService.map((subService) => ({
            servicetype:
              subService.servicetype.trim() === ""
                ? "Jenis Layanan tidak boleh kosong"
                : "",
            price:
              subService.price.trim() === ""
                ? "Harga Layanan tidak boleh kosong"
                : "",
          })),
        }));
        return;
      }

      const isConfirmed = window.confirm(
        "Apakah anda yakin untuk menambahkan data?"
      );
      if (!isConfirmed) {
        return;
      }

      setIsLoading(true);
      await handleCUDService(inputData);
      showNotifications(
        "success",
        "Selamat! Data Layanan baru berhasil ditambahkan."
      );

      const offset = (currentPage - 1) * limit;
      const data = await fetchDataList(offset, limit, "viewservice");
      setServiceData(data.data);
      setFilteredData(data.data);
      setTotalPages(data.TTLPage);

      closeForm();
    } catch (error) {
      console.error("Error occurred during submit service:", error);
      showNotifications(
        "danger",
        "Gagal menambahkan data Layanan. Mohon periksa koneksi internet anda dan muat ulang halaman."
      );
    } finally {
      setIsLoading(false);
    }
  };
  // end add data function
  // start edit/delete data function
  const openEdit = (id, service, jenisLayanan) => {
    setSelectedData(id);
    setCurrentData({
      service,
      subService: jenisLayanan.map(
        ({ idservicetype, servicetypename, serviceprice }) => ({
          id: idservicetype,
          servicetype: servicetypename,
          price: serviceprice,
        })
      ),
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

    setCurrentData((prevState) => {
      return { ...prevState, [name]: value };
    });

    setErrors((prevErrors) => {
      return { ...prevErrors, [name]: "" };
    });

    if (name === "service") {
      const lowercaseValue = value.toLowerCase();

      let serviceExists = allData.some((item) => {
        const lowercaseServiceName = (
          (item["Nama Layanan"] && item["Nama Layanan"].servicename) ||
          ""
        ).toLowerCase();
        return (
          lowercaseServiceName === lowercaseValue &&
          item["Nama Layanan"].idservice !== selectedData
        );
      });

      if (serviceExists) {
        setErrors((prevErrors) => {
          return {
            ...prevErrors,
            service: "Layanan dengan nama yang sama sudah ada.",
          };
        });
      }
    }
  };

  const handleRowEditChange = (index, e) => {
    const { name, value } = e.target;
    const updatedSubService = [...currentData.subService];
    updatedSubService[index][name] = value;

    setCurrentData((prevState) => ({
      ...prevState,
      subService: updatedSubService,
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      subService: [
        ...prevErrors.subService.slice(0, index),
        { ...prevErrors.subService[index], servicetype: "" },
        ...prevErrors.subService.slice(index + 1),
      ],
    }));
  };

  const handleAddEditRow = () => {
    setCurrentData((prevState) => ({
      ...prevState,
      subService: [
        ...prevState.subService,
        { id: "", servicetype: "", price: "" },
      ],
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      subService: [...prevErrors.subService, { servicetype: "", price: "" }],
    }));
  };

  const handleRemoveEditRow = (index) => {
    const updatedSubService = [...currentData.subService];
    updatedSubService.splice(index, 1);

    setCurrentData((prevState) => ({
      ...prevState,
      subService: updatedSubService,
    }));
  };

  const handleSubmitEdit = async () => {
    try {
      if (errors.service !== "") {
        return;
      }

      const isSubServiceEmpty = currentData.subService.some(
        (subService) =>
          subService.servicetype.trim() === "" || subService.price.trim() === ""
      );
      if (currentData.service.trim() === "" || isSubServiceEmpty) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          service:
            currentData.service.trim() === ""
              ? "Nama Layanan tidak boleh kosong"
              : "",
          subService: currentData.subService.map((subService) => ({
            servicetype:
              subService.servicetype.trim() === ""
                ? "Jenis Layanan tidak boleh kosong"
                : "",
            price:
              subService.price.trim() === ""
                ? "Harga Layanan tidak boleh kosong"
                : "",
          })),
        }));
        return;
      }

      const isConfirmed = window.confirm(
        "Apakah anda yakin untuk menyimpan perubahan data?"
      );
      if (!isConfirmed) {
        return;
      }

      setIsLoading(true);
      await handleCUDService(currentData, "edit", selectedData);
      showNotifications(
        "success",
        "Selamat! Perubahan data Layanan berhasil disimpan."
      );

      const offset = (currentPage - 1) * limit;
      const data = await fetchDataList(offset, limit, "viewservice");
      setServiceData(data.data);
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

  const handleSubmitDelete = async (id) => {
    const confirmDelete = window.confirm("Yakin untuk menghapus data?");
    if (confirmDelete) {
      try {
        await handleCUDService("", "delete", id);
        showNotifications(
          "success",
          "Selamat! Data Layanan yang anda pilih berhasil dihapus."
        );

        const offset = (currentPage - 1) * limit;
        const data = await fetchDataList(offset, limit, "viewservice");
        setServiceData(data.data);
        setFilteredData(data.data);
        setTotalPages(data.TTLPage);

        setServiceData(
          serviceData.filter((service) => service.idservice !== id)
        );
      } catch (error) {
        console.error("Error deleting service:", error);
        showNotifications(
          "danger",
          "Gagal menghapus data Layanan. Mohon periksa koneksi internet anda dan muat ulang halaman."
        );
      }
    }
  };
  // end edit/delete data function
  const tableHeadData = (
    <TableRow type="heading">
      <TableHeadValue value="NO" type="num" />
      <TableHeadValue value="Nama Layanan" />
      <TableHeadValue value="ID Layanan" />
      <TableHeadValue value="Tanggal Dibuat">
        <ChevronDown width="10px" height="100%" />
      </TableHeadValue>
      <TableHeadValue value="Terakhir Diupdate">
        <ChevronDown width="10px" height="100%" />
      </TableHeadValue>
      <TableHeadValue value="Status" position="end" />
    </TableRow>
  );

  useEffect(() => {
    const fetchData = async (page, limit) => {
      try {
        setIsLoading(true);
        const offset = (page - 1) * limit;
        const data = await fetchDataList(offset, limit, "viewservice");

        setServiceData(data.data);
        setFilteredData(data.data);
        setTotalPages(data.TTLPage);
      } catch (error) {
        console.error("Error fetching service data:", error);
        showNotifications(
          "danger",
          "Gagal menampilkan data Layanan. Mohon periksa koneksi internet anda dan muat ulang halaman."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData(currentPage, limit);
  }, [currentPage, limit]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchAllDataList("searchservice");
        setAllData(data);
      } catch (error) {
        console.error("Error fetching all service data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    setIsDataShown(filteredData.length > 0);
  }, [filteredData]);

  return (
    <section id={sectionId} className={styles.tabelSection}>
      <b className={styles.tabelSectionTitle}>Nama Layanan</b>
      <div className={styles.tabelSectionNav}>
        <InputWrapper>
          <SearchInput
            id="search-services"
            placeholder="Search by name ..."
            property="servicename"
            userData={serviceData}
            setUserData={setFilteredData}
          />
        </InputWrapper>
        <div className={styles.tabelSectionOption}>
          <InputWrapper>
            <UserInput
              variant="select"
              id="total-services"
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
        {filteredData.map((service, index) => (
          <TableRow
            type="expand"
            key={index}
            isEven={index % 2 === 0}
            expanded={
              <Fragment>
                {service["Jenis Layanan"].map((subService, index) => (
                  <InputWrapper width="100%" key={index}>
                    <UserInput
                      subVariant="readonly"
                      labelText="Nama Jenis Layanan"
                      value={subService.servicetypename}
                    />
                    <UserInput
                      subVariant="readonly"
                      labelText="Harga"
                      value={subService.serviceprice}
                    />
                    <UserInput
                      subVariant="readonly"
                      labelText="Status"
                      value={subService.servicetypestatus}
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
                        service["Nama Layanan"].idservice,
                        service["Nama Layanan"].servicename,
                        service["Jenis Layanan"]
                      )
                    }
                  >
                    <EditIcon width="12px" height="100%" />
                  </SecondaryButton>
                  <SecondaryButton
                    buttonText="Hapus Data"
                    iconPosition="start"
                    subVariant="hollow"
                    onClick={() =>
                      handleSubmitDelete(service["Nama Layanan"].idservice)
                    }
                  >
                    <TrashIcon
                      width="20px"
                      height="100%"
                      color="var(--color-red)"
                    />
                  </SecondaryButton>
                </div>
              </Fragment>
            }
          >
            <TableBodyValue
              type="num"
              value={(currentPage - 1) * limit + index + 1}
            />
            <TableBodyValue value={service["Nama Layanan"].servicename} />
            <TableBodyValue value={service["Nama Layanan"].idservice} />
            <TableBodyValue value={service["Nama Layanan"].servicecreate} />
            <TableBodyValue value={service["Nama Layanan"].serviceupdate} />
            <TableBodyValue
              value={service["Nama Layanan"].servicestatus}
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
          formTitle="Tambah Layanan"
          onClose={closeForm}
          onSubmit={handleSubmit}
          saveText="Simpan"
          cancelText="Batal"
          loading={isLoading}
        >
          <InputWrapper>
            <UserInput
              id="service-name"
              subVariant="label"
              labelText="Nama Layanan"
              placeholder="Masukkan nama layanan"
              type="text"
              name="service"
              value={inputData.service}
              onChange={handleInputChange}
              error={errors.service}
            />
          </InputWrapper>
          {inputData.subService.map((subService, index) => (
            <InputWrapper key={index}>
              <UserInput
                id={`service-name-${index}`}
                subVariant="label"
                labelText="Jenis Layanan"
                placeholder="e.g Scaling gigi"
                type="text"
                name="servicetype"
                value={subService.servicetype}
                onChange={(e) => handleRowChange(index, e)}
                error={errors.subService[index].servicetype}
              />
              <UserInput
                id={`service-price-${index}`}
                subVariant="label"
                labelText="Atur Harga"
                placeholder="Masukkan Harga"
                type="text"
                name="price"
                value={subService.price}
                onChange={(e) => handleRowChange(index, e)}
                error={errors.subService[index].price}
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
          formTitle="Edit Layanan"
          onClose={closeEdit}
          onSubmit={handleSubmitEdit}
          saveText="Simpan Perubahan"
          cancelText="Batal"
          loading={isLoading}
        >
          <InputWrapper>
            <UserInput
              id="edit-service-name"
              subVariant="label"
              labelText="Nama Layanan"
              placeholder="Masukkan nama layanan"
              type="text"
              name="service"
              value={currentData.service}
              onChange={handleInputEditChange}
              error={errors.service}
            />
          </InputWrapper>
          {currentData.subService.map((subService, index) => (
            <InputWrapper key={index}>
              <UserInput
                id={`edit-service-name-${index}`}
                subVariant="label"
                labelText="Jenis Layanan"
                placeholder="e.g Scaling gigi"
                type="text"
                name="servicetype"
                value={subService.servicetype}
                onChange={(e) => handleRowEditChange(index, e)}
                error={
                  errors.subService[index]
                    ? errors.subService[index].servicetype
                    : ""
                }
              />
              <UserInput
                id={`edit-service-price-${index}`}
                subVariant="label"
                labelText="Atur Harga"
                placeholder="Masukkan Harga"
                type="text"
                name="price"
                value={subService.price}
                onChange={(e) => handleRowEditChange(index, e)}
                error={
                  errors.subService[index] ? errors.subService[index].price : ""
                }
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
