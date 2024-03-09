import React, { useState, useEffect } from "react";
import {
  fetchServiceList,
  fetchAllServiceList,
} from "../components/tools/data";
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
import { Pagination } from "../components/navigator/pagination";
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
  const [loadData, setLoadData] = useState(false);
  // perform action state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
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
  const rowsPerPage = limit;
  const startIndex = (currentPage - 1) * rowsPerPage + 1;
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleLimitChange = (event) => {
    setLimit(parseInt(event.target.value, 10));
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
      return {
        ...prevState,
        [name]: value,
      };
    });

    setErrors((prevErrors) => {
      return { ...prevErrors, [name]: "" };
    });

    if (name === "service") {
      let serviceExists = false;

      allData.forEach((item) => {
        if (item.servicename === value) {
          serviceExists = true;
        }
      });

      if (serviceExists) {
        setErrors((prevErrors) => {
          return { ...prevErrors, service: "Service sudah ada" };
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
    e.preventDefault();

    let hasError = false;
    const newErrors = { ...errors };

    if (inputData.service === "") {
      newErrors = "This field is required.";
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    try {
      await handleCUDService(inputData);
      const data = await fetchServiceList(currentPage, limit, setTotalPages);
      setServiceData(data);
      setFilteredData(data);

      closeForm();
    } catch (error) {
      console.error("Error occurred during submit reservation:", error);
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
      let serviceExists = false;

      allData.forEach((item) => {
        if (item.servicename === value) {
          serviceExists = true;
        }
      });

      if (serviceExists) {
        setErrors((prevErrors) => {
          return { ...prevErrors, service: "Service sudah ada" };
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
      subService: {
        ...prevErrors.subService,
        [index]: "",
      },
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
      await handleCUDService(currentData, "edit", selectedData);
      const data = await fetchServiceList(currentPage, limit, setTotalPages);
      setServiceData(data);
      setFilteredData(data);

      closeEdit();
    } catch (error) {
      console.error("Error editing booking:", error);
    }
  };

  const handleSubmitDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this Reservation Data?"
    );
    if (confirmDelete) {
      try {
        await handleCUDService(inputData, "delete", id);

        const data = await fetchServiceList(currentPage, limit, setTotalPages);
        setServiceData(data);
        setFilteredData(data);

        setServiceData(
          serviceData.filter((service) => service.idservice !== id)
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
      <TableHeadValue value="Nama Layanan">
        <ChevronDown width="10px" height="100%" />
      </TableHeadValue>
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
    const fetchData = async () => {
      try {
        setLoadData(true);
        const data = await fetchServiceList(currentPage, limit, setTotalPages);

        setServiceData(data);
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
        const data = await fetchAllServiceList();
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
              subVariant="nolabel"
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
        loading={loadData}
      >
        {filteredData.map((user, index) => (
          <TableRow
            type="expand"
            key={user["Nama Layanan"].idservice}
            isEven={index % 2 === 0}
            expanded={
              <>
                {user["Jenis Layanan"].map((transaction, index) => (
                  <InputWrapper width="100%" key={index}>
                    <UserInput
                      subVariant="readonly"
                      labelText="Nama Jenis Layanan"
                      value={transaction.servicetypename}
                    />
                    <UserInput
                      subVariant="readonly"
                      labelText="Harga"
                      value={transaction.serviceprice}
                    />
                    <UserInput
                      subVariant="readonly"
                      labelText="Status"
                      value={transaction.servicetypestatus}
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
                        user["Nama Layanan"].idservice,
                        user["Nama Layanan"].servicename,
                        user["Jenis Layanan"]
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
                      handleSubmitDelete(user["Nama Layanan"].idservice)
                    }
                  >
                    <TrashIcon
                      width="20px"
                      height="100%"
                      color="var(--color-red)"
                    />
                  </SecondaryButton>
                </div>
              </>
            }
          >
            <TableBodyValue type="num" value={startIndex + index} />
            <TableBodyValue value={user["Nama Layanan"].servicename} />
            <TableBodyValue value={user["Nama Layanan"].servicecreate} />
            <TableBodyValue value={user["Nama Layanan"].serviceupdate} />
            <TableBodyValue
              value={user["Nama Layanan"].servicestatus}
              position="end"
            />
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
          formTitle="Tambah Layanan"
          onClose={closeForm}
          onSubmit={handleSubmit}
          saveText="Simpan"
          cancelText="Batal"
        >
          <InputWrapper>
            <UserInput
              id="service-name"
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
                labelText="Jenis Layanan"
                placeholder="e.g Scaling gigi"
                type="text"
                name="servicetype"
                value={subService.servicetype}
                onChange={(e) => handleRowChange(index, e)}
                error={errors.servicetype}
              />
              <UserInput
                id={`service-price-${index}`}
                labelText="Atur Harga"
                placeholder="Masukkan Harga"
                type="text"
                name="price"
                value={subService.price}
                onChange={(e) => handleRowChange(index, e)}
                error={errors.price}
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
        >
          <InputWrapper>
            <UserInput
              id="edit-service-name"
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
                labelText="Jenis Layanan"
                placeholder="e.g Scaling gigi"
                type="text"
                name="servicetype"
                value={subService.servicetype}
                onChange={(e) => handleRowEditChange(index, e)}
                error={errors.servicetype}
              />
              <UserInput
                id={`edit-service-price-${index}`}
                labelText="Atur Harga"
                placeholder="Masukkan Harga"
                type="text"
                name="price"
                value={subService.price}
                onChange={(e) => handleRowEditChange(index, e)}
                error={errors.servicetype}
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
