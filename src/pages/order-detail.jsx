import React, { useState, useEffect, Fragment } from "react";
import { Button } from "@ibrahimstudio/button";
import { Input } from "@ibrahimstudio/input";
import { formatDate } from "@ibrahimstudio/function";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";
import { handleCUDOrder } from "../components/tools/handler";
import { PageScreen } from "../components/layout/page-screen";
import { Nav } from "../components/navigator/nav";
import { fetchDataList, fetchAllDataList, fetchDentistList } from "../components/tools/data";
import { useNotifications } from "../components/feedback/context/notifications-context";
import { TableData, TableRow, TableHeadValue, TableBodyValue } from "../components/layout/tables";
import { SubmitForm } from "../components/user-input/forms";
import { InputWrapper, SearchInput } from "../components/user-input/inputs";
import { ArrowIcon, TrashIcon, PlusIcon, EditIcon } from "../components/layout/icons";
import styles from "../sections/styles/tabel-section.module.css";

const DetailOrder = () => {
  const navigate = useNavigate();
  const { showNotifications } = useNotifications();
  const { noInvoice } = useParams();
  const [orderDetail, setOrderDetail] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [serviceData, setServiceData] = useState([]);
  const [dentistData, setDentistData] = useState([]);
  const [selectedData, setSelectedData] = useState(null);
  const [isDataShown, setIsDataShown] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const [currentData, setCurrentData] = useState({
    dentist: "",
    layanan: [{ service: "", servicetype: "", price: "" }],
  });
  const [errors, setErrors] = useState({
    dentist: "",
    layanan: [{ service: "", servicetype: "", price: "" }],
  });

  const [inputData, setInputData] = useState({
    dentist: "",
    paymenttype: "",
    paymentstatus: "",
  });
  const [paymentErrors, setPaymentErrors] = useState({
    dentist: "",
    paymenttype: "",
    paymentstatus: "",
  });

  const cleanInput = () => {
    setCurrentData({
      dentist: "",
      layanan: [{ service: "", servicetype: "", price: "" }],
    });
    setErrors({
      dentist: "",
      layanan: [{ service: "", servicetype: "", price: "" }],
    });
    setInputData({
      dentist: "",
      paymenttype: "",
      paymentstatus: "",
    });
    setPaymentErrors({
      dentist: "",
      paymenttype: "",
      paymentstatus: "",
    });
  };

  const goBack = () => {
    sessionStorage.removeItem("orderId");
    navigate(-1);
  };

  const openEdit = (layanan) => {
    setCurrentData({
      layanan: layanan.map((item) => ({ ...item })),
    });
    setIsEditOpen(true);
  };
  const closeEdit = () => {
    cleanInput();
    setIsEditOpen(false);
    setSelectedData(null);
  };

  const openPayment = () => setIsPaymentOpen(true);
  const closePayment = () => {
    cleanInput();
    setIsPaymentOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputData((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    setPaymentErrors({
      ...errors,
      [name]: "",
    });
  };

  const handleInputEditChange = async (index, e) => {
    const { name, value } = e.target;
    setCurrentData((prevState) => ({
      ...prevState,
      [name]: value,
      layanan: prevState.layanan.map((layanan, idx) => (idx === index ? { ...layanan, [name]: value } : layanan)),
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
      layanan: prevErrors.layanan.map((error, idx) => (idx === index ? { ...error, [name]: "" } : error)),
    }));
  };

  const handleAddEditRow = () => {
    setCurrentData((prevState) => ({
      ...prevState,
      layanan: [...prevState.layanan, { service: "", servicetype: "", price: "" }],
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      layanan: [...prevErrors.layanan, { service: "", servicetype: "", price: "" }],
    }));
  };

  const handleRemoveEditRow = (index) => {
    const updatedLayanan = [...currentData.layanan];
    updatedLayanan.splice(index, 1);

    setCurrentData((prevState) => ({
      ...prevState,
      layanan: updatedLayanan,
    }));
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();

    const isFieldEmpty = currentData.layanan.some(
      (layananDetail) => layananDetail.service.trim() === "" || layananDetail.servicetype.trim() === "" || layananDetail.price.trim() === ""
    );

    if (isFieldEmpty) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        layanan: currentData.layanan.map((layananDetail) => ({
          service: layananDetail.service.trim() === "" ? "Nama Layanan tidak boleh kosong" : "",
          servicetype: layananDetail.servicetype.trim() === "" ? "Jenis Layanan tidak boleh kosong" : "",
          price: layananDetail.price.trim() === "" ? "Harga tidak boleh kosong" : "",
        })),
      }));
      return;
    }

    const isConfirmed = window.confirm("Apakah anda yakin untuk menyimpan perubahan data?");

    if (isConfirmed) {
      try {
        setIsLoading(true);
        await handleCUDOrder(currentData, "edit", selectedData);
        showNotifications("success", "Selamat! Data Order berhasil diperbarui.");

        const data = await fetchDataList(0, 500, "vieworder");
        const order = data.data.find((order) => order["Transaction"].noinvoice === noInvoice);
        const orderId = order["Detail Transaction"][0].idtransaction;

        if (order && order["Detail Transaction"].length > 0) {
          setOrderDetail(order["Detail Transaction"]);
          setFilteredData(order["Detail Transaction"]);
          setSelectedData(orderId);
          setIsDataShown(true);
        } else {
          setOrderDetail([]);
          setFilteredData([]);
          setSelectedData(null);
          setIsDataShown(false);
        }
        closeEdit();
      } catch (error) {
        console.error("Error editing order data:", error);
        showNotifications("danger", "Gagal menyimpan perubahan. Mohon periksa koneksi internet anda dan muat ulang halaman.");
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
      <TableHeadValue value="Nama Layanan" />
      <TableHeadValue value="Jenis Layanan" />
      <TableHeadValue value="Harga" />
      <TableHeadValue value="Status" position="end" />
    </TableRow>
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsFetching(true);
        const data = await fetchDataList(0, 500, "vieworder");
        const order = data.data.find((order) => order["Transaction"].noinvoice === noInvoice);
        const orderId = order["Detail Transaction"][0].idtransaction;

        if (order && order["Detail Transaction"].length > 0) {
          setOrderDetail(order["Detail Transaction"]);
          setFilteredData(order["Detail Transaction"]);
          setSelectedData(orderId);
          setIsDataShown(true);
        } else {
          setOrderDetail([]);
          setFilteredData([]);
          setSelectedData(null);
          setIsDataShown(false);
        }
      } catch (error) {
        console.error("Error fetching history stock data:", error);
        showNotifications("danger", "Gagal menampilkan data Detail Order. Mohon periksa koneksi internet anda dan muat ulang halaman.");
      } finally {
        setIsFetching(false);
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
        const outletcode = sessionStorage.getItem("outletCode");
        const data = await fetchDentistList("viewdentistoutlet", outletcode);
        setDentistData(data);
      } catch (error) {
        console.error("Error fetching all dentist data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    setIsDataShown(filteredData.length > 0);
  }, [filteredData]);

  return (
    <PageScreen pageId={`${noInvoice}-history`} variant="section">
      <Helmet>
        <title>Order Detail no.{noInvoice}</title>
      </Helmet>
      <Nav />
      <section className={styles.tabelSection}>
        <b className={styles.tabelSectionTitle}>Order Detail for #{noInvoice}</b>
        <div className={styles.tabelSectionNav}>
          <InputWrapper>
            <Button
              id={`${noInvoice}-back-previous-page`}
              buttonText="Kembali"
              radius="full"
              startContent={<ArrowIcon direction="left" width="17px" height="100%" />}
              onClick={goBack}
            />
            <SearchInput
              id={`search-data-${noInvoice}`}
              placeholder="Cari data ..."
              property="service"
              userData={orderDetail}
              setUserData={setFilteredData}
            />
          </InputWrapper>
          <InputWrapper>
            <Button
              id={`edit-order-data-${noInvoice}`}
              buttonText="Edit Data"
              radius="full"
              startContent={<EditIcon direction="left" width="17px" height="100%" />}
              onClick={() => openEdit(orderDetail)}
            />
            <Button
              id={`process-payment-${noInvoice}`}
              buttonText="Proses Pembayaran"
              radius="full"
              bgColor="var(--color-green)"
              onClick={openPayment}
            />
          </InputWrapper>
        </div>
        <TableData headerData={tableHeadData} loading={isFetching} dataShown={isDataShown}>
          {orderDetail.map((detail, index) => (
            <TableRow key={index} isEven={index % 2 === 0}>
              <TableBodyValue type="num" value={index + 1} />
              <TableBodyValue value={formatDate(detail.transactiondetailcreate, "en-gb")} />
              <TableBodyValue value={detail.service} />
              <TableBodyValue value={detail.servicetype} />
              <TableBodyValue value={detail.price} />
              <TableBodyValue value={detail.transactionstatus} position="end" />
            </TableRow>
          ))}
        </TableData>
        {isEditOpen && (
          <SubmitForm
            formTitle="Edit Data Order"
            onClose={closeEdit}
            onSubmit={handleSubmitEdit}
            saveText="Simpan Perubahan"
            cancelText="Batal"
            loading={isLoading}
          >
            {currentData.layanan.map((detail, index) => (
              <Fragment key={index}>
                <InputWrapper>
                  {Array.isArray(serviceData) && (
                    <Input
                      id={`edit-service-name-${index}`}
                      variant="select"
                      labelText="Nama Layanan"
                      name="service"
                      placeholder="Pilih layanan"
                      options={serviceData.map((service) => ({
                        value: service["Nama Layanan"].servicename,
                        label: service["Nama Layanan"].servicename,
                      }))}
                      value={detail.service}
                      onSelect={(selectedValue) =>
                        handleInputEditChange(index, {
                          target: { name: "service", value: selectedValue },
                        })
                      }
                      errorContent={errors.layanan[index] ? errors.layanan[index].service : ""}
                      isRequired
                      isSearchable
                    />
                  )}
                  {Array.isArray(serviceData) && (
                    <Input
                      id={`edit-service-type-name-${index}`}
                      variant="select"
                      labelText="Jenis Layanan"
                      name="servicetype"
                      placeholder={detail.service ? "Pilih jenis layanan" : "Mohon pilih layanan dahulu"}
                      options={
                        currentData.layanan[index].service &&
                        serviceData
                          .find((s) => s["Nama Layanan"].servicename === currentData.layanan[index].service)
                          ?.["Jenis Layanan"].map((type) => ({
                            value: type.servicetypename,
                            label: type.servicetypename,
                          }))
                      }
                      value={detail.servicetype}
                      onSelect={(selectedValue) =>
                        handleInputEditChange(index, {
                          target: {
                            name: "servicetype",
                            value: selectedValue,
                          },
                        })
                      }
                      errorContent={errors.layanan[index] ? errors.layanan[index].servicetype : ""}
                      isRequired
                      isSearchable
                      isDisabled={currentData.layanan[index].service ? false : true}
                    />
                  )}
                  <Input
                    id={`edit-service-price-${index}`}
                    labelText="Harga"
                    placeholder="Masukkan harga"
                    type="number"
                    name="price"
                    value={detail.price}
                    onChange={(e) => handleInputEditChange(index, e)}
                    errorContent={errors.layanan[index] ? errors.layanan[index].servicetype : ""}
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
              </Fragment>
            ))}
            <Button
              id="edit-add-new-row"
              variant="hollow"
              size="sm"
              radius="full"
              color="var(--color-semidarkblue)"
              buttonText="Tambah Order Item"
              startContent={<PlusIcon width="15px" height="100%" />}
              onClick={handleAddEditRow}
            />
          </SubmitForm>
        )}
        {isPaymentOpen && (
          <SubmitForm formTitle="Pembayaran" onClose={closePayment} saveText="Proses Pembayaran" cancelText="Batal" loading={isLoading}>
            <InputWrapper>
              {Array.isArray(dentistData) && (
                <Input
                  id="edit-service-dentist"
                  variant="select"
                  labelText="Nama Dokter"
                  name="dentist"
                  placeholder="Pilih Dokter"
                  options={dentistData.map((dentist) => ({
                    value: dentist.name_dentist,
                    label: dentist.name_dentist,
                  }))}
                  value={inputData.dentist}
                  onSelect={(selectedValue) =>
                    handleInputChange({
                      target: { name: "dentist", value: selectedValue },
                    })
                  }
                  errorContent={paymentErrors.dentist}
                  isRequired
                  isSearchable
                />
              )}
              <Input
                id="edit-service-payment"
                labelText="Tipe Pembayaran"
                placeholder="Masukkan tipe pembayaran"
                type="text"
                name="paymenttype"
                value={inputData.paymenttype}
                onChange={handleInputChange}
                errorContent={paymentErrors.paymenttype}
                isRequired
              />
              <Input
                id="edit-service-status"
                labelText="Status Pembayaran"
                placeholder="Masukkan status pembayaran"
                type="text"
                name="paymentstatus"
                value={inputData.paymentstatus}
                onChange={handleInputChange}
                errorContent={paymentErrors.paymentstatus}
                isRequired
              />
            </InputWrapper>
          </SubmitForm>
        )}
      </section>
    </PageScreen>
  );
};

export default DetailOrder;
