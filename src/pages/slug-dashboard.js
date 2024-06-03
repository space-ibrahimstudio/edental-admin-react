import React, { Fragment, useState, useEffect, useRef } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useContent, useFormat, useDevmode } from "@ibrahimstudio/react";
import { ISTrash } from "@ibrahimstudio/icons";
import { Input } from "@ibrahimstudio/input";
import { Button, ButtonGroup } from "@ibrahimstudio/button";
import html2pdf from "html2pdf.js";
import { useAuth } from "../libs/securities/auth";
import { useApi } from "../libs/apis/office";
import { useNotifications } from "../components/feedbacks/context/notifications-context";
import { useSearch } from "../libs/plugins/handler";
import { getCurrentDate, getNormalPhoneNumber, exportToExcel, getNestedValue, inputValidator } from "../libs/plugins/controller";
import { options, units, hours, inputSchema, errorSchema, orderStatusAlias, dpStatusAlias, poStatusAlias, reservStatusAlias } from "../libs/sources/common";
import Pages from "../components/frames/pages";
import { DashboardContainer, DashboardHead, DashboardToolbar, DashboardTool, DashboardBody } from "./overview-dashboard";
import Table, { THead, TBody, TR, TH, TD } from "../components/contents/table";
import { SubmitForm, FileForm } from "../components/input-controls/forms";
import Invoice from "../components/contents/invoice";
import { InputWrap } from "../components/input-controls/inputs";
import Pagination from "../components/navigations/pagination";
import calendar from "./styles/calendar.module.css";

const Modal = ({ isOpen, onClose, events, day }) => {
  if (!isOpen) return null;

  return (
    <div className={calendar.modalOverlay}>
      <div className={calendar.modalContent}>
        <h2>Events for {day}</h2>
        <button onClick={onClose} className={calendar.closeButton}>
          Close
        </button>
        <ul>
          {events.map((event, index) => (
            <li key={index}>{event.label}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const DashboardSlugPage = ({ parent, slug }) => {
  const navigate = useNavigate();
  const printRef = useRef();
  const { newDate, newPrice } = useFormat();
  const { log } = useDevmode();
  const { toTitleCase, toPathname } = useContent();
  const { isLoggedin, secret, cctr, idoutlet, level } = useAuth();
  const { apiRead, apiCrud } = useApi();
  const { showNotifications } = useNotifications();

  const pageid = parent && slug ? `slug-${toPathname(parent)}-${toPathname(slug)}` : "slug-dashboard";
  const pagetitle = slug ? `${toTitleCase(slug)}` : "Slug Dashboard";
  const pagepath = parent && slug ? `/${toPathname(parent)}/${toPathname(slug)}` : "/";

  const [limit, setLimit] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  const [isFormFetching, setIsFormFetching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [selectedMode, setSelectedMode] = useState("add");
  const [sortOrder, setSortOrder] = useState("asc");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isFileOpen, setIsFileOpen] = useState(false);
  const [status, setStatus] = useState(0);
  const [custExist, setCustExist] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  const [allCustData, setAllCustData] = useState([]);
  const [custData, setCustData] = useState([]);
  const [allservicedata, setAllservicedata] = useState([]);
  const [servicedata, setservicedata] = useState([]);
  const [allBranchData, setAllBranchData] = useState([]);
  const [branchData, setBranchData] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(idoutlet);
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
  const [selectedOrderData, setSelectedOrderData] = useState(null);
  const [orderDetailData, setOrderDetailData] = useState(null);
  const [eventsData, setEventsData] = useState([]);
  const [selectedDayEvents, setSelectedDayEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState("");

  const [inputData, setInputData] = useState({ ...inputSchema });
  const [errors, setErrors] = useState({ ...errorSchema });
  const restoreInputState = () => {
    setInputData({ ...inputSchema });
    setErrors({ ...errorSchema });
    setCustExist(false);
  };

  const handlePageChange = (page) => setCurrentPage(page);
  const handleLimitChange = (value) => {
    setLimit(value);
    setCurrentPage(1);
  };
  const handleStatusChange = (value) => {
    setStatus(value);
    setCurrentPage(1);
  };
  const handleBranchChange = (value) => {
    setSelectedBranch(value);
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

  const openDetail = (params) => navigate(`${pagepath}/${toPathname(params)}`);
  const openForm = () => {
    setSelectedMode("add");
    setIsFormOpen(true);
  };
  const closeForm = () => {
    restoreInputState();
    setIsFormOpen(false);
  };
  const openEdit = (params) => {
    switchData(params);
    setSelectedMode("update");
    setIsFormOpen(true);
  };
  const closeEdit = () => {
    restoreInputState();
    setIsFormOpen(false);
  };
  const openFile = async (id) => {
    setIsFileOpen(true);
    setIsFormFetching(true);
    try {
      const orderdata = orderData.find((item) => item.idtransaction === id);
      if (orderdata) {
        setSelectedOrderData(orderdata);
      } else {
        setSelectedOrderData(null);
      }
      const formData = new FormData();
      formData.append("data", JSON.stringify({ secret, idtransaction: id }));
      const data = await apiRead(formData, "office", "viewdetailorder");
      const orderdetaildata = data.data;
      if (data && orderdetaildata && orderdetaildata.length > 0) {
        setOrderDetailData(orderdetaildata);
      } else {
        setOrderDetailData(null);
        console.error("Order details not found or empty.");
      }
    } catch (error) {
      console.error("error getting order information:", error);
    } finally {
      setIsFormFetching(false);
    }
  };
  const closeFile = () => {
    setIsFileOpen(false);
    setSelectedOrderData(null);
    setOrderDetailData(null);
  };

  const fetchData = async () => {
    const errormsg = `Terjadi kesalahan saat memuat halaman ${toTitleCase(slug)}. Mohon periksa koneksi internet anda dan coba lagi.`;
    setIsFetching(true);
    const formData = new FormData();
    const addtFormData = new FormData();
    let data;
    let addtdata;
    try {
      const offset = (currentPage - 1) * limit;
      formData.append("data", JSON.stringify({ secret, limit, hal: offset }));
      switch (slug) {
        case "DATA CUSTOMER":
          data = await apiRead(formData, "office", "viewcustomer");
          if (data && data.data && data.data.length > 0) {
            setCustData(data.data);
            setTotalPages(data.TTLPage);
          } else {
            setCustData([]);
            setTotalPages(0);
          }
          break;
        case "LAYANAN":
          data = await apiRead(formData, "office", "viewservice");
          if (data && data.data && data.data.length > 0) {
            setservicedata(data.data);
            setTotalPages(data.TTLPage);
          } else {
            setservicedata([]);
            setTotalPages(0);
          }
          break;
        case "CABANG EDENTAL":
          data = await apiRead(formData, "office", "viewoutlet");
          if (data && data.data && data.data.length > 0) {
            setBranchData(data.data);
            setTotalPages(data.TTLPage);
          } else {
            setBranchData([]);
            setTotalPages(0);
          }
          break;
        case "DENTIST":
          data = await apiRead(formData, "office", "viewdentist");
          if (data && data.data && data.data.length > 0) {
            setDentistData(data.data);
            setTotalPages(data.TTLPage);
          } else {
            setDentistData([]);
            setTotalPages(0);
          }
          break;
        case "STOCK":
          data = await apiRead(formData, "office", "viewstock");
          if (data && data.data && data.data.length > 0) {
            setStockData(data.data);
            setTotalPages(data.TTLPage);
          } else {
            setStockData([]);
            setTotalPages(0);
          }
          break;
        case "PO MASUK":
          addtFormData.append("data", JSON.stringify({ secret, limit, hal: offset, status }));
          addtdata = await apiRead(addtFormData, "office", "viewpostock");
          if (addtdata && addtdata.data && addtdata.data.length > 0) {
            setInPOData(addtdata.data);
            setTotalPages(addtdata.TTLPage);
          } else {
            setInPOData([]);
            setTotalPages(0);
          }
          break;
        case "RESERVATION":
          data = await apiRead(formData, "office", "viewreservation");
          if (data && data.data && data.data.length > 0) {
            setReservData(data.data);
            setTotalPages(data.TTLPage);
          } else {
            setReservData([]);
            setTotalPages(0);
          }
          break;
        case "ORDER CUSTOMER":
          data = await apiRead(formData, "office", "vieworder");
          if (data && data.data && data.data.length > 0) {
            setOrderData(data.data);
            setTotalPages(data.TTLPage);
          } else {
            setOrderData([]);
            setTotalPages(0);
          }
          break;
        case "CALENDAR RESERVATION":
          addtFormData.append("data", JSON.stringify({ secret, idbranch: selectedBranch }));
          addtdata = await apiRead(addtFormData, "office", "viewcalendar");
          if (addtdata && addtdata.data && addtdata.data.length > 0) {
            const eventsdata = addtdata.data;
            const mutatedevents = eventsdata.reduce((acc, event) => {
              const date = event.reservationdate;
              const label = `${event.rscode} ${event.name}`;
              if (!acc[date]) {
                acc[date] = [];
              }
              acc[date].push({ label });
              return acc;
            }, {});
            setEventsData(mutatedevents);
          } else {
            setEventsData([]);
          }
        default:
          setTotalPages(0);
          break;
      }
    } catch (error) {
      showNotifications("danger", errormsg);
      console.error(errormsg, error);
    } finally {
      setIsFetching(false);
    }
  };

  const fetchAdditionalData = async () => {
    const errormsg = "Terjadi kesalahan saat memuat data tambahan. Mohon periksa koneksi internet anda dan coba lagi.";
    const formData = new FormData();
    const addtFormData = new FormData();
    formData.append("data", JSON.stringify({ secret }));
    try {
      const servicedata = await apiRead(formData, "office", "searchservice");
      if (servicedata && servicedata.data && servicedata.data.length > 0) {
        setAllservicedata(servicedata.data);
      } else {
        setAllservicedata([]);
      }
      const catstockdata = await apiRead(formData, "office", "searchcategorystock");
      if (catstockdata && catstockdata.data && catstockdata.data.length > 0) {
        setCategoryStockData(catstockdata.data);
      } else {
        setCategoryStockData([]);
      }
      const fvadata = await apiRead(formData, "office", "viewlistva");
      const allfvadata = fvadata.data;
      const filteredfvadata = allfvadata.filter((va) => va.is_activated === true);
      if (filteredfvadata && filteredfvadata.length > 0) {
        setFvaListData(filteredfvadata);
      } else {
        setFvaListData([]);
      }
      const allcustdata = await apiRead(formData, "office", "searchcustomer");
      if (allcustdata && allcustdata.data && allcustdata.data.length > 0) {
        setAllCustData(allcustdata.data);
      } else {
        setAllCustData([]);
      }
      addtFormData.append("data", JSON.stringify({ secret, kodeoutlet: cctr }));
      const dentistdata = await apiRead(addtFormData, "office", "viewdentistoutlet");
      if (dentistdata && dentistdata.data && dentistdata.data.length > 0) {
        setBranchDentistData(dentistdata.data);
      } else {
        setBranchDentistData([]);
      }
      const branchdata = await apiRead(formData, "office", "viewoutletall");
      if (branchdata && branchdata.data && branchdata.data.length > 0) {
        setAllBranchData(branchdata.data);
      } else {
        setAllBranchData([]);
      }
    } catch (error) {
      showNotifications("danger", errormsg);
      console.error(errormsg, error);
    }
  };

  const switchData = async (params) => {
    setSelectedData(params);
    const currentData = (arraydata, identifier) => {
      if (typeof identifier === "string") {
        return arraydata.find((item) => getNestedValue(item, identifier) === params);
      } else {
        return arraydata.find((item) => item[identifier] === params);
      }
    };
    const errormsg = `Terjadi kesalahan saat memuat data. Mohon periksa koneksi internet anda dan coba lagi.`;
    setIsFormFetching(true);
    const formData = new FormData();
    let data;
    let switchedData;
    try {
      switch (slug) {
        case "LAYANAN":
          switchedData = currentData(servicedata, "Nama Layanan.idservice");
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
        case "ORDER CUSTOMER":
          switchedData = currentData(orderData, "idtransaction");
          log(`id ${slug} data switched:`, switchedData.idtransaction);
          formData.append("data", JSON.stringify({ secret, idtransaction: params }));
          data = await apiRead(formData, "office", "viewdetailorder");
          const orderdetaildata = data.data;
          if (data && orderdetaildata && orderdetaildata.length > 0) {
            if (switchedData.payment === "CASH") {
              setInputData({
                id: switchedData.idtransaction,
                dentist: switchedData.dentist,
                typepayment: "cash",
                bank_code: "CASH",
                status: switchedData.transactionstatus,
                order: orderdetaildata.map((order) => ({ service: order.service, servicetype: order.servicetype, price: order.price })),
              });
            } else {
              setInputData({
                id: switchedData.idtransaction,
                dentist: switchedData.dentist,
                typepayment: "cashless",
                bank_code: switchedData.payment,
                status: switchedData.transactionstatus,
                order: orderdetaildata.map((order) => ({ service: order.service, servicetype: order.servicetype, price: order.price })),
              });
            }
          }
          break;
        case "RESERVATION":
          switchedData = currentData(reservData, "idreservation");
          log(`id ${slug} data switched:`, switchedData.idreservation);
          setInputData({ status: switchedData.status_reservation, statuspayment: switchedData.status_dp });
          break;
        default:
          setSelectedData(null);
          break;
      }
    } catch (error) {
      showNotifications("danger", errormsg);
      console.error(errormsg, error);
    } finally {
      setIsFormFetching(false);
    }
  };

  const handleSubmit = async (e, endpoint) => {
    e.preventDefault();
    let requiredFields = [];
    switch (slug) {
      case "LAYANAN":
        requiredFields = ["service", "layanan.servicetype", "layanan.price"];
        break;
      case "CABANG EDENTAL":
        requiredFields = ["region", "name", "address", "phone", "main_region", "postcode", "cctr_group", "cctr", "coordinate"];
        break;
      case "STOCK":
        requiredFields = ["category", "sub_category", "name", "unit", "count", "value"];
        break;
      case "RESERVATION":
        if (selectedMode === "update") {
          requiredFields = [];
        } else {
          requiredFields = ["name", "phone", "email", "service", "sub_service", "date", "time"];
        }
        break;
      case "ORDER CUSTOMER":
        requiredFields = ["dentist", "order.service", "order.servicetype", "order.price"];
        break;
      default:
        break;
    }
    const validationErrors = inputValidator(inputData, requiredFields);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    const action = e.nativeEvent.submitter.getAttribute("data-action");
    const confirmmsg = action === "update" ? `Apakah anda yakin untuk menyimpan perubahan pada ${toTitleCase(slug)}?` : `Apakah anda yakin untuk menambahkan data baru pada ${toTitleCase(slug)}?`;
    const successmsg = action === "update" ? `Selamat! Perubahan anda pada ${toTitleCase(slug)} berhasil disimpan.` : `Selamat! Data baru berhasil ditambahkan pada ${toTitleCase(slug)}.`;
    const errormsg = action === "update" ? "Terjadi kesalahan saat menyimpan perubahan. Mohon periksa koneksi internet anda dan coba lagi." : "Terjadi kesalahan saat menambahkan data. Mohon periksa koneksi internet anda dan coba lagi.";
    const confirm = window.confirm(confirmmsg);
    if (!confirm) {
      return;
    }
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
          submittedData = { secret, categorystock: inputData.category, subcategorystock: inputData.sub_category, itemname: inputData.name, unit: inputData.unit, stockin: inputData.count, value: inputData.value };
          break;
        case "RESERVATION":
          if (selectedMode === "update") {
            submittedData = { secret, status_reservation: inputData.status, status_dp: inputData.statuspayment };
          } else {
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
          }
          break;
        case "ORDER CUSTOMER":
          submittedData = { secret, bank_code: inputData.bank_code, dentist: inputData.dentist, transactionstatus: inputData.status, layanan: inputData.order };
          break;
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
      await fetchAdditionalData();
    } catch (error) {
      showNotifications("danger", errormsg);
      console.error(errormsg, error);
    } finally {
      setIsSubmitting(false);
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
            submittedData = { secret, region: "", name: "", address: "", phone: "", mainregion: "", postcode: "", cctr_group: "", cctr: "", coordinate: "" };
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
        await fetchAdditionalData();
      } catch (error) {
        showNotifications("danger", errormsg);
        console.error(errormsg, error);
      }
    }
  };

  const { searchTerm: custSearch, handleSearch: handleCustSearch, filteredData: filteredCustData, isDataShown: isCustShown } = useSearch(custData, ["username", "userphone"]);
  const { searchTerm: serviceSearch, handleSearch: handleServiceSearch, filteredData: filteredservicedata, isDataShown: isServiceShown } = useSearch(servicedata, ["Nama Layanan.servicename"]);
  const { searchTerm: branchSearch, handleSearch: handleBranchSearch, filteredData: filteredBranchData, isDataShown: isBranchShown } = useSearch(branchData, ["outlet_name", "mainregion", "outlet_region", "cctr_group", "cctr"]);
  const { searchTerm: dentistSearch, handleSearch: handleDentistSearch, filteredData: filteredDentistData, isDataShown: isDentistShown } = useSearch(dentistData, ["name_dentist", "id_branch"]);
  const { searchTerm: stockSearch, handleSearch: handleStockSearch, filteredData: filteredStockData, isDataShown: isStockShown } = useSearch(stockData, ["categorystock", "subcategorystock", "sku", "itemname", "outletname"]);
  const { searchTerm: inPOSearch, handleSearch: handleInPOSearch, filteredData: filteredInPOData, isDataShown: isInPOShown } = useSearch(inPOData, ["PO Stock.outletname", "PO Stock.postockcode"]);
  const { searchTerm: reservSearch, handleSearch: handleReservSearch, filteredData: filteredReservData, isDataShown: isReservShown } = useSearch(reservData, ["rscode", "name", "phone", "outlet_name"]);
  const { searchTerm: orderSearch, handleSearch: handleOrderSearch, filteredData: filteredOrderData, isDataShown: isOrderShown } = useSearch(orderData, ["transactionname", "noinvoice", "rscode", "dentist", "outlet_name"]);

  const renderContent = () => {
    switch (slug) {
      case "DATA CUSTOMER":
        return (
          <Fragment>
            <DashboardHead title={pagetitle} desc="Daftar Customer yang memiliki riwayat Reservasi. Data ini dibuat otomatis saat proses reservasi dilakukan." />
            <DashboardToolbar>
              <DashboardTool>
                <Input id={`search-data-${pageid}`} radius="full" isLabeled={false} placeholder="Cari data ..." type="text" value={custSearch} onChange={(e) => handleCustSearch(e.target.value)} />
              </DashboardTool>
              <DashboardTool>
                <Input id={`limit-data-${pageid}`} isLabeled={false} variant="select" noEmptyValue radius="full" placeholder="Baris per Halaman" value={limit} options={options} onSelect={handleLimitChange} isReadonly={isCustShown ? false : true} />
                <Button id={`export-data-${pageid}`} radius="full" bgColor="var(--color-green)" buttonText="Export ke Excel" onClick={() => exportToExcel(filteredCustData, "Daftar Customer", `daftar_customer_${getCurrentDate()}`)} isDisabled={isCustShown ? false : true} />
              </DashboardTool>
            </DashboardToolbar>
            <DashboardBody>
              <Table byNumber page={currentPage} limit={limit} isNoData={!isCustShown} isLoading={isFetching}>
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
                  {filteredCustData.map((data, index) => (
                    <TR key={index}>
                      <TD>{newDate(data.usercreate, "id")}</TD>
                      <TD>{toTitleCase(data.username)}</TD>
                      <TD>{data.useremail}</TD>
                      <TD type="number" isCopy>
                        {data.userphone}
                      </TD>
                      <TD>{toTitleCase(data.address)}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </DashboardBody>
            {isCustShown && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />}
          </Fragment>
        );
      case "MANAJEMEN USER":
        return (
          <Fragment>
            <DashboardHead title={pagetitle} />
            <DashboardToolbar>
              <DashboardTool>
                <Input id={`search-data-${pageid}`} radius="full" isLabeled={false} placeholder="Cari data ..." type="text" />
              </DashboardTool>
              <DashboardTool>
                <Input id={`limit-data-${pageid}`} isLabeled={false} variant="select" noEmptyValue radius="full" placeholder="Baris per Halaman" value={limit} options={options} onSelect={handleLimitChange} isReadonly={true} />
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
            let serviceexists = allservicedata.some((item) => {
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
          setInputData((prevState) => ({ ...prevState, layanan: prevState.layanan.map((item, idx) => (idx === index ? { ...item, [name]: value } : item)) }));
          setErrors((prevErrors) => ({ ...prevErrors, layanan: prevErrors.layanan.map((error, idx) => (idx === index ? { ...error, [name]: "" } : error)) }));
        };

        const handleAddServiceRow = () => {
          setInputData((prevState) => ({ ...prevState, layanan: [...prevState.layanan, { servicetype: "", price: "" }] }));
          setErrors((prevErrors) => ({ ...prevErrors, layanan: [...prevErrors.layanan, { servicetype: "", price: "" }] }));
        };

        const handleRmvServiceRow = (index) => {
          const updatedrow = [...inputData.layanan];
          const updatedrowerror = [...errors.layanan];
          updatedrow.splice(index, 1);
          updatedrowerror.splice(index, 1);
          setInputData((prevState) => ({ ...prevState, layanan: updatedrow }));
          setErrors((prevErrors) => ({ ...prevErrors, layanan: updatedrowerror }));
        };

        return (
          <Fragment>
            <DashboardHead title={pagetitle} desc="Daftar layanan yang tersedia saat ini. Klik opsi ikon pada kolom Action untuk melihat detail, memperbarui, atau menghapus data." />
            <DashboardToolbar>
              <DashboardTool>
                <Input id={`search-data-${pageid}`} radius="full" isLabeled={false} placeholder="Cari data ..." type="text" value={serviceSearch} onChange={(e) => handleServiceSearch(e.target.value)} />
              </DashboardTool>
              <DashboardTool>
                <Input id={`limit-data-${pageid}`} isLabeled={false} variant="select" noEmptyValue radius="full" placeholder="Baris per Halaman" value={limit} options={options} onSelect={handleLimitChange} isReadonly={isServiceShown ? false : true} />
                <Button id={`add-new-data-${pageid}`} radius="full" buttonText="Tambah Baru" onClick={openForm} />
              </DashboardTool>
            </DashboardToolbar>
            <DashboardBody>
              <Table byNumber isExpandable isEditable isDeletable page={currentPage} limit={limit} isNoData={!isServiceShown} isLoading={isFetching}>
                <THead>
                  <TR>
                    <TH isSorted onSort={() => handleSortDate(servicedata, setservicedata, "Nama Layanan.servicecreate")}>
                      Tanggal Dibuat
                    </TH>
                    <TH>Nama Layanan</TH>
                    <TH>Nomor ID Layanan</TH>
                    <TH isSorted onSort={() => handleSortDate(servicedata, setservicedata, "Nama Layanan.serviceupdate")}>
                      Terakhir Diperbarui
                    </TH>
                    <TH>Status Layanan</TH>
                  </TR>
                </THead>
                <TBody>
                  {filteredservicedata.map((data, index) => (
                    <TR
                      key={index}
                      expandContent={
                        <Fragment>
                          {data["Jenis Layanan"].map((subdata, idx) => (
                            <InputWrap key={idx}>
                              <Input id={`${pageid}-name-${index}-${idx}`} radius="full" labelText="Jenis Layanan" value={subdata.servicetypename} isReadonly />
                              <Input id={`${pageid}-price-${index}-${idx}`} radius="full" labelText="Harga" value={newPrice(subdata.serviceprice)} isReadonly />
                              <Input id={`${pageid}-status-${index}-${idx}`} radius="full" labelText="Status" value={subdata.servicetypestatus} isReadonly />
                            </InputWrap>
                          ))}
                        </Fragment>
                      }
                      onEdit={() => openEdit(data["Nama Layanan"].idservice)}
                      onDelete={() => handleDelete(data["Nama Layanan"].idservice, "cudservice")}
                    >
                      <TD>{newDate(data["Nama Layanan"].servicecreate, "id")}</TD>
                      <TD>{data["Nama Layanan"].servicename}</TD>
                      <TD type="number">{data["Nama Layanan"].idservice}</TD>
                      <TD>{newDate(data["Nama Layanan"].serviceupdate, "id")}</TD>
                      <TD>{data["Nama Layanan"].servicestatus}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </DashboardBody>
            {isServiceShown && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />}
            {isFormOpen && (
              <SubmitForm size="md" formTitle={selectedMode === "update" ? "Perbarui Data Layanan" : "Tambah Data Layanan"} operation={selectedMode} fetching={isFormFetching} onSubmit={(e) => handleSubmit(e, "cudservice")} loading={isSubmitting} onClose={closeForm}>
                <Input id={`${pageid}-name`} radius="full" labelText="Nama Layanan" placeholder="Masukkan nama layanan" type="text" name="service" value={inputData.service} onChange={handleServiceInputChange} errorContent={errors.service} isRequired />
                {inputData.layanan.map((subservice, index) => (
                  <InputWrap key={index}>
                    <Input id={`${pageid}-type-name-${index}`} radius="full" labelText="Jenis Layanan" placeholder="e.g. Scaling gigi" type="text" name="servicetype" value={subservice.servicetype} onChange={(e) => handleServiceRowChange(index, e)} errorContent={errors[`layanan.${index}.servicetype`] ? errors[`layanan.${index}.servicetype`] : ""} isRequired />
                    <Input id={`${pageid}-type-price-${index}`} radius="full" labelText="Atur Harga" placeholder="Masukkan harga" type="number" name="price" value={subservice.price} onChange={(e) => handleServiceRowChange(index, e)} errorContent={errors[`layanan.${index}.price`] ? errors[`layanan.${index}.price`] : ""} isRequired />
                    <Button id={`${pageid}-delete-row-${index}`} variant="dashed" subVariant="icon" isTooltip size="sm" radius="full" color={index <= 0 ? "var(--color-red-30)" : "var(--color-red)"} iconContent={<ISTrash />} tooltipText="Hapus" onClick={() => handleRmvServiceRow(index)} isDisabled={index <= 0 ? true : false} />
                  </InputWrap>
                ))}
                <Button id={`${pageid}-add-row`} variant="line" size="sm" radius="full" color="var(--color-hint)" buttonText="Tambah Jenis Layanan" onClick={handleAddServiceRow} />
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
                <Input id={`search-data-${pageid}`} radius="full" isLabeled={false} placeholder="Cari data ..." type="text" value={branchSearch} onChange={(e) => handleBranchSearch(e.target.value)} />
              </DashboardTool>
              <DashboardTool>
                <Input id={`limit-data-${pageid}`} isLabeled={false} variant="select" noEmptyValue radius="full" placeholder="Baris per Halaman" value={limit} options={options} onSelect={handleLimitChange} isReadonly={isBranchShown ? false : true} />
                <Button id={`add-new-data-${pageid}`} radius="full" buttonText="Tambah Baru" onClick={openForm} />
                <Button id={`export-data-${pageid}`} radius="full" bgColor="var(--color-green)" buttonText="Export ke Excel" onClick={() => exportToExcel(filteredBranchData, "Daftar Cabang", `daftar_cabang_${getCurrentDate()}`)} isDisabled={isBranchShown ? false : true} />
              </DashboardTool>
            </DashboardToolbar>
            <DashboardBody>
              <Table byNumber isEditable isDeletable page={currentPage} limit={limit} isNoData={!isBranchShown} isLoading={isFetching}>
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
                  {filteredBranchData.map((data, index) => (
                    <TR key={index} onEdit={() => openEdit(data.idoutlet)} onDelete={() => handleDelete(data.idoutlet)}>
                      <TD>{newDate(data.outletcreate, "id")}</TD>
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
            {isBranchShown && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />}
            {isFormOpen && (
              <SubmitForm formTitle={selectedMode === "update" ? "Perbarui Data Cabang" : "Tambah Data Cabang"} operation={selectedMode} fetching={isFormFetching} onSubmit={(e) => handleSubmit(e, "cudoutlet")} loading={isSubmitting} onClose={closeForm}>
                <InputWrap>
                  <Input id={`${pageid}-name`} radius="full" labelText="Nama Outlet" placeholder="Edental Jakarta Pusat" type="text" name="name" value={inputData.name} onChange={handleInputChange} errorContent={errors.name} isRequired />
                  <Input id={`${pageid}-phone`} radius="full" labelText="Nomor Kontak Cabang" placeholder="0882xxx" type="tel" name="phone" value={inputData.phone} onChange={handleInputChange} errorContent={errors.phone} isRequired />
                  <Input id={`${pageid}-mainregion`} radius="full" labelText="Main Region" placeholder="Jawa" type="text" name="main_region" value={inputData.main_region} onChange={handleInputChange} errorContent={errors.main_region} isRequired />
                </InputWrap>
                <InputWrap>
                  <Input id={`${pageid}-region`} radius="full" labelText="Region" placeholder="DKI Jakarta" type="text" name="region" value={inputData.region} onChange={handleInputChange} errorContent={errors.region} isRequired />
                  <Input id={`${pageid}-address`} radius="full" labelText="Alamat Cabang" placeholder="123 Main Street" type="text" name="address" value={inputData.address} onChange={handleInputChange} errorContent={errors.address} isRequired />
                  <Input id={`${pageid}-postcode`} radius="full" labelText="Kode Pos" placeholder="40282" type="number" name="postcode" value={inputData.postcode} onChange={handleInputChange} errorContent={errors.postcode} isRequired />
                </InputWrap>
                <InputWrap>
                  <Input id={`${pageid}-coords`} radius="full" labelText="Titik Koordinat" placeholder="Masukkan titik koordinat" type="text" name="coordinate" value={inputData.coordinate} onChange={handleInputChange} errorContent={errors.coordinate} isRequired />
                  <Input id={`${pageid}-cctrgroup`} radius="full" labelText="CCTR Group" placeholder="Masukkan CCTR group" type="text" name="cctr_group" value={inputData.cctr_group} onChange={handleInputChange} errorContent={errors.cctr_group} isRequired />
                  <Input id={`${pageid}-cctr`} radius="full" labelText="CCTR" placeholder="Masukkan CCTR" type="text" name="cctr" value={inputData.cctr} onChange={handleInputChange} errorContent={errors.cctr} isRequired />
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
                <Input id={`search-data-${pageid}`} radius="full" isLabeled={false} placeholder="Cari data ..." type="text" value={dentistSearch} onChange={(e) => handleDentistSearch(e.target.value)} />
              </DashboardTool>
              <DashboardTool>
                <Input id={`limit-data-${pageid}`} isLabeled={false} variant="select" noEmptyValue radius="full" placeholder="Baris per Halaman" value={limit} options={options} onSelect={handleLimitChange} isReadonly={isDentistShown ? false : true} />
                <Button id={`export-data-${pageid}`} radius="full" bgColor="var(--color-green)" buttonText="Export ke Excel" onClick={() => exportToExcel(filteredDentistData, "Daftar Dokter", `daftar_dokter_${getCurrentDate()}`)} isDisabled={isDentistShown ? false : true} />
              </DashboardTool>
            </DashboardToolbar>
            <DashboardBody>
              <Table byNumber page={currentPage} limit={limit} isNoData={!isDentistShown} isLoading={isFetching}>
                <THead>
                  <TR>
                    <TH>Kode Cabang</TH>
                    <TH>Nama Dokter</TH>
                    <TH>Nomor SIP</TH>
                    <TH>Nomor Telepon</TH>
                  </TR>
                </THead>
                <TBody>
                  {filteredDentistData.map((data, index) => (
                    <TR key={index}>
                      <TD type="code">{data.id_branch}</TD>
                      <TD>{toTitleCase(data.name_dentist.replace(`${data.id_branch} -`, ""))}</TD>
                      <TD type="code">{data.SIP}</TD>
                      <TD type="number">{data.phone}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </DashboardBody>
            {isDentistShown && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />}
          </Fragment>
        );
      case "KAS":
        return (
          <Fragment>
            <DashboardHead title={pagetitle} />
            <DashboardToolbar>
              <DashboardTool>
                <Input id={`search-data-${pageid}`} radius="full" isLabeled={false} placeholder="Cari data ..." type="text" />
              </DashboardTool>
              <DashboardTool>
                <Input id={`limit-data-${pageid}`} isLabeled={false} variant="select" noEmptyValue radius="full" placeholder="Baris per Halaman" value={limit} options={options} onSelect={handleLimitChange} isReadonly={true} />
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
            <DashboardHead title={pagetitle} desc="Data Stok berdasarkan kategori. Klik baris data untuk melihat masing-masing detail histori stok." />
            <DashboardToolbar>
              <DashboardTool>
                <Input id={`search-data-${pageid}`} radius="full" isLabeled={false} placeholder="Cari data ..." type="text" value={stockSearch} onChange={(e) => handleStockSearch(e.target.value)} />
              </DashboardTool>
              <DashboardTool>
                <Input id={`limit-data-${pageid}`} isLabeled={false} variant="select" noEmptyValue radius="full" placeholder="Baris per Halaman" value={limit} options={options} onSelect={handleLimitChange} isReadonly={isStockShown ? false : true} />
                <Button id={`add-new-data-${pageid}`} radius="full" buttonText="Tambah Baru" onClick={openForm} />
                <Button id={`export-data-${pageid}`} radius="full" bgColor="var(--color-green)" buttonText="Export ke Excel" onClick={() => exportToExcel(filteredStockData, "Daftar Stok", `daftar_stok_${getCurrentDate()}`)} isDisabled={isStockShown ? false : true} />
              </DashboardTool>
            </DashboardToolbar>
            <DashboardBody>
              <Table byNumber isClickable page={currentPage} limit={limit} isNoData={!isStockShown} isLoading={isFetching}>
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
                  {filteredStockData.map((data, index) => (
                    <TR key={index} onClick={() => openDetail(data.itemname)}>
                      <TD>{newDate(data.stockcreate, "id")}</TD>
                      <TD>{toTitleCase(data.categorystock)}</TD>
                      <TD>{toTitleCase(data.subcategorystock)}</TD>
                      <TD type="code">{data.sku}</TD>
                      <TD>{toTitleCase(data.itemname)}</TD>
                      <TD>{data.unit}</TD>
                      <TD type="number">{data.lastqty}</TD>
                      <TD>{newPrice(data.value)}</TD>
                      <TD>{newPrice(data.totalvalue)}</TD>
                      <TD>{toTitleCase(data.outletname)}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </DashboardBody>
            {isStockShown && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />}
            {isFormOpen && (
              <SubmitForm formTitle={selectedMode === "update" ? "Perbarui Data Stok" : "Tambah Data Stok"} operation={selectedMode} fetching={isFormFetching} onSubmit={(e) => handleSubmit(e, "cudstock")} loading={isSubmitting} onClose={closeForm}>
                <InputWrap>
                  <Input id={`${pageid}-category`} variant="select" isSearchable radius="full" labelText="Kategori" placeholder="Pilih kategori" name="category" value={inputData.category} options={categoryStockData.map((cat) => ({ value: cat["category_stok"].categorystockname, label: cat["category_stok"].categorystockname }))} onSelect={(selectedValue) => handleInputChange({ target: { name: "category", value: selectedValue } })} errorContent={errors.category} isRequired />
                  <Input
                    id={`${pageid}-subcategory`}
                    variant="select"
                    isSearchable
                    radius="full"
                    labelText="Sub Kategori"
                    placeholder={inputData.category ? "Pilih sub kategori" : "Mohon pilih kategori dahulu"}
                    name="sub_category"
                    value={inputData.sub_category}
                    options={inputData.category && categoryStockData.find((cat) => cat["category_stok"].categorystockname === inputData.category)?.["subcategory_stok"].map((sub) => ({ value: sub.subcategorystock, label: sub.subcategorystock }))}
                    onSelect={(selectedValue) => handleInputChange({ target: { name: "sub_category", value: selectedValue } })}
                    errorContent={errors.sub_category}
                    isRequired
                    isDisabled={inputData.category ? false : true}
                  />
                  <Input id={`${pageid}-name`} radius="full" labelText="Nama Item" placeholder="STERILISATOR" type="text" name="item" value={inputData.name} onChange={handleInputChange} errorContent={errors.name} isRequired />
                </InputWrap>
                <InputWrap>
                  <Input id={`${pageid}-unit`} variant="select" radius="full" labelText="Unit/satuan" placeholder="Pilih satuan/unit" name="unit" value={inputData.unit} options={units} onSelect={(selectedValue) => handleInputChange({ target: { name: "unit", value: selectedValue } })} errorContent={errors.unit} isRequired />
                  <Input id={`${pageid}-qty`} radius="full" labelText="Jumlah" placeholder="40" type="number" name="count" value={inputData.count} onChange={handleInputChange} errorContent={errors.count} isRequired />
                  <Input id={`${pageid}-price`} radius="full" labelText="Harga Item Satuan" placeholder="100000" type="number" name="value" value={inputData.value} onChange={handleInputChange} errorContent={errors.value} isRequired />
                </InputWrap>
              </SubmitForm>
            )}
          </Fragment>
        );
      case "PO MASUK":
        const postatus = [
          { buttonText: "Open", onClick: () => handleStatusChange(0), isActive: status === 0 },
          { buttonText: "Pending", onClick: () => handleStatusChange(1), isActive: status === 1 },
          { buttonText: "Sent", onClick: () => handleStatusChange(2), isActive: status === 2 },
          { buttonText: "Done", onClick: () => handleStatusChange(3), isActive: status === 3 },
          { buttonText: "Rejected", onClick: () => handleStatusChange(4), isActive: status === 4 },
        ];

        return (
          <Fragment>
            <DashboardHead title={pagetitle} desc="Daftar permintaan PO item dari semua cabang. Filter status PO melalui tombol tab, atau klik ikon pada kolom Action untuk memperbarui status PO." />
            <DashboardToolbar>
              <DashboardTool>
                <Input id={`search-data-${pageid}`} radius="full" isLabeled={false} placeholder="Cari data ..." type="text" value={inPOSearch} onChange={(e) => handleInPOSearch(e.target.value)} />
              </DashboardTool>
              <DashboardTool>
                <ButtonGroup size="sm" radius="full" baseColor="var(--theme-color-base)" primaryColor="var(--theme-color-primary)" secondaryColor="var(--theme-color-secondary)" buttons={postatus} />
              </DashboardTool>
              <DashboardTool>
                <Input id={`limit-data-${pageid}`} isLabeled={false} variant="select" noEmptyValue radius="full" placeholder="Baris per Halaman" value={limit} options={options} onSelect={handleLimitChange} isReadonly={isInPOShown ? false : true} />
              </DashboardTool>
            </DashboardToolbar>
            <DashboardBody>
              <Table byNumber isExpandable page={currentPage} limit={limit} isNoData={!isInPOShown} isLoading={isFetching}>
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
                  {filteredInPOData.map((data, index) => (
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
                              <Input id={`item-note-${index}-${idx}`} variant="textarea" radius="full" labelText="Keterangan" rows={4} value={subdata.note} fallbackValue="Tidak ada keterangan." isReadonly />
                            </Fragment>
                          ))}
                        </Fragment>
                      }
                    >
                      <TD>{newDate(data["PO Stock"].postockcreate, "id")}</TD>
                      <TD type="code">{data["PO Stock"].postockcode}</TD>
                      <TD>{toTitleCase(data["PO Stock"].username)}</TD>
                      <TD>{toTitleCase(data["PO Stock"].outletname)}</TD>
                      <TD>{poStatusAlias(data["PO Stock"].statusstock)}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </DashboardBody>
            {isInPOShown && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />}
          </Fragment>
        );
      case "PO KELUAR":
        return (
          <Fragment>
            <DashboardHead title={pagetitle} />
            <DashboardToolbar>
              <DashboardTool>
                <Input id={`search-data-${pageid}`} radius="full" isLabeled={false} placeholder="Cari data ..." type="text" />
              </DashboardTool>
              <DashboardTool>
                <Input id={`limit-data-${pageid}`} isLabeled={false} variant="select" noEmptyValue radius="full" placeholder="Baris per Halaman" value={limit} options={options} onSelect={handleLimitChange} isReadonly={true} />
              </DashboardTool>
            </DashboardToolbar>
            <DashboardBody>
              <Table isNoData={true}></Table>
            </DashboardBody>
          </Fragment>
        );
      case "RESERVATION":
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
            const selectedservice = allservicedata.find((s) => s["Nama Layanan"].servicename === inputData.service);
            const selectedsubservice = selectedservice["Jenis Layanan"].find((type) => type.servicetypename === value);
            if (value === "RESERVATION") {
              setInputData((prevState) => ({ ...prevState, id: selectedsubservice.idservicetype, price: 100000 }));
            } else {
              setInputData((prevState) => ({ ...prevState, id: selectedsubservice.idservicetype, price: 0 }));
            }
            log(`id servicetype set to ${selectedsubservice.idservicetype}`);
          }
          if (name === "date") {
            getAvailHours(value);
          }
        };

        return (
          <Fragment>
            <DashboardHead title={pagetitle} desc="Data Reservasi customer. Klik Tambah Baru untuk membuat data reservasi baru, atau klik ikon di kolom Action untuk memperbarui data." />
            <DashboardToolbar>
              <DashboardTool>
                <Input id={`search-data-${pageid}`} radius="full" isLabeled={false} placeholder="Cari data ..." type="text" value={reservSearch} onChange={(e) => handleReservSearch(e.target.value)} />
              </DashboardTool>
              <DashboardTool>
                <Input id={`limit-data-${pageid}`} isLabeled={false} variant="select" noEmptyValue radius="full" placeholder="Baris per Halaman" value={limit} options={options} onSelect={handleLimitChange} isReadonly={isReservShown ? false : true} />
                <Button id={`add-new-data-${pageid}`} radius="full" buttonText="Tambah Baru" onClick={openForm} />
                <Button id={`export-data-${pageid}`} radius="full" bgColor="var(--color-green)" buttonText="Export ke Excel" onClick={() => exportToExcel(filteredReservData, "Daftar Reservasi", `daftar_reservasi_${getCurrentDate()}`)} isDisabled={isReservShown ? false : true} />
              </DashboardTool>
            </DashboardToolbar>
            <DashboardBody>
              <Table byNumber isEditable page={currentPage} limit={limit} isNoData={!isReservShown} isLoading={isFetching}>
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
                    <TH>Biaya DP</TH>
                    <TH>Kode Voucher</TH>
                    <TH>Nama Cabang</TH>
                  </TR>
                </THead>
                <TBody>
                  {filteredReservData.map((data, index) => (
                    <TR key={index} onEdit={() => openEdit(data.idreservation)} isComplete={data.status_reservation === "1"} isWarning={data.status_reservation === "2"} isDanger={data.status_reservation === "3"}>
                      <TD>{newDate(data.datetimecreate, "id")}</TD>
                      <TD>{data.reservationdate}</TD>
                      <TD>{data.reservationtime}</TD>
                      <TD type="code">{data.rscode}</TD>
                      <TD>{toTitleCase(data.name)}</TD>
                      <TD type="number" isCopy>
                        {data.phone}
                      </TD>
                      <TD>{data.email}</TD>
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
            {isReservShown && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />}
            {isFormOpen && (
              <SubmitForm size={selectedMode === "update" ? "sm" : "lg"} formTitle={selectedMode === "update" ? "Ubah Status Reservasi" : "Tambah Data Reservasi"} operation={selectedMode} fetching={isFormFetching} onSubmit={(e) => handleSubmit(e, "cudreservation")} loading={isSubmitting} onClose={closeForm}>
                {selectedMode === "update" ? (
                  <InputWrap>
                    <Input
                      id={`${pageid}-reserv-status`}
                      variant="select"
                      noEmptyValue
                      radius="full"
                      labelText="Status Reservasi"
                      placeholder="Set status"
                      name="status"
                      value={inputData.status}
                      options={[
                        { value: "0", label: "Pending" },
                        { value: "2", label: "Reschedule" },
                        { value: "3", label: "Batal" },
                      ]}
                      onSelect={(selectedValue) => handleReservInputChange({ target: { name: "status", value: selectedValue } })}
                    />
                    {inputData.statuspayment !== "1" && (
                      <Input
                        id={`${pageid}-dp-status`}
                        variant="select"
                        noEmptyValue
                        radius="full"
                        labelText="Status DP"
                        placeholder="Set status"
                        name="statuspayment"
                        value={inputData.statuspayment}
                        options={[
                          { value: "0", label: "Pending" },
                          { value: "3", label: "Batal" },
                        ]}
                        onSelect={(selectedValue) => handleReservInputChange({ target: { name: "statuspayment", value: selectedValue } })}
                      />
                    )}
                  </InputWrap>
                ) : (
                  <Fragment>
                    <InputWrap>
                      <Input id={`${pageid}-phone`} radius="full" labelText="Nomor Telepon" placeholder="0882xxx" type="tel" name="phone" value={inputData.phone} onChange={handleReservInputChange} infoContent={custExist ? "Customer sudah terdaftar. Nama dan Email otomatis terisi." : ""} errorContent={errors.phone} isRequired />
                      <Input id={`${pageid}-name`} radius="full" labelText="Nama Pelanggan" placeholder="e.g. John Doe" type="text" name="name" value={inputData.name} onChange={handleReservInputChange} errorContent={errors.name} isRequired isReadonly={custExist ? true : false} />
                      <Input id={`${pageid}-email`} radius="full" labelText="Email" placeholder="customer@gmail.com" type="email" name="email" value={inputData.email} onChange={handleReservInputChange} errorContent={errors.email} isRequired isReadonly={custExist ? true : false} />
                    </InputWrap>
                    <InputWrap>
                      <Input id={`${pageid}-service`} variant="select" isSearchable radius="full" labelText="Nama Layanan" placeholder="Pilih layanan" name="service" value={inputData.service} options={allservicedata.map((service) => ({ value: service["Nama Layanan"].servicename, label: service["Nama Layanan"].servicename }))} onSelect={(selectedValue) => handleReservInputChange({ target: { name: "service", value: selectedValue } })} errorContent={errors.service} isRequired />
                      <Input
                        id={`${pageid}-subservice`}
                        variant="select"
                        isSearchable
                        radius="full"
                        labelText="Jenis Layanan"
                        placeholder={inputData.service ? "Pilih jenis layanan" : "Mohon pilih layanan dahulu"}
                        name="sub_service"
                        value={inputData.sub_service}
                        options={inputData.service && allservicedata.find((s) => s["Nama Layanan"].servicename === inputData.service)?.["Jenis Layanan"].map((type) => ({ value: type.servicetypename, label: type.servicetypename }))}
                        onSelect={(selectedValue) => handleReservInputChange({ target: { name: "sub_service", value: selectedValue } })}
                        errorContent={errors.sub_service}
                        isRequired
                        isDisabled={inputData.service ? false : true}
                      />
                      <Input id={`${pageid}-voucher`} radius="full" labelText="Kode Voucher" placeholder="e.g 598RE3" type="text" name="vouchercode" value={inputData.vouchercode} onChange={handleReservInputChange} errorContent={errors.vouchercode} />
                    </InputWrap>
                    <InputWrap>
                      <Input id={`${pageid}-date`} radius="full" labelText="Tanggal Reservasi" placeholder="Atur tanggal" type="date" name="date" min={getCurrentDate()} value={inputData.date} onChange={handleReservInputChange} errorContent={errors.date} isRequired />
                      <Input
                        id={`${pageid}-time`}
                        variant="select"
                        isSearchable
                        radius="full"
                        labelText="Jam Reservasi"
                        placeholder={inputData.date ? "Pilih jadwal tersedia" : "Mohon pilih tanggal dahulu"}
                        name="time"
                        value={inputData.time}
                        options={availHoursData.map((hour) => ({ value: hour, label: hour }))}
                        onSelect={(selectedValue) => handleReservInputChange({ target: { name: "time", value: selectedValue } })}
                        errorContent={errors.time}
                        isRequired
                        isDisabled={inputData.date ? false : true}
                      />
                    </InputWrap>
                    <Input id={`${pageid}-note`} variant="textarea" radius="full" labelText="Catatan" placeholder="Masukkan catatan/keterangan ..." name="note" rows={4} value={inputData.note} onChange={handleReservInputChange} errorContent={errors.note} />
                    {inputData.service === "RESERVATION" && inputData.sub_service === "RESERVATION" && (
                      <InputWrap>
                        <Input id={`${pageid}-price`} radius="full" labelText="Biaya Layanan" placeholder="Masukkan biaya layanan" type="number" name="price" value={inputData.price} onChange={handleReservInputChange} errorContent={errors.price} />
                        <Input id={`${pageid}-payments`} variant="select" isSearchable radius="full" labelText="Metode Pembayaran" placeholder="Pilih metode pembayaran" name="bank_code" value={inputData.bank_code} options={fvaListData.map((va) => ({ value: va.code, label: va.name }))} onSelect={(selectedValue) => handleReservInputChange({ target: { name: "bank_code", value: selectedValue } })} errorContent={errors.bank_code} />
                      </InputWrap>
                    )}
                  </Fragment>
                )}
              </SubmitForm>
            )}
          </Fragment>
        );
      case "ORDER CUSTOMER":
        const exportToPDF = () => {
          const element = printRef.current;
          const opt = { margin: 0.2, filename: `invoice-${toPathname(selectedOrderData.transactionname)}-${selectedOrderData.rscode}.pdf`, image: { type: "jpeg", quality: 0.99 }, html2canvas: { scale: 2 }, jsPDF: { unit: "in", format: "letter", orientation: "portrait" } };
          html2pdf().from(element).set(opt).save();
        };

        const contactWhatsApp = (number) => {
          const wanumber = getNormalPhoneNumber(number);
          window.open(`https://wa.me/${wanumber}`, "_blank");
        };

        const handleOrderInputChange = (e) => {
          const { name, value } = e.target;
          setInputData((prevState) => ({ ...prevState, [name]: value }));
          setErrors({ ...errors, [name]: "" });
          if (name === "typepayment") {
            if (value === "cash") {
              setInputData((prevState) => ({ ...prevState, bank_code: "CASH" }));
            } else {
              setInputData((prevState) => ({ ...prevState, status: "0" }));
            }
          }
        };

        const handleOrderRowChange = (index, e) => {
          const { name, value } = e.target;
          setInputData((prevState) => {
            const updatedorder = prevState.order.map((item, idx) => {
              if (idx === index) {
                let updateditem = { ...item, [name]: value };
                if (name === "servicetype") {
                  const selectedservice = prevState.order[index].service;
                  const servicedata = allservicedata.find((service) => service["Nama Layanan"].servicename === selectedservice);
                  if (servicedata) {
                    const selectedtype = servicedata["Jenis Layanan"].find((type) => type.servicetypename === value);
                    if (selectedtype) {
                      updateditem.price = selectedtype.serviceprice || "";
                    }
                  }
                }
                return updateditem;
              } else {
                return item;
              }
            });
            return { ...prevState, order: updatedorder };
          });
          setErrors((prevErrors) => ({ ...prevErrors, order: prevErrors.order.map((error, idx) => (idx === index ? { ...error, [name]: "" } : error)) }));
        };

        const handleAddOrderRow = () => {
          setInputData((prevState) => ({ ...prevState, order: [...prevState.order, { service: "", servicetype: "", price: "" }] }));
          setErrors((prevErrors) => ({ ...prevErrors, order: [...prevErrors.order, { service: "", servicetype: "", price: "" }] }));
        };

        const handleRmvOrderRow = (index) => {
          const updatedrow = [...inputData.order];
          const updatedrowerror = [...errors.order];
          updatedrow.splice(index, 1);
          updatedrowerror.splice(index, 1);
          setInputData((prevState) => ({ ...prevState, order: updatedrow }));
          setErrors((prevErrors) => ({ ...prevErrors, order: updatedrowerror }));
        };

        return (
          <Fragment>
            <DashboardHead title={pagetitle} desc="Data order customer ini dibuat otomatis saat proses reservasi dilakukan. Klik baris data untuk melihat masing-masing detail layanan & produk terpakai." />
            <DashboardToolbar>
              <DashboardTool>
                <Input id={`search-data-${pageid}`} radius="full" isLabeled={false} placeholder="Cari data ..." type="text" value={orderSearch} onChange={(e) => handleOrderSearch(e.target.value)} />
              </DashboardTool>
              <DashboardTool>
                <Input id={`limit-data-${pageid}`} isLabeled={false} variant="select" noEmptyValue radius="full" placeholder="Baris per Halaman" value={limit} options={options} onSelect={handleLimitChange} isReadonly={isOrderShown ? false : true} />
                <Button id={`export-data-${pageid}`} radius="full" bgColor="var(--color-green)" buttonText="Export ke Excel" onClick={() => exportToExcel(filteredOrderData, "Daftar Order", `daftar_order_${getCurrentDate()}`)} isDisabled={isOrderShown ? false : true} />
              </DashboardTool>
            </DashboardToolbar>
            <DashboardBody>
              <Table byNumber isClickable isEditable isPrintable isContactable page={currentPage} limit={limit} isNoData={!isOrderShown} isLoading={isFetching}>
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
                    <TH>Total Pembayaran</TH>
                    <TH>Status Pembayaran</TH>
                    <TH>Kode Voucher</TH>
                    <TH>Nama Dokter</TH>
                    <TH>Nama Outlet</TH>
                  </TR>
                </THead>
                <TBody>
                  {filteredOrderData.map((data, index) => (
                    <TR key={index} isComplete={data.transactionstatus === "1"} isDanger={data.transactionstatus === "2"} onEdit={data.transactionstatus === "1" ? () => {} : () => openEdit(data.idtransaction)} onClick={() => openDetail(data.idtransaction)} onPrint={() => openFile(data.idtransaction)} onContact={() => contactWhatsApp(data.transactionphone)}>
                      <TD>{newDate(data.transactioncreate, "id")}</TD>
                      <TD>{toTitleCase(data.transactionname)}</TD>
                      <TD type="code">{data.rscode}</TD>
                      <TD type="code">{data.noinvoice}</TD>
                      <TD type="number" isCopy>
                        {data.transactionphone}
                      </TD>
                      <TD>{data.payment}</TD>
                      <TD>{newPrice(data.totalpay)}</TD>
                      <TD>{orderStatusAlias(data.transactionstatus)}</TD>
                      <TD type="code">{data.voucher}</TD>
                      <TD>{toTitleCase(data.dentist)}</TD>
                      <TD>{toTitleCase(data.outlet_name)}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </DashboardBody>
            {isOrderShown && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />}
            {isFormOpen && (
              <SubmitForm formTitle={selectedMode === "update" ? "Perbarui Data Order" : "Tambah Data Order"} operation={selectedMode} fetching={isFormFetching} onSubmit={(e) => handleSubmit(e, "cudorder")} loading={isSubmitting} onClose={closeForm}>
                <InputWrap>
                  <Input id={`${pageid}-dentist`} variant="select" isSearchable radius="full" labelText="Dokter" placeholder="Pilih Dokter" name="dentist" value={inputData.dentist} options={branchDentistData.map((dentist) => ({ value: dentist.name_dentist, label: dentist.name_dentist.replace(`${dentist.id_branch} -`, "") }))} onSelect={(selectedValue) => handleOrderInputChange({ target: { name: "dentist", value: selectedValue } })} errorContent={errors.dentist} isRequired />
                  <Input
                    id={`${pageid}-type-payments`}
                    variant="select"
                    noEmptyValue
                    radius="full"
                    labelText="Tipe Pembayaran"
                    placeholder="Pilih tipe pembayaran"
                    name="typepayment"
                    value={inputData.typepayment}
                    options={[
                      { value: "cash", label: "Cash in Store" },
                      { value: "cashless", label: "Cashless (via Xendit)" },
                    ]}
                    onSelect={(selectedValue) => handleOrderInputChange({ target: { name: "typepayment", value: selectedValue } })}
                    errorContent={errors.typepayment}
                    isRequired
                  />
                  {inputData.typepayment && (
                    <Fragment>
                      {inputData.typepayment === "cashless" ? (
                        <Input
                          id={`${pageid}-method-payments`}
                          variant="select"
                          isSearchable
                          radius="full"
                          labelText="Metode Pembayaran"
                          placeholder={inputData.typepayment ? "Pilih metode pembayaran" : "Mohon pilih tipe dahulu"}
                          name="bank_code"
                          value={inputData.bank_code}
                          options={fvaListData.map((va) => ({ value: va.code, label: va.name }))}
                          onSelect={(selectedValue) => handleOrderInputChange({ target: { name: "bank_code", value: selectedValue } })}
                          errorContent={errors.bank_code}
                          isDisabled={inputData.typepayment ? false : true}
                        />
                      ) : (
                        <Input
                          id={`${pageid}-status-payments`}
                          variant="select"
                          noEmptyValue
                          radius="full"
                          labelText="Status Pembayaran"
                          placeholder={inputData.typepayment ? "Set status pembayaran" : "Mohon pilih tipe dahulu"}
                          name="status"
                          value={inputData.status}
                          options={[
                            { value: "0", label: "Pending" },
                            { value: "2", label: "Lunas" },
                          ]}
                          onSelect={(selectedValue) => handleOrderInputChange({ target: { name: "status", value: selectedValue } })}
                          errorContent={errors.status}
                          isDisabled={inputData.typepayment ? false : true}
                        />
                      )}
                    </Fragment>
                  )}
                </InputWrap>
                {inputData.order.map((subservice, index) => (
                  <InputWrap key={index}>
                    <Input
                      id={`${pageid}-name-${index}`}
                      variant="select"
                      isSearchable
                      radius="full"
                      labelText="Nama Layanan"
                      placeholder="Pilih Layanan"
                      name="service"
                      value={subservice.service}
                      options={allservicedata.map((service) => ({ value: service["Nama Layanan"].servicename, label: service["Nama Layanan"].servicename }))}
                      onSelect={(selectedValue) => handleOrderRowChange(index, { target: { name: "service", value: selectedValue } })}
                      errorContent={errors[`order.${index}.service`] ? errors[`order.${index}.service`] : ""}
                      isRequired
                    />
                    <Input
                      id={`${pageid}-type-name-${index}`}
                      variant="select"
                      isSearchable
                      radius="full"
                      labelText="Jenis Layanan"
                      placeholder={subservice.service ? "Pilih jenis layanan" : "Mohon pilih layanan dahulu"}
                      name="servicetype"
                      value={subservice.servicetype}
                      options={inputData.order[index].service && allservicedata.find((s) => s["Nama Layanan"].servicename === inputData.order[index].service)?.["Jenis Layanan"].map((type) => ({ value: type.servicetypename, label: type.servicetypename }))}
                      onSelect={(selectedValue) => handleOrderRowChange(index, { target: { name: "servicetype", value: selectedValue } })}
                      errorContent={errors[`order.${index}.servicetype`] ? errors[`order.${index}.servicetype`] : ""}
                      isRequired
                      isDisabled={inputData.order[index].service ? false : true}
                    />
                    <Input id={`${pageid}-type-price-${index}`} radius="full" labelText="Atur Harga" placeholder="Masukkan harga" type="number" name="price" value={subservice.price} onChange={(e) => handleOrderRowChange(index, e)} errorContent={errors[`order.${index}.price`] ? errors[`order.${index}.price`] : ""} isRequired />
                    <Button id={`${pageid}-delete-row-${index}`} variant="dashed" subVariant="icon" isTooltip size="sm" radius="full" color={index <= 0 ? "var(--color-red-30)" : "var(--color-red)"} iconContent={<ISTrash />} tooltipText="Hapus" onClick={() => handleRmvOrderRow(index)} isDisabled={index <= 0 ? true : false} />
                  </InputWrap>
                ))}
                <Button id={`${pageid}-add-row`} variant="line" size="sm" radius="full" color="var(--color-hint)" buttonText="Tambah Layanan" onClick={handleAddOrderRow} />
              </SubmitForm>
            )}
            {selectedOrderData && orderDetailData && isFileOpen && (
              <FileForm fetching={isFormFetching} onNext={exportToPDF} onClose={closeFile}>
                <Invoice ref={printRef} data={selectedOrderData} items={orderDetailData} />
              </FileForm>
            )}
          </Fragment>
        );
      case "PO PUSAT":
        return (
          <Fragment>
            <DashboardHead title={pagetitle} />
          </Fragment>
        );
      case "CALENDAR RESERVATION":
        const daysOfWeek = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jum'at", "Sabtu"];

        const getDaysInMonth = (year, month) => {
          return new Date(year, month + 1, 0).getDate();
        };
        const getFirstDayOfMonth = (year, month) => {
          return new Date(year, month, 1).getDay();
        };
        const formatDate = (year, month, day) => {
          return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        };

        const generateCalendar = () => {
          const year = currentDate.getFullYear();
          const month = currentDate.getMonth();
          const daysInMonth = getDaysInMonth(year, month);
          const firstDayOfMonth = getFirstDayOfMonth(year, month);
          const calendarDays = [];
          let dayCounter = 1;
          for (let i = 0; i < firstDayOfMonth; i++) {
            calendarDays.push(null);
          }
          while (dayCounter <= daysInMonth) {
            const date = formatDate(year, month, dayCounter);
            calendarDays.push({ day: dayCounter, events: eventsData[date] || [] });
            dayCounter++;
          }

          return calendarDays.map((dayObj, index) => (
            <div key={index} className={calendar.calendarDay} onClick={() => handleDayClick(dayObj)}>
              {dayObj ? (
                <Fragment>
                  <div className={calendar.dayNumber}>{dayObj.day}</div>
                  <div className={calendar.events}>
                    {dayObj.events.slice(0, 2).map((event, i) => (
                      <div key={i} className={calendar.event}>
                        {event.label}
                      </div>
                    ))}
                    {dayObj.events.length > 2 && <div className={calendar.moreEvents}>+{dayObj.events.length - 2} more events</div>}
                  </div>
                </Fragment>
              ) : null}
            </div>
          ));
        };

        const handlePrevMonth = () => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
        const handleNextMonth = () => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
        const handleDayClick = (dayObj) => {
          if (dayObj) {
            setSelectedDay(dayObj.day);
            setSelectedDayEvents(dayObj.events);
            setIsModalOpen(true);
          }
        };

        const closeModal = () => {
          setIsModalOpen(false);
          setSelectedDayEvents([]);
        };

        return (
          <Fragment>
            <DashboardHead title={`Jadwal Reservasi ${currentDate.toLocaleString("default", { month: "long" })} ${currentDate.getFullYear()}`} />
            <DashboardToolbar>
              <DashboardTool>{level === "admin" && <Input id={`${pageid}-outlet`} isLabeled={false} variant="select" isSearchable radius="full" placeholder="Pilih Cabang" value={selectedBranch} options={allBranchData.map((branch) => ({ value: branch.idoutlet, label: branch.outlet_name.replace("E DENTAL - DOKTER GIGI", "CABANG") }))} onSelect={handleBranchChange} />}</DashboardTool>
              <DashboardTool>
                <Button id={`${pageid}-prev-month`} radius="full" variant="line" color="var(--color-primary)" buttonText="Prev Month" onClick={handlePrevMonth} />
                <Button id={`${pageid}-next-month`} radius="full" buttonText="Next Month" onClick={handleNextMonth} />
              </DashboardTool>
            </DashboardToolbar>
            <DashboardBody>
              <div className={calendar.calendarGrid}>
                {daysOfWeek.map((day) => (
                  <div key={day} className={calendar.calendarDayHeader}>
                    {day}
                  </div>
                ))}
                {generateCalendar()}
              </div>
            </DashboardBody>
            <Modal isOpen={isModalOpen} onClose={closeModal} events={selectedDayEvents} day={`${selectedDay} ${currentDate.toLocaleString("default", { month: "long" })}`} />
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
  }, [slug, bookedHoursData]);

  useEffect(() => {
    fetchData();
  }, [slug, currentPage, limit, status, slug === "CALENDAR RESERVATION" ? selectedBranch : null]);

  useEffect(() => {
    fetchAdditionalData();
  }, []);

  useEffect(() => {
    setLimit(5);
    setCurrentPage(1);
    setSelectedMode("add");
    setSortOrder("asc");
  }, [slug]);

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
