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
  });
  const [currentData, setCurrentData] = useState({
    service: "",
    subService: "",
    subServicePrice: "",
  });
  const [inputRows, setInputRows] = useState([
    { id: 1, subService: "", subServicePrice: "" },
  ]);
  const [errors, setErrors] = useState({
    service: "",
    subService: "",
    subServicePrice: "",
  });
  const cleanInput = () => {
    setInputData({
      service: "",
      layanan: "",
      price: "",
    });
    setErrors({
      service: "",
      layanan: "",
      price: "",
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
    setErrors({
      ...errors,
      [name]: "",
    });

    setInputData({
      ...inputData,
      [name]: value,
    });

    if (name === "service") {
      let serviceExists = false;

      allData.forEach((item) => {
        if (item.servicename === value) {
          serviceExists = true;
        }
      });

      if (serviceExists) {
        setErrors({
          service: "Service sudah ada",
        });
      }
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

    if (inputData.service.trim() !== "") {
      let serviceExists = false;
      allData.forEach((item) => {
        if (item.servicename === inputData.service) {
          serviceExists = true;
        }
      });

      if (serviceExists) {
        newErrors.service = "Service sudah ada";
        hasError = true;
      }
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    try {
      await handleCUDService(inputData.service, inputRows);

      const data = await fetchServiceList(currentPage, limit, setTotalPages);
      setServiceData(data);
      setFilteredData(data);

      closeForm();
    } catch (error) {
      console.error("Error occurred during submit reservation:", error);
    }
  };

  const addRow = () => {
    const newRow = {
      id: inputRows.length + 1,
      subService: "",
      subServicePrice: "",
    };
    setInputRows([...inputRows, newRow]);
  };

  const removeRow = (idToRemove) => {
    const updatedRows = inputRows.filter((row) => row.id !== idToRemove);
    setInputRows(updatedRows);
  };

  const handleRowChange = (id, e) => {
    const { name, value } = e.target;
    const updatedRows = inputRows.map((row) =>
      row.id === id ? { ...row, [name]: value } : row
    );
    setInputRows(updatedRows);
  };
  // end add data function
  // start edit/delete data function
  const openEdit = (id, service, subService, subServicePrice) => {
    setSelectedData(id);
    setCurrentData({
      service,
      subService,
      subServicePrice,
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

    if (name === "service") {
      let serviceExists = false;

      allData.forEach((item) => {
        if (item.servicename === value) {
          serviceExists = true;
        }
      });

      if (serviceExists) {
        setErrors({
          service: "Service sudah ada",
        });
      }
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

    if (currentData.service.trim() !== "") {
      let serviceExists = false;
      allData.forEach((item) => {
        if (item.servicename === currentData.service) {
          serviceExists = true;
        }
      });

      if (serviceExists) {
        newErrors.service = "Service sudah ada";
        hasError = true;
      }
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    try {
      await handleCUDService(
        currentData.service,
        currentData.subService,
        currentData.subServicePrice,
        "edit",
        selectedData
      );
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
        await handleCUDService("", "", "delete", id);

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
      <TableHeadValue value="Status" />
      <TableHeadValue value="Action" type="atn" position="end" />
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
          <TableRow key={user.idservice}>
            <TableBodyValue type="num" value={startIndex + index} />
            <TableBodyValue value={user.servicename} />
            <TableBodyValue value={user.servicecreate} />
            <TableBodyValue value={user.serviceupdate} />
            <TableBodyValue value={user.servicestatus} />
            <TableBodyValue type="atn" position="end">
              <SecondaryButton
                buttonText="Edit"
                iconPosition="start"
                onClick={() => openEdit(user.idservice, user.servicename)}
              >
                <EditIcon width="12px" height="100%" />
              </SecondaryButton>
              <SecondaryButton
                variant="icon"
                subVariant="hollow"
                onClick={() => handleSubmitDelete(user.idservice)}
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
          {inputRows.map((row, index) => (
            <InputWrapper key={row.id}>
              <UserInput
                id={`service-type-name-${row.id}`}
                labelText="Jenis Layanan"
                placeholder="e.g Scaling gigi"
                type="text"
                name="subService"
                value={row.subService}
                onChange={(e) => handleRowChange(row.id, e)}
                error={errors.subService}
              />
              <UserInput
                id={`service-type-price-${row.id}`}
                labelText="Atur Harga"
                placeholder="Masukkan Harga"
                type="text"
                name="subServicePrice"
                value={row.subServicePrice}
                onChange={(e) => handleRowChange(row.id, e)}
                error={errors.subServicePrice}
              />
              {index > 0 && (
                <SecondaryButton
                  variant="icon"
                  subVariant="hollow"
                  onClick={() => removeRow(row.id)}
                >
                  <TrashIcon
                    width="20px"
                    height="100%"
                    color="var(--color-red)"
                  />
                </SecondaryButton>
              )}
              {index === inputRows.length - 1 && (
                <SecondaryButton
                  variant="icon"
                  subVariant="hollow"
                  onClick={addRow}
                >
                  <PlusIcon
                    width="20px"
                    height="100%"
                    color="var(--color-semidarkblue)"
                  />
                </SecondaryButton>
              )}
            </InputWrapper>
          ))}
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
          <InputWrapper>
            <UserInput
              id="edit-service-type-name"
              labelText="Jenis Layanan"
              placeholder="e.g Scaling gigi"
              type="text"
              name="subService"
              value={currentData.subService}
              onChange={handleInputEditChange}
              error={errors.subService}
            />
            <UserInput
              id="edit-service-type-price"
              labelText="Atur Harga"
              placeholder="Masukkan Harga"
              type="text"
              name="subServicePrice"
              value={currentData.subServicePrice}
              onChange={handleInputEditChange}
              error={errors.subServicePrice}
            />
          </InputWrapper>
        </SubmitForm>
      )}
    </section>
  );
};
