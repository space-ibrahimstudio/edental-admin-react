import React, { Fragment, useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useContent, useFormat, useDevmode } from "@ibrahimstudio/react";
import { ISTrash } from "@ibrahimstudio/icons";
import { Input } from "@ibrahimstudio/input";
import { Button, ButtonGroup } from "@ibrahimstudio/button";
import { useAuth } from "../libs/securities/auth";
import { useApi } from "../libs/apis/office";
import { useNotifications } from "../components/feedbacks/context/notifications-context";
import { getCurrentDate } from "../libs/plugins/controller";
import Pages from "../components/frames/pages";
import { DashboardContainer, DashboardHead, DashboardToolbar, DashboardTool, DashboardBody } from "./overview-dashboard";
import Table, { THead, TBody, TR, TH, TD } from "../components/contents/table";
import { SubmitForm } from "../components/input-controls/forms";
import { exportToExcel, getNestedValue } from "../libs/plugins/controller";
import { SearchInput, InputWrap } from "../components/input-controls/inputs";
import Pagination from "../components/navigations/pagination";

const DashboardSlugPage = ({ parent, slug }) => {
  const navigate = useNavigate();
  const { newDate, newPrice } = useFormat();
  const { log } = useDevmode();
  const { toTitleCase, toPathname } = useContent();
  const { isLoggedin, secret, cctr } = useAuth();
  const { apiRead, apiCrud } = useApi();
  const { showNotifications } = useNotifications();

  const pageid = parent && slug ? `slug-${toPathname(parent)}-${toPathname(slug)}` : "slug-dashboard";
  const pagetitle = slug ? `${toTitleCase(slug)}` : "Slug Dashboard";
  const pagepath = parent && slug ? `/${toPathname(parent)}/${toPathname(slug)}` : "/";

  const [limit, setLimit] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [isDataShown, setIsDataShown] = useState(true);
  const [sortOrder, setSortOrder] = useState("asc");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [status, setStatus] = useState(0);

  const [allCustData, setAllCustData] = useState([]);
  const [custData, setCustData] = useState([]);
  const [custExist, setCustExist] = useState(false);
  const [allServiceData, setAllServiceData] = useState([]);
  const [serviceData, setServiceData] = useState([]);
  const [branchData, setBranchData] = useState([]);
  const [branchDentistData, setBranchDentistData] = useState([]);
  const [dentistData, setDentistData] = useState([]);
  const [stockData, setStockData] = useState([]);
  const [categoryStockData, setCategoryStockData] = useState([]);
  const [inPOData, setInPOData] = useState([]);
  const [reservData, setReservData] = useState([]);
  const [bookedHoursData, setBookedHoursData] = useState([]);
  const [availHoursData, setAvailHoursData] = useState([]);
  const [fvaListData, setFvaListData] = useState([]);
  const [orderData, setOrderData] = useState([]);

  const inputSchema = {
    name: "",
    phone: "",
    address: "",
    postcode: "",
    main_region: "",
    region: "",
    cctr_group: "",
    cctr: "",
    coordinate: "",
    service: "",
    sub_service: "",
    category: "",
    sub_category: "",
    unit: "",
    count: "",
    value: "",
    id: "",
    email: "",
    vouchercode: "",
    date: `${getCurrentDate()}`,
    time: "",
    price: 100000,
    bank_code: "",
    layanan: [{ servicetype: "", price: "" }],
  };

  const errorSchema = {
    name: "",
    phone: "",
    address: "",
    postcode: "",
    main_region: "",
    region: "",
    cctr_group: "",
    cctr: "",
    coordinate: "",
    service: "",
    sub_service: "",
    category: "",
    sub_category: "",
    unit: "",
    count: "",
    value: "",
    id: "",
    email: "",
    vouchercode: "",
    date: "",
    time: "",
    price: "",
    bank_code: "",
    layanan: [{ servicetype: "", price: "" }],
  };

  const [inputData, setInputData] = useState({ ...inputSchema });
  const [errors, setErrors] = useState({ ...errorSchema });

  const restoreInputState = () => {
    setInputData({ ...inputSchema });
    setErrors({ ...errorSchema });
  };

  const options = [
    { value: 5, label: "Baris per Halaman: 5" },
    { value: 10, label: "Baris per Halaman: 10" },
    { value: 20, label: "Baris per Halaman: 20" },
    { value: 50, label: "Baris per Halaman: 50" },
  ];

  const units = [
    { value: "PCS", label: "pcs" },
    { value: "PACK", label: "pack" },
    { value: "BOTTLE", label: "bottle" },
    { value: "TUBE", label: "tube" },
    { value: "BOX", label: "box" },
    { value: "SET", label: "set" },
  ];

  const postatus = [
    { buttonText: "Open", onClick: () => handleStatusChange(0), isActive: status === 0 },
    { buttonText: "Tertunda", onClick: () => handleStatusChange(1), isActive: status === 1 },
    { buttonText: "Terkirim", onClick: () => handleStatusChange(2), isActive: status === 2 },
    { buttonText: "Selesai", onClick: () => handleStatusChange(3), isActive: status === 3 },
    { buttonText: "Ditolak", onClick: () => handleStatusChange(4), isActive: status === 4 },
  ];

  const hours = [
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

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleLimitChange = (value) => {
    setLimit(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value) => {
    setStatus(value);
    setCurrentPage(1);
  };

  const openForm = () => setIsFormOpen(true);
  const closeForm = () => {
    restoreInputState();
    setIsFormOpen(false);
  };

  const openEdit = (params) => {
    switchData(params);
    setIsEditOpen(true);
  };

  const closeEdit = () => {
    restoreInputState();
    setIsEditOpen(false);
  };

  const openDetail = (params) => {
    navigate(`${pagepath}/${toPathname(params)}`);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputData((prevState) => ({ ...prevState, [name]: value }));
    setErrors({ ...errors, [name]: "" });
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
    const errormsg = `Terjadi kesalahan saat memuat halaman ${toTitleCase(slug)}. Mohon periksa koneksi internet anda dan coba lagi.`;
    setIsFetching(true);
    try {
      const formData = new FormData();
      const addtFormData = new FormData();
      const offset = (currentPage - 1) * limit;
      formData.append("data", JSON.stringify({ secret, limit, hal: offset }));
      let data;
      let addtdata;
      switch (slug) {
        case "DATA CUSTOMER":
          data = await apiRead(formData, "office", "viewcustomer");
          if (data && data.data && data.data.length > 0) {
            setCustData(data.data);
            setTotalPages(data.TTLPage);
            setIsDataShown(true);
          } else {
            setCustData([]);
            setTotalPages(0);
            setIsDataShown(false);
          }
          break;
        case "LAYANAN":
          data = await apiRead(formData, "office", "viewservice");
          if (data && data.data && data.data.length > 0) {
            setServiceData(data.data);
            setTotalPages(data.TTLPage);
            setIsDataShown(true);
          } else {
            setServiceData([]);
            setTotalPages(0);
            setIsDataShown(false);
          }
          addtFormData.append("data", JSON.stringify({ secret }));
          addtdata = await apiRead(addtFormData, "office", "searchservice");
          if (addtdata && addtdata.data && addtdata.data.length > 0) {
            setAllServiceData(addtdata.data);
          } else {
            setAllServiceData([]);
          }
          break;
        case "CABANG EDENTAL":
          data = await apiRead(formData, "office", "viewoutlet");
          if (data && data.data && data.data.length > 0) {
            setBranchData(data.data);
            setTotalPages(data.TTLPage);
            setIsDataShown(true);
          } else {
            setBranchData([]);
            setTotalPages(0);
            setIsDataShown(false);
          }
          break;
        case "DENTIST":
          data = await apiRead(formData, "office", "viewdentist");
          if (data && data.data && data.data.length > 0) {
            setDentistData(data.data);
            setTotalPages(data.TTLPage);
            setIsDataShown(true);
          } else {
            setDentistData([]);
            setTotalPages(0);
            setIsDataShown(false);
          }
          break;
        case "STOCK":
          data = await apiRead(formData, "office", "viewstock");
          if (data && data.data && data.data.length > 0) {
            setStockData(data.data);
            setTotalPages(data.TTLPage);
            setIsDataShown(true);
          } else {
            setStockData([]);
            setTotalPages(0);
            setIsDataShown(false);
          }
          addtFormData.append("data", JSON.stringify({ secret }));
          addtdata = await apiRead(addtFormData, "office", "searchcategorystock");
          if (addtdata && addtdata.data && addtdata.data.length > 0) {
            setCategoryStockData(addtdata.data);
          } else {
            setCategoryStockData([]);
          }
          break;
        case "PO MASUK":
          addtFormData.append("data", JSON.stringify({ secret, limit, hal: offset, status }));
          addtdata = await apiRead(addtFormData, "office", "viewpostock");
          if (addtdata && addtdata.data && addtdata.data.length > 0) {
            setInPOData(addtdata.data);
            setTotalPages(addtdata.TTLPage);
            setIsDataShown(true);
          } else {
            setInPOData([]);
            setTotalPages(0);
            setIsDataShown(false);
          }
          break;
        case "RESERVATION":
          data = await apiRead(formData, "office", "viewreservation");
          if (data && data.data && data.data.length > 0) {
            setReservData(data.data);
            setTotalPages(data.TTLPage);
            setIsDataShown(true);
          } else {
            setReservData([]);
            setTotalPages(0);
            setIsDataShown(false);
          }
          addtFormData.append("data", JSON.stringify({ secret }));
          addtdata = await apiRead(addtFormData, "office", "searchservice");
          if (addtdata && addtdata.data && addtdata.data.length > 0) {
            setAllServiceData(addtdata.data);
          } else {
            setAllServiceData([]);
          }
          const fvadata = await apiRead(addtFormData, "office", "viewlistva");
          const allfvadata = fvadata.data;
          const filteredfvadata = allfvadata.filter((va) => va.is_activated === true);
          if (filteredfvadata && filteredfvadata.length > 0) {
            setFvaListData(filteredfvadata);
          } else {
            setFvaListData([]);
          }
          const allcustdata = await apiRead(addtFormData, "office", "searchcustomer");
          if (allcustdata && allcustdata.data && allcustdata.data.length > 0) {
            setAllCustData(allcustdata.data);
          } else {
            setAllCustData([]);
          }
          break;
        case "ORDER CUSTOMER":
          data = await apiRead(formData, "office", "vieworder");
          if (data && data.data && data.data.length > 0) {
            setOrderData(data.data);
            setTotalPages(data.TTLPage);
            setIsDataShown(true);
          } else {
            setOrderData([]);
            setTotalPages(0);
            setIsDataShown(false);
          }
          addtFormData.append("data", JSON.stringify({ secret, kodeoutlet: cctr }));
          addtdata = await apiRead(addtFormData, "office", "viewdentistoutlet");
          if (addtdata && addtdata.data && addtdata.data.length > 0) {
            setBranchDentistData(addtdata.data);
          } else {
            setBranchDentistData([]);
          }
          break;
        default:
          setFilteredData([]);
          setTotalPages(0);
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

  const switchData = (params) => {
    setSelectedData(params);
    const currentData = (arraydata, identifier) => {
      if (typeof identifier === "string") {
        return arraydata.find((item) => getNestedValue(item, identifier) === params);
      }
      return arraydata.find((item) => item[identifier] === params);
    };
    let switchedData;
    switch (slug) {
      case "LAYANAN":
        switchedData = currentData(serviceData, "Nama Layanan.idservice");
        log(`id ${slug} data switched:`, switchedData["Nama Layanan"].idservice);
        setInputData({
          service: switchedData["Nama Layanan"].servicename,
          layanan: switchedData["Jenis Layanan"].map((subservice) => ({ servicetype: subservice.servicetypename, price: subservice.serviceprice })),
        });
        break;
      case "CABANG EDENTAL":
        switchedData = currentData(branchData, "idoutlet");
        log(`id ${slug} data switched:`, switchedData.idoutlet);
        setInputData({
          name: switchedData.outlet_name,
          phone: switchedData.outlet_phone,
          address: switchedData.outlet_address,
          postcode: switchedData.postcode,
          main_region: switchedData.mainregion,
          region: switchedData.outlet_region,
          cctr_group: switchedData.cctr_group,
          cctr: switchedData.cctr,
          coordinate: switchedData.coordinate,
        });
        break;
      case "RESERVATION":
        switchedData = currentData(reservData, "idreservation");
        log(`id ${slug} data switched:`, switchedData.idreservation);
        const selectedservice = allServiceData.find((s) => s["Nama Layanan"].servicename === switchedData.service);
        const selectedsubservice = selectedservice["Jenis Layanan"].find((type) => type.servicetypename === switchedData.typeservice);
        log("sub_service id found:", selectedsubservice.idservicetype);
        setInputData({
          id: selectedsubservice.idservicetype,
          name: switchedData.name,
          phone: switchedData.phone,
          email: switchedData.email,
          vouchercode: switchedData.voucher,
          service: switchedData.service,
          sub_service: switchedData.typeservice,
          date: switchedData.reservationdate,
          time: switchedData.reservationtime,
          price: switchedData.price_reservation,
          bank_code: switchedData.bank_code,
        });
        break;
      default:
        setSelectedData(null);
        break;
    }
  };

  const handleSubmit = async (e, endpoint) => {
    e.preventDefault();
    const action = e.nativeEvent.submitter.getAttribute("data-action");
    const confirmmsg =
      action === "update"
        ? `Apakah anda yakin untuk menyimpan perubahan pada ${toTitleCase(slug)}?`
        : `Apakah anda yakin untuk menambahkan data baru pada ${toTitleCase(slug)}?`;
    const successmsg =
      action === "update"
        ? `Selamat! Perubahan anda pada ${toTitleCase(slug)} berhasil disimpan.`
        : `Selamat! Data baru berhasil ditambahkan pada ${toTitleCase(slug)}.`;
    const errormsg =
      action === "update"
        ? "Terjadi kesalahan saat menyimpan perubahan. Mohon periksa koneksi internet anda dan coba lagi."
        : "Terjadi kesalahan saat menambahkan data. Mohon periksa koneksi internet anda dan coba lagi.";
    const confirm = window.confirm(confirmmsg);
    if (confirm) {
      setIsSubmitting(true);
      try {
        let submittedData;
        switch (slug) {
          case "LAYANAN":
            submittedData = { secret, service: inputData.service, layanan: inputData.layanan };
            break;
          case "CABANG EDENTAL":
            submittedData = {
              secret,
              region: inputData.region,
              name: inputData.name,
              address: inputData.address,
              phone: inputData.phone,
              mainregion: inputData.main_region,
              postcode: inputData.postcode,
              cctr_group: inputData.cctr_group,
              cctr: inputData.cctr,
              coordinate: inputData.coordinate,
            };
            break;
          case "STOCK":
            submittedData = {
              secret,
              categorystock: inputData.category,
              subcategorystock: inputData.sub_category,
              itemname: inputData.name,
              unit: inputData.unit,
              stockin: inputData.count,
              value: inputData.value,
            };
            break;
          case "RESERVATION":
            submittedData = {
              secret,
              idservicetype: inputData.id,
              name: inputData.name,
              phone: inputData.phone,
              email: inputData.email,
              voucher: inputData.vouchercode,
              service: inputData.service,
              typeservice: inputData.sub_service,
              reservationdate: inputData.date,
              reservationtime: inputData.time,
              price: inputData.price,
              bank_code: inputData.bank_code,
            };
          default:
            break;
        }
        const formData = new FormData();
        formData.append("data", JSON.stringify(submittedData));
        if (action === "update") {
          formData.append("idedit", selectedData);
        }
        await apiCrud(formData, "office", endpoint);
        showNotifications("success", successmsg);
        if (action === "add") {
          closeForm();
        } else {
          closeEdit();
        }
        await fetchData();
      } catch (error) {
        showNotifications("danger", errormsg);
        console.error(errormsg, error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleDelete = async (params, endpoint) => {
    const confirmmsg = `Apakah anda yakin untuk menghapus data terpilih dari ${toTitleCase(slug)}?`;
    const successmsg = `Selamat! Data terpilih dari ${toTitleCase(slug)} berhasil dihapus.`;
    const errormsg = "Terjadi kesalahan saat menghapus data. Mohon periksa koneksi internet anda dan coba lagi.";
    const confirm = window.confirm(confirmmsg);
    if (confirm) {
      try {
        let submittedData;
        switch (slug) {
          case "LAYANAN":
            submittedData = { secret, service: "", layanan: [] };
            break;
          case "CABANG EDENTAL":
            submittedData = {
              secret,
              region: "",
              name: "",
              address: "",
              phone: "",
              mainregion: "",
              postcode: "",
              cctr_group: "",
              cctr: "",
              coordinate: "",
            };
            break;
          default:
            break;
        }
        const formData = new FormData();
        formData.append("data", JSON.stringify(submittedData));
        formData.append("iddelete", params);
        await apiCrud(formData, "office", endpoint);
        showNotifications("success", successmsg);
        await fetchData();
      } catch (error) {
        showNotifications("danger", errormsg);
        console.error(errormsg, error);
      }
    }
  };

  const renderContent = () => {
    switch (slug) {
      case "DATA CUSTOMER":
        return (
          <Fragment>
            <DashboardHead
              title={pagetitle}
              desc="Daftar Customer yang memiliki riwayat Reservasi. Data ini dibuat otomatis saat proses reservasi dilakukan."
            />
            <DashboardToolbar>
              <DashboardTool>
                <SearchInput
                  id={`search-data-${pageid}`}
                  placeholder="Cari data ..."
                  property="username"
                  userData={custData}
                  setUserData={setFilteredData}
                />
              </DashboardTool>
              <DashboardTool>
                <Input
                  id={`limit-data-${pageid}`}
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
                  id={`export-data-${pageid}`}
                  buttonText="Export ke Excel"
                  radius="full"
                  bgColor="var(--color-green)"
                  onClick={() => exportToExcel(custData, "Daftar Customer", "daftar_customer")}
                />
              </DashboardTool>
            </DashboardToolbar>
            <DashboardBody>
              <Table byNumber page={currentPage} limit={limit} isNoData={!isDataShown} isLoading={isFetching}>
                <THead>
                  <TR>
                    <TH isSorted onSort={() => handleSortDate(custData, setCustData, "usercreate")}>
                      Tanggal Bergabung
                    </TH>
                    <TH>Nama Pengguna</TH>
                    <TH>Alamat Email</TH>
                    <TH>Nomor Telepon</TH>
                    <TH>Alamat</TH>
                  </TR>
                </THead>
                <TBody>
                  {custData.map((data, index) => (
                    <TR key={index}>
                      <TD>{newDate(data.usercreate, "en-gb")}</TD>
                      <TD>{toTitleCase(data.username)}</TD>
                      <TD>{data.useremail}</TD>
                      <TD type="number" isCopy>
                        {data.userphone}
                      </TD>
                      <TD>{data.address}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </DashboardBody>
            {isDataShown && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />}
          </Fragment>
        );
      case "MANAJEMEN USER":
        return (
          <Fragment>
            <DashboardHead title={pagetitle} />
            <DashboardToolbar>
              <DashboardTool>
                <SearchInput id={`search-data-${pageid}`} fallbackValue="Cari data ..." isReadonly />
              </DashboardTool>
              <DashboardTool>
                <Input
                  id={`limit-data-${pageid}`}
                  variant="select"
                  radius="full"
                  isLabeled={false}
                  placeholder="Baris per Halaman"
                  value={limit}
                  options={options}
                  onSelect={handleLimitChange}
                  isReadonly={isDataShown ? false : true}
                />
              </DashboardTool>
            </DashboardToolbar>
            <DashboardBody>
              <Table isNoData={true}></Table>
            </DashboardBody>
          </Fragment>
        );
      case "LAYANAN":
        const handleServiceInputChange = (e) => {
          const { name, value } = e.target;
          setInputData((prevState) => {
            return { ...prevState, [name]: value };
          });

          setErrors((prevErrors) => {
            return { ...prevErrors, [name]: "" };
          });

          if (name === "service") {
            const newvalue = value.toLowerCase();
            let serviceexists = allServiceData.some((item) => {
              const servicename = (item["Nama Layanan"] && item["Nama Layanan"].servicename).toLowerCase();
              return servicename === newvalue;
            });

            if (serviceexists) {
              setErrors((prevErrors) => {
                return { ...prevErrors, service: "Layanan dengan nama yang sama sudah ada." };
              });
            }
          }
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
          setInputData((prevState) => ({
            ...prevState,
            layanan: [...prevState.layanan, { servicetype: "", price: "" }],
          }));

          setErrors((prevErrors) => ({
            ...prevErrors,
            layanan: [...prevErrors.layanan, { servicetype: "", price: "" }],
          }));
        };

        const handleRemoveRow = (index) => {
          const updatedrow = [...inputData.layanan];
          const updatedrowerror = [...errors.layanan];
          updatedrow.splice(index, 1);
          updatedrowerror.splice(index, 1);

          setInputData((prevState) => ({
            ...prevState,
            layanan: updatedrow,
          }));

          setErrors((prevErrors) => ({
            ...prevErrors,
            layanan: updatedrowerror,
          }));
        };

        return (
          <Fragment>
            <DashboardHead
              title={pagetitle}
              desc="Daftar layanan yang tersedia saat ini. Klik opsi ikon pada kolom Action untuk melihat detail, memperbarui, atau menghapus data."
            />
            <DashboardToolbar>
              <DashboardTool>
                <SearchInput
                  id={`search-data-${pageid}`}
                  placeholder="Cari data ..."
                  property="servicename"
                  userData={serviceData}
                  setUserData={setFilteredData}
                />
              </DashboardTool>
              <DashboardTool>
                <Input
                  id={`limit-data-${pageid}`}
                  variant="select"
                  radius="full"
                  isLabeled={false}
                  placeholder="Baris per Halaman"
                  value={limit}
                  options={options}
                  onSelect={handleLimitChange}
                  isReadonly={isDataShown ? false : true}
                />
                <Button id={`add-new-data-${pageid}`} buttonText="Tambah Baru" radius="full" onClick={openForm} />
              </DashboardTool>
            </DashboardToolbar>
            <DashboardBody>
              <Table byNumber isExpandable isEditable isDeletable page={currentPage} limit={limit} isNoData={!isDataShown} isLoading={isFetching}>
                <THead>
                  <TR>
                    <TH isSorted onSort={() => handleSortDate(serviceData, setServiceData, "Nama Layanan.servicecreate")}>
                      Tanggal Dibuat
                    </TH>
                    <TH>Nama Layanan</TH>
                    <TH>Nomor ID Layanan</TH>
                    <TH isSorted onSort={() => handleSortDate(serviceData, setServiceData, "Nama Layanan.serviceupdate")}>
                      Terakhir Diperbarui
                    </TH>
                    <TH>Status Layanan</TH>
                  </TR>
                </THead>
                <TBody>
                  {serviceData.map((data, index) => (
                    <TR
                      key={index}
                      expandContent={
                        <Fragment>
                          {data["Jenis Layanan"].map((subdata, idx) => (
                            <InputWrap key={idx}>
                              <Input
                                id={`${pageid}-name-${index}-${idx}`}
                                radius="full"
                                labelText="Jenis Layanan"
                                value={subdata.servicetypename}
                                isReadonly
                              />
                              <Input
                                id={`${pageid}-price-${index}-${idx}`}
                                radius="full"
                                labelText="Harga"
                                value={newPrice(subdata.serviceprice)}
                                isReadonly
                              />
                              <Input
                                id={`${pageid}-status-${index}-${idx}`}
                                radius="full"
                                labelText="Status"
                                value={subdata.servicetypestatus}
                                isReadonly
                              />
                            </InputWrap>
                          ))}
                        </Fragment>
                      }
                      onEdit={() => openEdit(data["Nama Layanan"].idservice)}
                      onDelete={() => handleDelete(data["Nama Layanan"].idservice, "cudservice")}
                    >
                      <TD>{newDate(data["Nama Layanan"].servicecreate, "en-gb")}</TD>
                      <TD>{data["Nama Layanan"].servicename}</TD>
                      <TD type="number">{data["Nama Layanan"].idservice}</TD>
                      <TD>{newDate(data["Nama Layanan"].serviceupdate, "en-gb")}</TD>
                      <TD>{data["Nama Layanan"].servicestatus}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </DashboardBody>
            {isDataShown && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />}
            {isFormOpen && (
              <SubmitForm
                formTitle="Tambah Data Layanan"
                operation="add"
                onSubmit={(e) => handleSubmit(e, "cudservice")}
                loading={isSubmitting}
                onClose={closeForm}
              >
                <Input
                  id={`${pageid}-name`}
                  labelText="Nama Layanan"
                  placeholder="Masukkan nama layanan"
                  radius="full"
                  type="text"
                  name="service"
                  value={inputData.service}
                  onChange={handleServiceInputChange}
                  errorContent={errors.service}
                  isRequired
                />
                {inputData.layanan.map((subservice, index) => (
                  <InputWrap key={index}>
                    <Input
                      id={`${pageid}-type-name-${index}`}
                      labelText="Jenis Layanan"
                      placeholder="e.g. Scaling gigi"
                      radius="full"
                      type="text"
                      name="servicetype"
                      value={subservice.servicetype}
                      onChange={(e) => handleServiceRowChange(index, e)}
                      errorContent={errors.layanan[index].servicetype}
                      isRequired
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
                  buttonText="Tambah Jenis Layanan"
                  onClick={handleAddRow}
                />
              </SubmitForm>
            )}
            {isEditOpen && (
              <SubmitForm
                formTitle="Perbarui Data Layanan"
                operation="update"
                onSubmit={(e) => handleSubmit(e, "cudservice")}
                loading={isSubmitting}
                onClose={closeEdit}
                saveText="Simpan Perubahan"
              >
                <Input
                  id={`edit-${pageid}-name`}
                  labelText="Nama Layanan"
                  placeholder="Masukkan nama layanan"
                  radius="full"
                  type="text"
                  name="service"
                  value={inputData.service}
                  onChange={handleServiceInputChange}
                  errorContent={errors.service}
                  isRequired
                />
                {inputData.layanan.map((subservice, index) => (
                  <InputWrap key={index}>
                    <Input
                      id={`edit-${pageid}-type-name-${index}`}
                      labelText="Jenis Layanan"
                      placeholder="e.g. Scaling gigi"
                      radius="full"
                      type="text"
                      name="servicetype"
                      value={subservice.servicetype}
                      onChange={(e) => handleServiceRowChange(index, e)}
                      errorContent={errors.layanan[index] ? errors.layanan[index].servicetype : ""}
                      isRequired
                    />
                    <Input
                      id={`edit-${pageid}-type-price-${index}`}
                      labelText="Atur Harga"
                      placeholder="Masukkan harga"
                      radius="full"
                      type="number"
                      name="price"
                      value={subservice.price}
                      onChange={(e) => handleServiceRowChange(index, e)}
                      errorContent={errors.layanan[index] ? errors.layanan[index].price : ""}
                      isRequired
                    />
                    <Button
                      id={`edit-${pageid}-delete-row-${index}`}
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
                  id={`edit-${pageid}-add-row`}
                  variant="hollow"
                  size="sm"
                  radius="full"
                  color="var(--color-hint)"
                  buttonText="Tambah Jenis Layanan"
                  onClick={handleAddRow}
                />
              </SubmitForm>
            )}
          </Fragment>
        );
      case "CABANG EDENTAL":
        return (
          <Fragment>
            <DashboardHead title={pagetitle} desc="Daftar Cabang Edental. Klik opsi ikon pada kolom Action untuk memperbarui, atau menghapus data." />
            <DashboardToolbar>
              <DashboardTool>
                <SearchInput
                  id={`search-data-${pageid}`}
                  placeholder="Cari data ..."
                  property="outlet_name"
                  userData={branchData}
                  setUserData={setFilteredData}
                />
              </DashboardTool>
              <DashboardTool>
                <Input
                  id={`limit-data-${pageid}`}
                  variant="select"
                  radius="full"
                  isLabeled={false}
                  placeholder="Baris per Halaman"
                  value={limit}
                  options={options}
                  onSelect={handleLimitChange}
                  isReadonly={isDataShown ? false : true}
                />
                <Button id={`add-new-data-${pageid}`} buttonText="Tambah Baru" radius="full" onClick={openForm} />
                <Button
                  id={`export-data-${pageid}`}
                  buttonText="Export ke Excel"
                  radius="full"
                  bgColor="var(--color-green)"
                  onClick={() => exportToExcel(branchData, "Daftar Cabang", "daftar_cabang")}
                />
              </DashboardTool>
            </DashboardToolbar>
            <DashboardBody>
              <Table byNumber isEditable isDeletable page={currentPage} limit={limit} isNoData={!isDataShown} isLoading={isFetching}>
                <THead>
                  <TR>
                    <TH isSorted onSort={() => handleSortDate(branchData, setBranchData, "outletcreate")}>
                      Tanggal Dibuat
                    </TH>
                    <TH>Nama Cabang</TH>
                    <TH>Alamat Cabang</TH>
                    <TH>Main Region</TH>
                    <TH>Region</TH>
                    <TH>CCTR Group</TH>
                    <TH>CCTR</TH>
                    <TH>Nomor Kontak</TH>
                    <TH>Kode POS</TH>
                    <TH>Titik Koordinat</TH>
                  </TR>
                </THead>
                <TBody>
                  {branchData.map((data, index) => (
                    <TR key={index} onEdit={() => openEdit(data.idoutlet)} onDelete={() => handleDelete(data.idoutlet)}>
                      <TD>{newDate(data.outletcreate, "en-gb")}</TD>
                      <TD>{toTitleCase(data.outlet_name)}</TD>
                      <TD>{toTitleCase(data.outlet_address)}</TD>
                      <TD>{toTitleCase(data.mainregion)}</TD>
                      <TD>{toTitleCase(data.outlet_region)}</TD>
                      <TD type="code">{data.cctr_group}</TD>
                      <TD type="code">{data.cctr}</TD>
                      <TD type="number">{data.outlet_phone}</TD>
                      <TD type="code">{data.postcode}</TD>
                      <TD type="code">{data.coordinate}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </DashboardBody>
            {isDataShown && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />}
            {isFormOpen && (
              <SubmitForm
                formTitle="Tambah Data Cabang"
                operation="add"
                onSubmit={(e) => handleSubmit(e, "cudoutlet")}
                loading={isSubmitting}
                onClose={closeForm}
              >
                <InputWrap>
                  <Input
                    id={`${pageid}-name`}
                    labelText="Nama Outlet"
                    placeholder="Edental Jakarta Pusat"
                    radius="full"
                    type="text"
                    name="name"
                    value={inputData.name}
                    onChange={handleInputChange}
                    errorContent={errors.name}
                    isRequired
                  />
                  <Input
                    id={`${pageid}-phone`}
                    labelText="Nomor Kontak Cabang"
                    placeholder="0882xxx"
                    radius="full"
                    type="tel"
                    name="phone"
                    value={inputData.phone}
                    onChange={handleInputChange}
                    errorContent={errors.phone}
                    isRequired
                  />
                  <Input
                    id={`${pageid}-mainregion`}
                    labelText="Main Region"
                    placeholder="Jawa"
                    radius="full"
                    type="text"
                    name="main_region"
                    value={inputData.main_region}
                    onChange={handleInputChange}
                    errorContent={errors.main_region}
                    isRequired
                  />
                </InputWrap>
                <InputWrap>
                  <Input
                    id={`${pageid}-region`}
                    labelText="Region"
                    placeholder="DKI Jakarta"
                    radius="full"
                    type="text"
                    name="region"
                    value={inputData.region}
                    onChange={handleInputChange}
                    errorContent={errors.region}
                    isRequired
                  />
                  <Input
                    id={`${pageid}-address`}
                    labelText="Alamat Cabang"
                    placeholder="123 Main Street"
                    radius="full"
                    type="text"
                    name="address"
                    value={inputData.address}
                    onChange={handleInputChange}
                    errorContent={errors.address}
                    isRequired
                  />
                  <Input
                    id={`${pageid}-postcode`}
                    labelText="Kode Pos"
                    placeholder="40282"
                    radius="full"
                    type="number"
                    name="postcode"
                    value={inputData.postcode}
                    onChange={handleInputChange}
                    errorContent={errors.postcode}
                    isRequired
                  />
                </InputWrap>
                <InputWrap>
                  <Input
                    id={`${pageid}-coords`}
                    labelText="Titik Koordinat"
                    placeholder="Masukkan titik koordinat"
                    radius="full"
                    type="text"
                    name="coordinate"
                    value={inputData.coordinate}
                    onChange={handleInputChange}
                    errorContent={errors.coordinate}
                    isRequired
                  />
                  <Input
                    id={`${pageid}-cctrgroup`}
                    labelText="CCTR Group"
                    placeholder="Masukkan CCTR group"
                    radius="full"
                    type="text"
                    name="cctr_group"
                    value={inputData.cctr_group}
                    onChange={handleInputChange}
                    errorContent={errors.cctr_group}
                    isRequired
                  />
                  <Input
                    id={`${pageid}-cctr`}
                    labelText="CCTR"
                    placeholder="Masukkan CCTR"
                    radius="full"
                    type="text"
                    name="cctr"
                    value={inputData.cctr}
                    onChange={handleInputChange}
                    errorContent={errors.cctr}
                    isRequired
                  />
                </InputWrap>
              </SubmitForm>
            )}
            {isEditOpen && (
              <SubmitForm
                formTitle="Perbarui Data Cabang"
                operation="update"
                onSubmit={(e) => handleSubmit(e, "cudoutlet")}
                loading={isSubmitting}
                onClose={closeEdit}
                saveText="Simpan Perubahan"
              >
                <InputWrap>
                  <Input
                    id={`edit-${pageid}-name`}
                    labelText="Nama Outlet"
                    placeholder="Edental Jakarta Pusat"
                    radius="full"
                    type="text"
                    name="name"
                    value={inputData.name}
                    onChange={handleInputChange}
                    errorContent={errors.name}
                    isRequired
                  />
                  <Input
                    id={`edit-${pageid}-phone`}
                    labelText="Nomor Kontak Cabang"
                    placeholder="0882xxx"
                    radius="full"
                    type="tel"
                    name="phone"
                    value={inputData.phone}
                    onChange={handleInputChange}
                    errorContent={errors.phone}
                    isRequired
                  />
                  <Input
                    id={`edit-${pageid}-mainregion`}
                    labelText="Main Region"
                    placeholder="Jawa"
                    radius="full"
                    type="text"
                    name="main_region"
                    value={inputData.main_region}
                    onChange={handleInputChange}
                    errorContent={errors.main_region}
                    isRequired
                  />
                </InputWrap>
                <InputWrap>
                  <Input
                    id={`edit-${pageid}-region`}
                    labelText="Region"
                    placeholder="DKI Jakarta"
                    radius="full"
                    type="text"
                    name="region"
                    value={inputData.region}
                    onChange={handleInputChange}
                    errorContent={errors.region}
                    isRequired
                  />
                  <Input
                    id={`edit-${pageid}-address`}
                    labelText="Alamat Cabang"
                    placeholder="123 Main Street"
                    radius="full"
                    type="text"
                    name="address"
                    value={inputData.address}
                    onChange={handleInputChange}
                    errorContent={errors.address}
                    isRequired
                  />
                  <Input
                    id={`edit-${pageid}-postcode`}
                    labelText="Kode Pos"
                    placeholder="40282"
                    radius="full"
                    type="number"
                    name="postcode"
                    value={inputData.postcode}
                    onChange={handleInputChange}
                    errorContent={errors.postcode}
                    isRequired
                  />
                </InputWrap>
                <InputWrap>
                  <Input
                    id={`edit-${pageid}-coords`}
                    labelText="Titik Koordinat"
                    placeholder="Masukkan titik koordinat"
                    radius="full"
                    type="text"
                    name="coordinate"
                    value={inputData.coordinate}
                    onChange={handleInputChange}
                    errorContent={errors.coordinate}
                    isRequired
                  />
                  <Input
                    id={`edit-${pageid}-cctrgroup`}
                    labelText="CCTR Group"
                    placeholder="Masukkan CCTR group"
                    radius="full"
                    type="text"
                    name="cctr_group"
                    value={inputData.cctr_group}
                    onChange={handleInputChange}
                    errorContent={errors.cctr_group}
                    isRequired
                  />
                  <Input
                    id={`edit-${pageid}-cctr`}
                    labelText="CCTR"
                    placeholder="Masukkan CCTR"
                    radius="full"
                    type="text"
                    name="cctr"
                    value={inputData.cctr}
                    onChange={handleInputChange}
                    errorContent={errors.cctr}
                    isRequired
                  />
                </InputWrap>
              </SubmitForm>
            )}
          </Fragment>
        );
      case "DENTIST":
        return (
          <Fragment>
            <DashboardHead title={pagetitle} desc="Daftar Dokter yang bertugas di Edental." />
            <DashboardToolbar>
              <DashboardTool>
                <SearchInput
                  id={`search-data-${pageid}`}
                  placeholder="Cari data ..."
                  property="username"
                  userData={dentistData}
                  setUserData={setFilteredData}
                />
              </DashboardTool>
              <DashboardTool>
                <Input
                  id={`limit-data-${pageid}`}
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
                  id={`export-data-${pageid}`}
                  buttonText="Export ke Excel"
                  radius="full"
                  bgColor="var(--color-green)"
                  onClick={() => exportToExcel(dentistData, "Daftar Dokter", "daftar_dokter")}
                />
              </DashboardTool>
            </DashboardToolbar>
            <DashboardBody>
              <Table byNumber page={currentPage} limit={limit} isNoData={!isDataShown} isLoading={isFetching}>
                <THead>
                  <TR>
                    <TH>Nama Dokter</TH>
                    <TH>Kode Cabang</TH>
                    <TH>Nomor Telepon</TH>
                    <TH>Alamat</TH>
                  </TR>
                </THead>
                <TBody>
                  {dentistData.map((data, index) => (
                    <TR key={index}>
                      <TD>{toTitleCase(data.name_dentist.replace(`${data.id_branch} -`, ""))}</TD>
                      <TD type="code">{data.id_branch}</TD>
                      <TD type="number">{data.phone}</TD>
                      <TD>{data.email}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </DashboardBody>
            {isDataShown && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />}
          </Fragment>
        );
      case "KAS":
        return (
          <Fragment>
            <DashboardHead title={pagetitle} />
            <DashboardToolbar>
              <DashboardTool>
                <SearchInput id={`search-data-${pageid}`} fallbackValue="Cari data ..." isReadonly />
              </DashboardTool>
              <DashboardTool>
                <Input
                  id={`limit-data-${pageid}`}
                  variant="select"
                  radius="full"
                  isLabeled={false}
                  placeholder="Baris per Halaman"
                  value={limit}
                  options={options}
                  onSelect={handleLimitChange}
                  isReadonly={isDataShown ? false : true}
                />
              </DashboardTool>
            </DashboardToolbar>
            <DashboardBody>
              <Table isNoData={true}></Table>
            </DashboardBody>
          </Fragment>
        );
      case "STOCK":
        return (
          <Fragment>
            <DashboardHead
              title={pagetitle}
              desc="Data Stok berdasarkan kategori. Klik baris data untuk melihat masing-masing detail histori stok."
            />
            <DashboardToolbar>
              <DashboardTool>
                <SearchInput
                  id={`search-data-${pageid}`}
                  placeholder="Cari data ..."
                  property="outlet_name"
                  userData={stockData}
                  setUserData={setFilteredData}
                />
              </DashboardTool>
              <DashboardTool>
                <Input
                  id={`limit-data-${pageid}`}
                  variant="select"
                  radius="full"
                  isLabeled={false}
                  placeholder="Baris per Halaman"
                  value={limit}
                  options={options}
                  onSelect={handleLimitChange}
                  isReadonly={isDataShown ? false : true}
                />
                <Button id={`add-new-data-${pageid}`} buttonText="Tambah Baru" radius="full" onClick={openForm} />
                <Button
                  id={`export-data-${pageid}`}
                  buttonText="Export ke Excel"
                  radius="full"
                  bgColor="var(--color-green)"
                  onClick={() => exportToExcel(stockData, "Daftar Stok", "daftar_stok")}
                />
              </DashboardTool>
            </DashboardToolbar>
            <DashboardBody>
              <Table byNumber page={currentPage} limit={limit} isNoData={!isDataShown} isLoading={isFetching}>
                <THead>
                  <TR>
                    <TH isSorted onSort={() => handleSortDate(stockData, setStockData, "stockcreate")}>
                      Tanggal Dibuat
                    </TH>
                    <TH>Kategori</TH>
                    <TH>Sub Kategori</TH>
                    <TH>Kode SKU</TH>
                    <TH>Nama Item</TH>
                    <TH>Unit</TH>
                    <TH>Stok Akhir</TH>
                    <TH>Harga</TH>
                    <TH>Total Nilai</TH>
                    <TH>Nama Cabang</TH>
                  </TR>
                </THead>
                <TBody>
                  {stockData.map((data, index) => (
                    <TR key={index} isClickable onClick={() => openDetail(data.itemname)}>
                      <TD>{newDate(data.stockcreate, "en-gb")}</TD>
                      <TD>{toTitleCase(data.categorystock)}</TD>
                      <TD>{toTitleCase(data.subcategorystock)}</TD>
                      <TD type="code">{data.sku}</TD>
                      <TD>{toTitleCase(data.itemname)}</TD>
                      <TD>{data.unit}</TD>
                      <TD type="number">{data.lastqty}</TD>
                      <TD type="number">{newPrice(data.value)}</TD>
                      <TD type="number">{newPrice(data.totalvalue)}</TD>
                      <TD>{toTitleCase(data.outletname)}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </DashboardBody>
            {isDataShown && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />}
            {isFormOpen && (
              <SubmitForm
                formTitle="Tambah Data Stok"
                operation="add"
                onSubmit={(e) => handleSubmit(e, "cudstock")}
                loading={isSubmitting}
                onClose={closeForm}
              >
                <InputWrap>
                  <Input
                    id={`${pageid}-category`}
                    variant="select"
                    labelText="Kategori"
                    radius="full"
                    name="category"
                    placeholder="Pilih kategori"
                    options={categoryStockData.map((cat) => ({
                      value: cat["category_stok"].categorystockname,
                      label: cat["category_stok"].categorystockname,
                    }))}
                    value={inputData.category}
                    onSelect={(selectedValue) => handleInputChange({ target: { name: "category", value: selectedValue } })}
                    errorContent={errors.category}
                    isRequired
                    isSearchable
                  />
                  <Input
                    id={`${pageid}-subcategory`}
                    variant="select"
                    labelText="Sub Kategori"
                    radius="full"
                    name="sub_category"
                    placeholder={inputData.category ? "Pilih sub kategori" : "Mohon pilih kategori dahulu"}
                    options={
                      inputData.category &&
                      categoryStockData
                        .find((cat) => cat["category_stok"].categorystockname === inputData.category)
                        ?.["subcategory_stok"].map((sub) => ({
                          value: sub.subcategorystock,
                          label: sub.subcategorystock,
                        }))
                    }
                    value={inputData.sub_category}
                    onSelect={(selectedValue) => handleInputChange({ target: { name: "sub_category", value: selectedValue } })}
                    errorContent={errors.sub_category}
                    isRequired
                    isSearchable
                    isDisabled={inputData.category ? false : true}
                  />
                  <Input
                    id={`${pageid}-name`}
                    labelText="Nama Item"
                    placeholder="STERILISATOR"
                    radius="full"
                    type="text"
                    name="item"
                    value={inputData.name}
                    onChange={handleInputChange}
                    errorContent={errors.name}
                    isRequired
                  />
                </InputWrap>
                <InputWrap>
                  <Input
                    id={`${pageid}-unit`}
                    variant="select"
                    labelText="Unit/satuan"
                    placeholder="Pilih satuan/unit"
                    radius="full"
                    name="unit"
                    value={inputData.unit}
                    options={units}
                    onSelect={(selectedValue) => handleInputChange({ target: { name: "unit", value: selectedValue } })}
                    errorContent={errors.unit}
                    isRequired
                  />
                  <Input
                    id={`${pageid}-qty`}
                    labelText="Jumlah"
                    placeholder="40"
                    radius="full"
                    type="number"
                    name="count"
                    value={inputData.count}
                    onChange={handleInputChange}
                    errorContent={errors.count}
                    isRequired
                  />
                  <Input
                    id={`${pageid}-price`}
                    labelText="Harga Item Satuan"
                    placeholder="100000"
                    radius="full"
                    type="number"
                    name="value"
                    value={inputData.value}
                    onChange={handleInputChange}
                    errorContent={errors.value}
                    isRequired
                  />
                </InputWrap>
              </SubmitForm>
            )}
          </Fragment>
        );
      case "PO MASUK":
        const poStatusAlias = (status) => {
          return status === "1" ? "Tertunda" : status === "2" ? "Terkirim" : status === "3" ? "Selesai" : status === "4" ? "Ditolak" : "Open";
        };

        return (
          <Fragment>
            <DashboardHead
              title={pagetitle}
              desc="Daftar permintaan PO item dari semua cabang. Filter status PO melalui tombol tab, atau klik ikon pada kolom Action untuk memperbarui status PO."
            />
            <DashboardToolbar>
              {/* <DashboardTool>
                <SearchInput
                  id={`search-data-${pageid}`}
                  placeholder="Cari data ..."
                  property="servicename"
                  userData={inPOData}
                  setUserData={setFilteredData}
                />
              </DashboardTool> */}
              <ButtonGroup
                size="sm"
                radius="full"
                buttons={postatus}
                baseColor="var(--theme-color-base)"
                primaryColor="var(--theme-color-primary)"
                secondaryColor="var(--theme-color-secondary)"
              />
              <DashboardTool>
                <Input
                  id={`limit-data-${pageid}`}
                  variant="select"
                  radius="full"
                  isLabeled={false}
                  placeholder="Baris per Halaman"
                  value={limit}
                  options={options}
                  onSelect={handleLimitChange}
                  isReadonly={isDataShown ? false : true}
                />
              </DashboardTool>
            </DashboardToolbar>
            {/* <DashboardToolbar>
              <ButtonGroup
                size="sm"
                radius="full"
                buttons={postatus}
                baseColor="var(--theme-color-base)"
                primaryColor="var(--theme-color-primary)"
                secondaryColor="var(--theme-color-secondary)"
              />
            </DashboardToolbar> */}
            <DashboardBody>
              <Table byNumber isExpandable page={currentPage} limit={limit} isNoData={!isDataShown} isLoading={isFetching}>
                <THead>
                  <TR>
                    <TH isSorted onSort={() => handleSortDate(inPOData, setInPOData, "PO Stock.postockcreate")}>
                      Tanggal Dibuat
                    </TH>
                    <TH>Kode PO</TH>
                    <TH>Nama Admin</TH>
                    <TH>Nama Cabang</TH>
                    <TH>Status PO</TH>
                  </TR>
                </THead>
                <TBody>
                  {inPOData.map((data, index) => (
                    <TR
                      key={index}
                      expandContent={
                        <Fragment>
                          {data["Detail PO"].map((subdata, idx) => (
                            <Fragment key={idx}>
                              <InputWrap>
                                <Input id={`item-name-${index}-${idx}`} radius="full" labelText="Nama Item" value={subdata.itemname} isReadonly />
                                <Input id={`item-sku-${index}-${idx}`} radius="full" labelText="Kode SKU" value={subdata.sku} isReadonly />
                                <Input id={`item-qty-${index}-${idx}`} radius="full" labelText="Jumlah Item" value={subdata.qty} isReadonly />
                              </InputWrap>
                              <Input
                                id={`item-note-${index}-${idx}`}
                                radius="full"
                                labelText="Keterangan"
                                value={subdata.note}
                                variant="textarea"
                                fallbackValue="Tidak ada keterangan."
                                isReadonly
                                rows={4}
                              />
                            </Fragment>
                          ))}
                        </Fragment>
                      }
                    >
                      <TD>{newDate(data["PO Stock"].postockcreate, "en-gb")}</TD>
                      <TD type="code">{data["PO Stock"].postockcode}</TD>
                      <TD>{toTitleCase(data["PO Stock"].username)}</TD>
                      <TD>{toTitleCase(data["PO Stock"].outletname)}</TD>
                      <TD>{poStatusAlias(data["PO Stock"].statusstock)}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </DashboardBody>
            {isDataShown && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />}
          </Fragment>
        );
      case "PO KELUAR":
        return (
          <Fragment>
            <DashboardHead title={pagetitle} />
            <DashboardToolbar>
              <DashboardTool>
                <SearchInput id={`search-data-${pageid}`} fallbackValue="Cari data ..." isReadonly />
              </DashboardTool>
              <DashboardTool>
                <Input
                  id={`limit-data-${pageid}`}
                  variant="select"
                  radius="full"
                  isLabeled={false}
                  placeholder="Baris per Halaman"
                  value={limit}
                  options={options}
                  onSelect={handleLimitChange}
                  isReadonly={isDataShown ? false : true}
                />
              </DashboardTool>
            </DashboardToolbar>
            <DashboardBody>
              <Table isNoData={true}></Table>
            </DashboardBody>
          </Fragment>
        );
      case "RESERVATION":
        const reservStatusAlias = (status) => {
          return status === "1" ? "Completed" : status === "2" ? "Reschedule" : status === "3" ? "Canceled" : "Pending";
        };

        const dpStatusAlias = (status) => {
          return status === "1" ? "Exist" : status === "2" ? "Paid" : status === "3" ? "Canceled" : "Pending";
        };

        const getAvailHours = async (date) => {
          try {
            const formData = new FormData();
            formData.append("tgl", date);
            const data = await apiRead(formData, "main", "searchtime");
            if (data && data.data && data.data.length > 0) {
              setBookedHoursData(data.data.map((hours) => hours.reservationtime));
            } else {
              setBookedHoursData([]);
            }
          } catch (error) {
            console.error("Terjadi kesalahan saat memuat jadwal reservasi. Mohon periksa koneksi internet anda dan coba lagi.", error);
          }
        };

        const handleReservInputChange = (e) => {
          const { name, value } = e.target;
          setInputData((prevState) => ({ ...prevState, [name]: value }));
          setErrors({ ...errors, [name]: "" });

          if (name === "phone") {
            let phoneexists = false;
            let matcheddata = null;
            allCustData.forEach((item) => {
              if (item.userphone === value) {
                phoneexists = true;
                matcheddata = item;
              }
            });

            if (phoneexists) {
              setCustExist(true);
              setInputData((prevState) => ({ ...prevState, name: matcheddata.username, email: matcheddata.useremail }));
            } else {
              setCustExist(false);
              setInputData((prevState) => ({ ...prevState, name: "", email: "" }));
            }
          }

          if (name === "sub_service") {
            const selectedservice = allServiceData.find((s) => s["Nama Layanan"].servicename === inputData.service);
            const selectedsubservice = selectedservice["Jenis Layanan"].find((type) => type.servicetypename === value);
            setInputData({ ...inputData, id: selectedsubservice.idservicetype, [name]: value });
            log(`id servicetype set to ${selectedsubservice.idservicetype}`);
          }

          if (name === "date") {
            getAvailHours(value);
          }
        };

        return (
          <Fragment>
            <DashboardHead
              title={pagetitle}
              desc="Data Reservasi customer. Klik Tambah Baru untuk membuat data reservasi baru, atau klik ikon di kolom Action untuk memperbarui data."
            />
            <DashboardToolbar>
              <DashboardTool>
                <SearchInput
                  id={`search-data-${pageid}`}
                  placeholder="Cari data ..."
                  property="username"
                  userData={reservData}
                  setUserData={setFilteredData}
                />
              </DashboardTool>
              <DashboardTool>
                <Input
                  id={`limit-data-${pageid}`}
                  variant="select"
                  radius="full"
                  isLabeled={false}
                  placeholder="Baris per Halaman"
                  value={limit}
                  options={options}
                  onSelect={handleLimitChange}
                  isReadonly={isDataShown ? false : true}
                />
                <Button id={`add-new-data-${pageid}`} buttonText="Tambah Baru" radius="full" onClick={openForm} />
                <Button
                  id={`export-data-${pageid}`}
                  buttonText="Export ke Excel"
                  radius="full"
                  bgColor="var(--color-green)"
                  onClick={() => exportToExcel(reservData, "Daftar Reservasi", "daftar_reservasi")}
                />
              </DashboardTool>
            </DashboardToolbar>
            <DashboardBody>
              <Table byNumber isEditable page={currentPage} limit={limit} isNoData={!isDataShown} isLoading={isFetching}>
                <THead>
                  <TR>
                    <TH isSorted onSort={() => handleSortDate(reservData, setReservData, "datetimecreate")}>
                      Tanggal Dibuat
                    </TH>
                    <TH>Tanggal Reservasi</TH>
                    <TH>Jam Reservasi</TH>
                    <TH>Kode Reservasi</TH>
                    <TH>Nama Customer</TH>
                    <TH>Nomor Telepon</TH>
                    <TH>Alamat Email</TH>
                    <TH>Status Reservasi</TH>
                    <TH>Status DP</TH>
                    <TH>Layanan</TH>
                    <TH>Jenis Layanan</TH>
                    <TH>Harga Layanan</TH>
                    <TH>Kode Voucher</TH>
                    <TH>Nama Cabang</TH>
                  </TR>
                </THead>
                <TBody>
                  {reservData.map((data, index) => (
                    <TR key={index} onEdit={() => openEdit(data.idreservation)} isWarning={data.status_reservation === "0"}>
                      <TD>{newDate(data.datetimecreate, "en-gb")}</TD>
                      <TD>{data.reservationdate}</TD>
                      <TD>{data.reservationtime}</TD>
                      <TD type="code">{data.rscode}</TD>
                      <TD>{toTitleCase(data.name)}</TD>
                      <TD type="number" isCopy>
                        {data.phone}
                      </TD>
                      <TD isCopy>{data.email}</TD>
                      <TD>{reservStatusAlias(data.status_reservation)}</TD>
                      <TD>{dpStatusAlias(data.status_dp)}</TD>
                      <TD>{toTitleCase(data.service)}</TD>
                      <TD>{toTitleCase(data.typeservice)}</TD>
                      <TD>{newPrice(data.price_reservation)}</TD>
                      <TD type="code">{data.voucher}</TD>
                      <TD>{toTitleCase(data.outlet_name)}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </DashboardBody>
            {isDataShown && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />}
            {isFormOpen && (
              <SubmitForm
                formTitle="Tambah Data Reservasi"
                operation="add"
                onSubmit={(e) => handleSubmit(e, "cudreservation")}
                loading={isSubmitting}
                onClose={closeForm}
              >
                <InputWrap>
                  <Input
                    id={`${pageid}-phone`}
                    labelText="Nomor Telepon"
                    placeholder="0882xxx"
                    radius="full"
                    type="tel"
                    name="phone"
                    value={inputData.phone}
                    onChange={handleReservInputChange}
                    errorContent={errors.phone}
                    infoContent={custExist ? "Customer sudah terdaftar. Nama dan Email otomatis terisi." : ""}
                    isRequired
                  />
                  <Input
                    id={`${pageid}-name`}
                    labelText="Nama Pelanggan"
                    placeholder="e.g. John Doe"
                    radius="full"
                    type="text"
                    name="name"
                    value={inputData.name}
                    onChange={handleReservInputChange}
                    errorContent={errors.name}
                    isReadonly={custExist ? true : false}
                    isRequired
                  />
                  <Input
                    id={`${pageid}-email`}
                    labelText="Email"
                    placeholder="customer@gmail.com"
                    radius="full"
                    type="email"
                    name="email"
                    value={inputData.email}
                    onChange={handleReservInputChange}
                    errorContent={errors.email}
                    isReadonly={custExist ? true : false}
                    isRequired
                  />
                </InputWrap>
                <InputWrap>
                  <Input
                    id={`${pageid}-service`}
                    variant="select"
                    labelText="Nama Layanan"
                    radius="full"
                    name="service"
                    placeholder="Pilih layanan"
                    options={allServiceData.map((service) => ({
                      value: service["Nama Layanan"].servicename,
                      label: service["Nama Layanan"].servicename,
                    }))}
                    value={inputData.service}
                    onSelect={(selectedValue) => handleReservInputChange({ target: { name: "service", value: selectedValue } })}
                    errorContent={errors.service}
                    isRequired
                    isSearchable
                  />
                  <Input
                    id={`${pageid}-subservice`}
                    variant="select"
                    labelText="Jenis Layanan"
                    radius="full"
                    name="sub_service"
                    placeholder={inputData.service ? "Pilih jenis layanan" : "Mohon pilih layanan dahulu"}
                    options={
                      inputData.service &&
                      allServiceData
                        .find((s) => s["Nama Layanan"].servicename === inputData.service)
                        ?.["Jenis Layanan"].map((type) => ({
                          value: type.servicetypename,
                          label: type.servicetypename,
                        }))
                    }
                    value={inputData.sub_service}
                    onSelect={(selectedValue) => handleReservInputChange({ target: { name: "sub_service", value: selectedValue } })}
                    errorContent={errors.sub_service}
                    isRequired
                    isSearchable
                    isDisabled={inputData.service ? false : true}
                  />
                </InputWrap>
                {inputData.service === "RESERVATION" && inputData.sub_service === "RESERVATION" && (
                  <InputWrap>
                    <Input
                      id={`${pageid}-price`}
                      labelText="Biaya Layanan"
                      placeholder="Masukkan biaya layanan"
                      radius="full"
                      type="number"
                      name="price"
                      value={inputData.price}
                      onChange={handleReservInputChange}
                      errorContent={errors.price}
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
                      onSelect={(selectedValue) => handleReservInputChange({ target: { name: "bank_code", value: selectedValue } })}
                      errorContent={errors.bank_code}
                      isSearchable
                    />
                  </InputWrap>
                )}
                <InputWrap>
                  <Input
                    id={`${pageid}-voucher`}
                    labelText="Kode Voucher"
                    placeholder="e.g 598RE3"
                    radius="full"
                    type="text"
                    name="voucher"
                    value={inputData.vouchercode}
                    onChange={handleReservInputChange}
                    errorContent={errors.vouchercode}
                  />
                  <Input
                    id={`${pageid}-date`}
                    labelText="Tanggal Reservasi"
                    type="date"
                    placeholder="Atur tanggal"
                    radius="full"
                    name="date"
                    min={getCurrentDate()}
                    value={inputData.date}
                    onChange={handleReservInputChange}
                    errorContent={errors.date}
                    isRequired
                  />
                  <Input
                    id={`${pageid}-time`}
                    variant="select"
                    labelText="Jam Reservasi"
                    radius="full"
                    name="time"
                    placeholder={inputData.date ? "Pilih jadwal tersedia" : "Mohon pilih tanggal dahulu"}
                    options={availHoursData.map((hour) => ({ value: hour, label: hour }))}
                    value={inputData.time}
                    onSelect={(selectedValue) => handleReservInputChange({ target: { name: "time", value: selectedValue } })}
                    errorContent={errors.time}
                    isRequired
                    isSearchable
                    isDisabled={inputData.date ? false : true}
                  />
                </InputWrap>
              </SubmitForm>
            )}
            {isEditOpen && (
              <SubmitForm
                formTitle="Perbarui Data Reservasi"
                operation="update"
                onSubmit={(e) => handleSubmit(e, "cudreservation")}
                loading={isSubmitting}
                onClose={closeEdit}
                saveText="Simpan Perubahan"
              >
                <InputWrap>
                  <Input
                    id={`edit-${pageid}-phone`}
                    labelText="Nomor Telepon"
                    placeholder="0882xxx"
                    radius="full"
                    type="tel"
                    name="phone"
                    value={inputData.phone}
                    onChange={handleReservInputChange}
                    errorContent={errors.phone}
                    infoContent={custExist ? "Customer sudah terdaftar. Nama dan Email otomatis terisi." : ""}
                    isRequired
                  />
                  <Input
                    id={`edit-${pageid}-name`}
                    labelText="Nama Pelanggan"
                    placeholder="e.g. John Doe"
                    radius="full"
                    type="text"
                    name="name"
                    value={inputData.name}
                    onChange={handleReservInputChange}
                    errorContent={errors.name}
                    isReadonly={custExist ? true : false}
                    isRequired
                  />
                  <Input
                    id={`edit-${pageid}-email`}
                    labelText="Email"
                    placeholder="customer@gmail.com"
                    radius="full"
                    type="email"
                    name="email"
                    value={inputData.email}
                    onChange={handleReservInputChange}
                    errorContent={errors.email}
                    isReadonly={custExist ? true : false}
                    isRequired
                  />
                </InputWrap>
                <InputWrap>
                  <Input
                    id={`edit-${pageid}-service`}
                    variant="select"
                    labelText="Nama Layanan"
                    name="service"
                    placeholder="Pilih layanan"
                    radius="full"
                    options={allServiceData.map((service) => ({
                      value: service["Nama Layanan"].servicename,
                      label: service["Nama Layanan"].servicename,
                    }))}
                    value={inputData.service}
                    onSelect={(selectedValue) => handleReservInputChange({ target: { name: "service", value: selectedValue } })}
                    errorContent={errors.service}
                    isRequired
                    isSearchable
                  />
                  <Input
                    id={`edit-${pageid}-subservice`}
                    variant="select"
                    labelText="Jenis Layanan"
                    name="sub_service"
                    placeholder={inputData.service ? "Pilih jenis layanan" : "Mohon pilih layanan dahulu"}
                    radius="full"
                    options={
                      inputData.service &&
                      allServiceData
                        .find((s) => s["Nama Layanan"].servicename === inputData.service)
                        ?.["Jenis Layanan"].map((type) => ({
                          value: type.servicetypename,
                          label: type.servicetypename,
                        }))
                    }
                    value={inputData.sub_service}
                    onSelect={(selectedValue) => handleReservInputChange({ target: { name: "sub_service", value: selectedValue } })}
                    errorContent={errors.sub_service}
                    isRequired
                    isSearchable
                    isDisabled={inputData.service ? false : true}
                  />
                </InputWrap>
                {inputData.service === "RESERVATION" && inputData.sub_service === "RESERVATION" && (
                  <InputWrap>
                    <Input
                      id={`edit-${pageid}-price`}
                      labelText="Biaya Layanan"
                      placeholder="Masukkan biaya layanan"
                      radius="full"
                      type="number"
                      name="price"
                      value={inputData.price}
                      onChange={handleReservInputChange}
                      errorContent={errors.price}
                    />
                    <Input
                      id={`edit-${pageid}-payments`}
                      variant="select"
                      labelText="Metode Pembayaran"
                      name="bank_code"
                      placeholder="Pilih metode pembayaran"
                      radius="full"
                      options={fvaListData.map((va) => ({ value: va.code, label: va.name }))}
                      value={inputData.bank_code}
                      onSelect={(selectedValue) => handleReservInputChange({ target: { name: "bank_code", value: selectedValue } })}
                      errorContent={errors.bank_code}
                      isSearchable
                    />
                  </InputWrap>
                )}
                <InputWrap>
                  <Input
                    id={`edit-${pageid}-voucher`}
                    labelText="Kode Voucher"
                    placeholder="e.g 598RE3"
                    radius="full"
                    type="text"
                    name="voucher"
                    value={inputData.vouchercode}
                    onChange={handleReservInputChange}
                    errorContent={errors.vouchercode}
                  />
                  <Input
                    id={`edit-${pageid}-date`}
                    labelText="Tanggal Reservasi"
                    type="date"
                    placeholder="Atur tanggal"
                    radius="full"
                    name="date"
                    min={getCurrentDate()}
                    value={inputData.date}
                    onChange={handleReservInputChange}
                    errorContent={errors.date}
                    isRequired
                  />
                  <Input
                    id={`edit-${pageid}-time`}
                    variant="select"
                    labelText="Jam Reservasi"
                    name="time"
                    placeholder={inputData.date ? "Pilih jadwal tersedia" : "Mohon pilih tanggal dahulu"}
                    radius="full"
                    options={availHoursData.map((hour) => ({ value: hour, label: hour }))}
                    value={inputData.time}
                    onSelect={(selectedValue) => handleReservInputChange({ target: { name: "time", value: selectedValue } })}
                    errorContent={errors.time}
                    isRequired
                    isSearchable
                    isDisabled={inputData.date ? false : true}
                  />
                </InputWrap>
              </SubmitForm>
            )}
          </Fragment>
        );
      case "ORDER CUSTOMER":
        return (
          <Fragment>
            <DashboardHead
              title={pagetitle}
              desc="Data order customer ini dibuat otomatis saat proses reservasi dilakukan. Klik baris data untuk melihat masing-masing detail layanan & produk terpakai."
            />
            <DashboardToolbar>
              <DashboardTool>
                <SearchInput
                  id={`search-data-${pageid}`}
                  placeholder="Cari data ..."
                  property="username"
                  userData={orderData}
                  setUserData={setFilteredData}
                />
              </DashboardTool>
              <DashboardTool>
                <Input
                  id={`limit-data-${pageid}`}
                  variant="select"
                  radius="full"
                  isLabeled={false}
                  placeholder="Baris per Halaman"
                  value={limit}
                  options={options}
                  onSelect={handleLimitChange}
                  isReadonly={isDataShown ? false : true}
                />
              </DashboardTool>
            </DashboardToolbar>
            <DashboardBody>
              <Table byNumber page={currentPage} limit={limit} isNoData={!isDataShown} isLoading={isFetching}>
                <THead>
                  <TR>
                    <TH isSorted onSort={() => handleSortDate(orderData, setOrderData, "transactioncreate")}>
                      Tanggal Dibuat
                    </TH>
                    <TH>Nama Pengguna</TH>
                    <TH>Kode Reservasi</TH>
                    <TH>Nomor Invoice</TH>
                    <TH>Nomor Telepon</TH>
                    <TH>Metode Pembayaran</TH>
                    <TH>Status Pembayaran</TH>
                    <TH>Kode Voucher</TH>
                    <TH>Nama Dokter</TH>
                    <TH>Nama Outlet</TH>
                  </TR>
                </THead>
                <TBody>
                  {orderData.map((data, index) => (
                    <TR key={index} isClickable onClick={() => openDetail(data.idtransaction)}>
                      <TD>{newDate(data.transactioncreate, "en-gb")}</TD>
                      <TD>{toTitleCase(data.transactionname)}</TD>
                      <TD type="code">{data.rscode}</TD>
                      <TD type="number" isCopy>
                        {data.noinvoice}
                      </TD>
                      <TD type="number" isCopy>
                        {data.transactionphone}
                      </TD>
                      <TD>{data.payment}</TD>
                      <TD>{data.transactionstatus}</TD>
                      <TD type="code">{data.voucher}</TD>
                      <TD>{toTitleCase(data.dentist)}</TD>
                      <TD>{toTitleCase(data.outlet_name)}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </DashboardBody>
            {isDataShown && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />}
          </Fragment>
        );
      default:
        return <DashboardHead title={`Halaman Dashboard ${pagetitle} akan segera hadir.`} />;
    }
  };

  useEffect(() => {
    if (slug === "RESERVATION") {
      setAvailHoursData(hours.filter((hour) => !bookedHoursData.includes(hour)));
    }
  }, [bookedHoursData]);

  useEffect(() => {
    setIsDataShown(filteredData.length > 0);
  }, [filteredData]);

  useEffect(() => {
    fetchData();
  }, [slug, currentPage, limit, status]);

  if (!isLoggedin) {
    return <Navigate to="/login" />;
  }

  return (
    <Pages title={`${pagetitle} - Dashboard`}>
      <DashboardContainer>{renderContent()}</DashboardContainer>
    </Pages>
  );
};

export default DashboardSlugPage;
