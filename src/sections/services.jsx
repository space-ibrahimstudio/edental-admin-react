import React, { useState, useEffect, Fragment } from "react";
import { Input } from "@ibrahimstudio/input";
import { Button } from "@ibrahimstudio/button";
import { formatDate } from "@ibrahimstudio/function";
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
import { InputWrapper } from "../components/user-input/inputs";
import { PlusIcon, EditIcon, TrashIcon } from "../components/layout/icons";
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
  const [isFetching, setIsFetching] = useState(false);
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
    setInputData((prevState) => ({
      ...prevState,
      subService: prevState.subService.map((item, idx) =>
        idx === index ? { ...item, [name]: value } : item
      ),
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      subService: prevErrors.subService.map((error, idx) =>
        idx === index ? { ...error, [name]: "" } : error
      ),
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
      subService: [
        ...prevErrors.subService,
        { id: "", servicetype: "", price: "" },
      ],
    }));
  };

  const handleRemoveRow = (index) => {
    const updatedSubService = [...inputData.subService];
    const updatedError = [...errors.subService];
    updatedSubService.splice(index, 1);
    updatedError.splice(index, 1);

    setInputData((prevState) => ({
      ...prevState,
      subService: updatedSubService,
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      subService: updatedError,
    }));
  };

  const handleSubmit = async (e) => {
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

    if (isConfirmed) {
      try {
        setIsLoading(true);
        await handleCUDService(inputData);
        showNotifications(
          "success",
          "Selamat! Data Layanan baru berhasil ditambahkan."
        );

        const offset = (currentPage - 1) * limit;
        const data = await fetchDataList(offset, limit, "viewservice");

        if (data && data.data && data.data.length > 0) {
          setServiceData(data.data);
          setFilteredData(data.data);
          setTotalPages(data.TTLPage);
          setIsDataShown(true);
        } else {
          setServiceData([]);
          setFilteredData([]);
          setTotalPages(0);
          setIsDataShown(false);
        }
        closeForm();
      } catch (error) {
        console.error("Error occurred during submit service:", error);
        showNotifications(
          "danger",
          "Gagal menambahkan data. Mohon periksa koneksi internet anda dan muat ulang halaman."
        );
      } finally {
        setIsLoading(false);
      }
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

  const handleSubmitEdit = async (e) => {
    e.preventDefault();

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

    if (isConfirmed) {
      try {
        setIsLoading(true);
        await handleCUDService(currentData, "edit", selectedData);
        showNotifications(
          "success",
          "Selamat! Data Layanan berhasil diperbarui."
        );

        const offset = (currentPage - 1) * limit;
        const data = await fetchDataList(offset, limit, "viewservice");

        if (data && data.data && data.data.length > 0) {
          setServiceData(data.data);
          setFilteredData(data.data);
          setTotalPages(data.TTLPage);
          setIsDataShown(true);
        } else {
          setServiceData([]);
          setFilteredData([]);
          setTotalPages(0);
          setIsDataShown(false);
        }
        closeEdit();
      } catch (error) {
        console.error("Error editing service data:", error);
        showNotifications(
          "danger",
          "Gagal menyimpan perubahan. Mohon periksa koneksi internet anda dan muat ulang halaman."
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSubmitDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Apakah anda yakin untuk menghapus data?"
    );
    if (confirmDelete) {
      try {
        await handleCUDService("", "delete", id);
        showNotifications(
          "success",
          "Selamat! Data yang anda pilih berhasil dihapus."
        );

        const offset = (currentPage - 1) * limit;
        const data = await fetchDataList(offset, limit, "viewservice");

        if (data && data.data && data.data.length > 0) {
          setServiceData(data.data);
          setFilteredData(data.data);
          setTotalPages(data.TTLPage);
          setIsDataShown(true);
        } else {
          setServiceData([]);
          setFilteredData([]);
          setTotalPages(0);
          setIsDataShown(false);
        }

        setServiceData(
          serviceData.filter((service) => service.idservice !== id)
        );
      } catch (error) {
        console.error("Error deleting service:", error);
        showNotifications(
          "danger",
          "Gagal menghapus data. Mohon periksa koneksi internet anda dan muat ulang halaman."
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
      <TableHeadValue value="Tanggal Dibuat" />
      <TableHeadValue value="Terakhir Diupdate" />
      <TableHeadValue value="Status" position="end" />
    </TableRow>
  );

  useEffect(() => {
    const fetchData = async (page, limit) => {
      try {
        setIsFetching(true);
        const offset = (page - 1) * limit;
        const data = await fetchDataList(offset, limit, "viewservice");

        if (data && data.data && data.data.length > 0) {
          setServiceData(data.data);
          setFilteredData(data.data);
          setTotalPages(data.TTLPage);
          setIsDataShown(true);
        } else {
          setServiceData([]);
          setFilteredData([]);
          setTotalPages(0);
          setIsDataShown(false);
        }
      } catch (error) {
        console.error("Error fetching service data:", error);
        showNotifications(
          "danger",
          "Gagal menampilkan data Layanan. Mohon periksa koneksi internet anda dan muat ulang halaman."
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
      <b className={styles.tabelSectionTitle}>Layanan</b>
      <div className={styles.tabelSectionNav}>
        <InputWrapper>
          <SearchInput
            id={`search-data-${sectionId}`}
            placeholder="Cari data ..."
            property="servicename"
            userData={serviceData}
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
        {filteredData.map((service, index) => (
          <TableRow
            type="expand"
            key={index}
            isEven={index % 2 === 0}
            isClickable={true}
            expanded={
              <Fragment>
                {service["Jenis Layanan"].map((subService, index) => (
                  <InputWrapper width="100%" key={index}>
                    <Input
                      id={`service-type-name-${index}`}
                      labelText="Jenis Layanan"
                      value={subService.servicetypename}
                      isReadonly
                    />
                    <Input
                      id={`service-type-price-${index}`}
                      labelText="Harga"
                      value={subService.serviceprice}
                      isReadonly
                    />
                    <Input
                      id={`service-type-status-${index}`}
                      labelText="Status"
                      value={subService.servicetypestatus}
                      isReadonly
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
                  <Button
                    id={`edit-data-${index}`}
                    size="sm"
                    radius="full"
                    buttonText="Edit"
                    startContent={<EditIcon width="12px" height="100%" />}
                    onClick={() =>
                      openEdit(
                        service["Nama Layanan"].idservice,
                        service["Nama Layanan"].servicename,
                        service["Jenis Layanan"]
                      )
                    }
                  />
                  <Button
                    id={`delete-data-${index}`}
                    size="sm"
                    radius="full"
                    color="var(--color-red)"
                    variant="dashed"
                    buttonText="Hapus"
                    startContent={<TrashIcon width="12px" height="100%" />}
                    onClick={() =>
                      handleSubmitDelete(service["Nama Layanan"].idservice)
                    }
                  />
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
            <TableBodyValue
              value={formatDate(service["Nama Layanan"].servicecreate, "en-gb")}
            />
            <TableBodyValue
              value={formatDate(service["Nama Layanan"].serviceupdate, "en-gb")}
            />
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
          formTitle="Tambah Data Layanan"
          onClose={closeForm}
          onSubmit={handleSubmit}
          saveText="Simpan"
          cancelText="Batal"
          loading={isLoading}
        >
          <InputWrapper>
            <Input
              id="service-name"
              labelText="Nama Layanan"
              placeholder="Masukkan nama layanan"
              type="text"
              name="service"
              value={inputData.service}
              onChange={handleInputChange}
              errorContent={errors.service}
              isRequired
            />
          </InputWrapper>
          {inputData.subService.map((subService, index) => (
            <InputWrapper key={index}>
              <Input
                id={`service-type-name-${index}`}
                labelText="Jenis Layanan"
                placeholder="e.g. Scaling gigi"
                type="text"
                name="servicetype"
                value={subService.servicetype}
                onChange={(e) => handleRowChange(index, e)}
                errorContent={errors.subService[index].servicetype}
                isRequired
              />
              <Input
                id={`service-type-price-${index}`}
                labelText="Atur Harga"
                placeholder="Masukkan harga"
                type="number"
                name="price"
                value={subService.price}
                onChange={(e) => handleRowChange(index, e)}
                errorContent={errors.subService[index].price}
                isRequired
              />
              {index <= 0 ? (
                <Button
                  id={`delete-row-${index}`}
                  variant="dashed"
                  subVariant="icon"
                  size="sm"
                  radius="full"
                  color="var(--color-red-30)"
                  isTooltip
                  tooltipText="Hapus"
                  iconContent={<TrashIcon width="15px" height="100%" />}
                  isDisabled
                />
              ) : (
                <Button
                  id={`delete-row-${index}`}
                  variant="dashed"
                  subVariant="icon"
                  size="sm"
                  radius="full"
                  color="var(--color-red)"
                  isTooltip
                  tooltipText="Hapus"
                  iconContent={<TrashIcon width="15px" height="100%" />}
                  onClick={() => handleRemoveRow(index)}
                />
              )}
            </InputWrapper>
          ))}
          <Button
            id="add-new-row"
            variant="hollow"
            size="sm"
            radius="full"
            color="var(--color-semidarkblue)"
            buttonText="Tambah Jenis Layanan"
            startContent={<PlusIcon width="15px" height="100%" />}
            onClick={handleAddRow}
          />
        </SubmitForm>
      )}
      {isEditOpen && (
        <SubmitForm
          formTitle="Edit Data Layanan"
          onClose={closeEdit}
          onSubmit={handleSubmitEdit}
          saveText="Simpan Perubahan"
          cancelText="Batal"
          loading={isLoading}
        >
          <InputWrapper>
            <Input
              id="edit-service-name"
              labelText="Nama Layanan"
              placeholder="Masukkan nama layanan"
              type="text"
              name="service"
              value={currentData.service}
              onChange={handleInputEditChange}
              errorContent={errors.service}
              isRequired
            />
          </InputWrapper>
          {currentData.subService.map((subService, index) => (
            <InputWrapper key={index}>
              <Input
                id={`edit-service-type-name-${index}`}
                labelText="Jenis Layanan"
                placeholder="e.g. Scaling gigi"
                type="text"
                name="servicetype"
                value={subService.servicetype}
                onChange={(e) => handleRowEditChange(index, e)}
                errorContent={
                  errors.subService[index]
                    ? errors.subService[index].servicetype
                    : ""
                }
                isRequired
              />
              <Input
                id={`edit-service-type-price-${index}`}
                labelText="Atur Harga"
                placeholder="Masukkan Harga"
                type="number"
                name="price"
                value={subService.price}
                onChange={(e) => handleRowEditChange(index, e)}
                errorContent={
                  errors.subService[index] ? errors.subService[index].price : ""
                }
                isRequired
              />
              {index <= 0 ? (
                <Button
                  id={`edit-delete-row-${index}`}
                  variant="dashed"
                  subVariant="icon"
                  size="sm"
                  radius="full"
                  color="var(--color-red-30)"
                  isTooltip
                  tooltipText="Hapus"
                  iconContent={<TrashIcon width="15px" height="100%" />}
                  isDisabled
                />
              ) : (
                <Button
                  id={`edit-delete-row-${index}`}
                  variant="dashed"
                  subVariant="icon"
                  size="sm"
                  radius="full"
                  color="var(--color-red)"
                  isTooltip
                  tooltipText="Hapus"
                  iconContent={<TrashIcon width="15px" height="100%" />}
                  onClick={() => handleRemoveEditRow(index)}
                />
              )}
            </InputWrapper>
          ))}
          <Button
            id="edit-add-new-row"
            variant="hollow"
            size="sm"
            radius="full"
            color="var(--color-semidarkblue)"
            buttonText="Tambah Jenis Layanan"
            startContent={<PlusIcon width="15px" height="100%" />}
            onClick={handleAddEditRow}
          />
        </SubmitForm>
      )}
    </section>
  );
};
