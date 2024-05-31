import React, { Fragment, useState, useEffect } from "react";
import { useNavigate, Navigate, useParams } from "react-router-dom";
import { useFormat, useContent, useDevmode } from "@ibrahimstudio/react";
import { Button } from "@ibrahimstudio/button";
import { Input } from "@ibrahimstudio/input";
import { ISTrash } from "@ibrahimstudio/icons";
import { useAuth } from "../libs/securities/auth";
import { useApi } from "../libs/apis/office";
import { useNotifications } from "../components/feedbacks/context/notifications-context";
import { getCurrentDate, getNestedValue, exportToExcel } from "../libs/plugins/controller";
import Pages from "../components/frames/pages";
import { DashboardContainer, DashboardHead, DashboardToolbar, DashboardTool, DashboardBody } from "./overview-dashboard";
import Table, { THead, TBody, TR, TH, TD } from "../components/contents/table";
import { SubmitForm } from "../components/input-controls/forms";
import { InputWrap } from "../components/input-controls/inputs";

const DashboardParamsPage = ({ parent, slug }) => {
  const { params } = useParams();
  const navigate = useNavigate();
  const { toPathname, toTitleCase } = useContent();
  const { log } = useDevmode();
  const { newDate, newPrice } = useFormat();
  const { isLoggedin, secret, cctr } = useAuth();
  const { apiRead, apiCrud } = useApi();
  const { showNotifications } = useNotifications();

  const pageid = parent && slug && params ? `params-${toPathname(parent)}-${toPathname(slug)}-${toPathname(params)}` : "params-dashboard";
  const pagepath = parent && slug && params ? `/${toPathname(parent)}/${toPathname(slug)}/${toPathname(params)}` : "/";

  const [pageTitle, setPageTitle] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [isDataShown, setIsDataShown] = useState(true);
  const [sortOrder, setSortOrder] = useState("asc");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [stockHistoryData, setStockHistoryData] = useState([]);
  const [orderDetailData, setOrderDetailData] = useState([]);
  const [branchDentistData, setBranchDentistData] = useState([]);
  const [fvaListData, setFvaListData] = useState([]);
  const [allServiceData, setAllServiceData] = useState([]);

  const inputSchema = {
    dentist: "",
    bank_code: "",
    layanan: [{ service: "", servicetype: "", price: "" }],
  };

  const errorSchema = {
    dentist: "",
    bank_code: "",
    layanan: [{ service: "", servicetype: "", price: "" }],
  };

  const [inputData, setInputData] = useState({ ...inputSchema });
  const [errors, setErrors] = useState({ ...errorSchema });
  const restoreInputState = () => setErrors({ ...errorSchema });

  const goBack = () => navigate(-1);

  const openEdit = () => setIsEditOpen(true);
  const closeEdit = () => {
    restoreInputState();
    setIsEditOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputData((prevState) => ({ ...prevState, [name]: value }));
    setErrors({ ...errors, [name]: "" });
  };

  const handleStartDateChange = (event) => {
    setStartDate(event.target.value);
  };

  const handleEndDateChange = (event) => {
    setEndDate(event.target.value);
  };

  const handleSortDate = (data, setData, params) => {
    const newData = [...data];
    if (!sortOrder || sortOrder === "desc") {
      newData.sort((a, b) => new Date(getNestedValue(a, params)) - new Date(getNestedValue(b, params)));
      setSortOrder("asc");
    } else {
      newData.sort((a, b) => new Date(getNestedValue(b, params)) - new Date(getNestedValue(a, params)));
      setSortOrder("desc");
    }
    setData(newData);
  };

  const fetchData = async () => {
    // prettier-ignore
    const errormsg = `Terjadi kesalahan saat memuat halaman ${toTitleCase(slug)} ${toTitleCase(params)}. Mohon periksa koneksi internet anda dan coba lagi.`;
    setIsFetching(true);
    const formData = new FormData();
    const addt1FormData = new FormData();
    const addt2FormData = new FormData();
    const addt3FormData = new FormData();
    let data;
    let addt1data;
    let addt2data;
    let addt3data;
    try {
      switch (slug) {
        case "ORDER CUSTOMER":
          formData.append("data", JSON.stringify({ secret, idtransaction: params }));
          data = await apiRead(formData, "office", "viewdetailorder");
          if (data && data.data && data.data.length > 0) {
            setOrderDetailData(data.data);
            setPageTitle("Detail Order");
            setIsDataShown(true);
          } else {
            setOrderDetailData([]);
            setPageTitle("");
            setIsDataShown(false);
          }
          addt1FormData.append("data", JSON.stringify({ secret }));
          addt1data = await apiRead(addt1FormData, "office", "viewlistva");
          const fvadata = addt1data.data.filter((va) => va.is_activated === true);
          if (fvadata && fvadata.length > 0) {
            setFvaListData(fvadata);
          } else {
            setFvaListData([]);
          }
          addt2FormData.append("data", JSON.stringify({ secret, kodeoutlet: cctr }));
          addt2data = await apiRead(addt2FormData, "office", "viewdentistoutlet");
          if (addt2data && addt2data.data && addt2data.data.length > 0) {
            setBranchDentistData(addt2data.data);
          } else {
            setBranchDentistData([]);
          }
          addt3FormData.append("data", JSON.stringify({ secret }));
          addt3data = await apiRead(addt3FormData, "office", "searchservice");
          if (addt3data && addt3data.data && addt3data.data.length > 0) {
            setAllServiceData(addt3data.data);
          } else {
            setAllServiceData([]);
          }
          break;
        default:
          setIsDataShown(false);
          break;
      }
    } catch (error) {
      showNotifications("danger", errormsg);
      console.error(errormsg, error);
    } finally {
      setIsFetching(false);
    }
  };

  const renderContent = () => {
    switch (slug) {
      case "ORDER CUSTOMER":
        const orderStatusAlias = (status) => {
          return status === "1" ? "Completed" : status === "2" ? "Reschedule" : status === "3" ? "Canceled" : "Pending";
        };

        const handleServiceRowChange = (index, e) => {
          const { name, value } = e.target;
          setInputData((prevState) => ({
            ...prevState,
            layanan: prevState.layanan.map((item, idx) => (idx === index ? { ...item, [name]: value } : item)),
          }));

          setErrors((prevErrors) => ({
            ...prevErrors,
            layanan: prevErrors.layanan.map((error, idx) => (idx === index ? { ...error, [name]: "" } : error)),
          }));
        };

        const handleAddRow = () => {
          setInputData((prevState) => ({ ...prevState, layanan: [...prevState.layanan, { servicetype: "", price: "" }] }));
          setErrors((prevErrors) => ({ ...prevErrors, layanan: [...prevErrors.layanan, { servicetype: "", price: "" }] }));
        };

        const handleRemoveRow = (index) => {
          const updatedrow = [...inputData.layanan];
          const updatedrowerror = [...errors.layanan];
          updatedrow.splice(index, 1);
          updatedrowerror.splice(index, 1);

          setInputData((prevState) => ({ ...prevState, layanan: updatedrow }));
          setErrors((prevErrors) => ({ ...prevErrors, layanan: updatedrowerror }));
        };

        return (
          <Fragment>
            <DashboardHead
              title={isFetching ? "Memuat data ..." : pageTitle}
              desc={
                isFetching
                  ? "Memuat detail ..."
                  : `Detail order untuk id #${params}. Klik ikon pada kolom Action untuk memperbarui Layanan, Harga, dan Metode Pembayaran.`
              }
            />
            <DashboardToolbar>
              <DashboardTool>
                <Button id={`${pageid}-back-previous-page`} buttonText="Kembali" radius="full" onClick={goBack} />
              </DashboardTool>
              <DashboardTool>
                <Button
                  id={`export-data-${pageid}`}
                  buttonText="Cetak PDF Invoice"
                  radius="full"
                  bgColor="var(--color-green)"
                  onClick={() => exportToExcel(orderDetailData, "Order Detail", `order_detail_${params}`)}
                />
              </DashboardTool>
            </DashboardToolbar>
            <DashboardBody>
              <Table byNumber isEditable isNoData={!isDataShown} isLoading={isFetching}>
                <THead>
                  <TR>
                    <TH isSorted onSort={() => handleSortDate(orderDetailData, setOrderDetailData, "usercreate")}>
                      Tanggal Dibuat
                    </TH>
                    <TH>Layanan</TH>
                    <TH>Jenis Layanan</TH>
                    <TH>Harga</TH>
                    <TH>Status</TH>
                  </TR>
                </THead>
                <TBody>
                  {orderDetailData.map((data, index) => (
                    <TR key={index} onEdit={openEdit} isWarning={data.transactionstatus === "0"}>
                      <TD>{newDate(data.transactiondetailcreate, "en-gb")}</TD>
                      <TD>{toTitleCase(data.service)}</TD>
                      <TD>{toTitleCase(data.servicetype)}</TD>
                      <TD>{newPrice(data.price)}</TD>
                      <TD>{orderStatusAlias(data.transactionstatus)}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </DashboardBody>
            {isEditOpen && (
              <SubmitForm formTitle="Perbarui Data Order" loading={isSubmitting} onClose={closeEdit} saveText="Simpan Perubahan">
                <InputWrap>
                  <Input
                    id={`${pageid}-dentist`}
                    variant="select"
                    labelText="Pilih Dokter"
                    radius="full"
                    name="dentist"
                    placeholder="Pilih dokter"
                    options={branchDentistData.map((dentist) => ({
                      value: dentist.name_dentist,
                      label: dentist.name_dentist.replace(`${dentist.id_branch} -`, ""),
                    }))}
                    value={inputData.dentist}
                    onSelect={(selectedValue) => handleInputChange({ target: { name: "dentist", value: selectedValue } })}
                    errorContent={errors.dentist}
                    isSearchable
                    isRequired
                  />
                  <Input
                    id={`${pageid}-payments`}
                    variant="select"
                    labelText="Metode Pembayaran"
                    radius="full"
                    name="bank_code"
                    placeholder="Pilih metode pembayaran"
                    options={fvaListData.map((va) => ({ value: va.code, label: va.name }))}
                    value={inputData.bank_code}
                    onSelect={(selectedValue) => handleInputChange({ target: { name: "bank_code", value: selectedValue } })}
                    errorContent={errors.bank_code}
                    isSearchable
                    isRequired
                  />
                </InputWrap>
                {inputData.layanan.map((subservice, index) => (
                  <InputWrap key={index}>
                    <Input
                      id={`${pageid}-name-${index}`}
                      variant="select"
                      labelText="Nama Layanan"
                      placeholder="Pilih Layanan"
                      radius="full"
                      name="service"
                      options={allServiceData.map((service) => ({
                        value: service["Nama Layanan"].servicename,
                        label: service["Nama Layanan"].servicename,
                      }))}
                      value={subservice.service}
                      onSelect={(selectedValue) => handleServiceRowChange(index, { target: { name: "service", value: selectedValue } })}
                      errorContent={errors.layanan[index].service}
                      isSearchable
                      isRequired
                    />
                    <Input
                      id={`${pageid}-type-name-${index}`}
                      variant="select"
                      labelText="Jenis Layanan"
                      placeholder={subservice.service ? "Pilih jenis layanan" : "Mohon pilih layanan dahulu"}
                      radius="full"
                      name="servicetype"
                      value={subservice.servicetype}
                      options={
                        inputData.layanan[index].service &&
                        allServiceData
                          .find((s) => s["Nama Layanan"].servicename === inputData.layanan[index].service)
                          ?.["Jenis Layanan"].map((type) => ({ value: type.servicetypename, label: type.servicetypename }))
                      }
                      errorContent={errors.layanan[index].servicetype}
                      isSearchable
                      isRequired
                      isDisabled={inputData.layanan[index].service ? false : true}
                    />
                    <Input
                      id={`${pageid}-type-price-${index}`}
                      labelText="Atur Harga"
                      placeholder="Masukkan harga"
                      radius="full"
                      type="number"
                      name="price"
                      value={subservice.price}
                      onChange={(e) => handleServiceRowChange(index, e)}
                      errorContent={errors.layanan[index].price}
                      isRequired
                    />
                    <Button
                      id={`${pageid}-delete-row-${index}`}
                      variant="dashed"
                      subVariant="icon"
                      size="sm"
                      radius="full"
                      color={index <= 0 ? "var(--color-red-30)" : "var(--color-red)"}
                      isTooltip
                      tooltipText="Hapus"
                      iconContent={<ISTrash />}
                      isDisabled={index <= 0 ? true : false}
                      onClick={() => handleRemoveRow(index)}
                    />
                  </InputWrap>
                ))}
                <Button
                  id={`${pageid}-add-row`}
                  variant="hollow"
                  size="sm"
                  radius="full"
                  color="var(--color-hint)"
                  buttonText="Tambah Layanan"
                  onClick={handleAddRow}
                />
              </SubmitForm>
            )}
          </Fragment>
        );
      default:
        return;
    }
  };

  useEffect(() => {
    fetchData();
  }, [slug, params]);

  if (!isLoggedin) {
    return <Navigate to="/login" />;
  }

  return (
    <Pages title={`${pageTitle} - Dashboard`}>
      <DashboardContainer>{renderContent()}</DashboardContainer>
    </Pages>
  );
};

export default DashboardParamsPage;
