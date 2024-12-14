import React, { Fragment, useState, useEffect, useRef, useCallback } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useContent, useFormat, useDevmode } from "@ibrahimstudio/react";
import { Input } from "@ibrahimstudio/input";
import { Select } from "@ibrahimstudio/select";
import { Textarea } from "@ibrahimstudio/textarea";
import { Button } from "@ibrahimstudio/button";
import { Pagination } from "@ibrahimstudio/pagination";
import html2pdf from "html2pdf.js";
import moment from "moment-timezone";
import * as XLSX from "xlsx";
import { useAuth } from "../libs/securities/auth";
import { useApi } from "../libs/apis/office";
import { useNotifications } from "../components/feedbacks/context/notifications-context";
import { useSearch } from "../libs/plugins/handler";
import { getCurrentDate, getNormalPhoneNumber, exportToExcel, getNestedValue, inputValidator, emailValidator, generateExcel } from "../libs/plugins/controller";
import { inputSchema, errorSchema } from "../libs/sources/common";
import { useOptions, useAlias } from "../libs/plugins/helper";
import Pages from "../components/frames/pages";
import { DashboardContainer, DashboardHead, DashboardToolbar, DashboardTool, DashboardBody } from "./overview-dashboard";
import Table, { THead, TBody, TR, TH, TD } from "../components/contents/table";
import Calendar, { CalendarDay, CalendarDate, DateEvent, EventModal } from "../components/contents/calendar";
import { SubmitForm, FileForm } from "../components/input-controls/forms";
import OnpageForm, { FormHead, FormFooter } from "../components/input-controls/onpage-forms";
import Fieldset from "../components/input-controls/inputs";
import TabGroup from "../components/input-controls/tab-group";
import { Search, Plus, Export, HChevron, Check, NewTrash, Filter } from "../components/contents/icons";
import { LoadingContent } from "../components/feedbacks/screens";
import Invoice from "../components/contents/invoice";

const DashboardSlugPage = ({ parent, slug }) => {
  const navigate = useNavigate();
  const printRef = useRef();
  const { newDate, newPrice } = useFormat();
  const { log } = useDevmode();
  const { toTitleCase, toPathname } = useContent();
  const { isLoggedin, secret, cctr, idoutlet, level } = useAuth();
  const { apiRead, apiCrud } = useApi();
  const { showNotifications } = useNotifications();
  const { limitopt, genderopt, levelopt, usrstatopt, unitopt, houropt, postatopt, pocstatopt, reservstatopt, paymentstatopt, paymenttypeopt, orderstatopt, reportstatopt } = useOptions();
  const { paymentAlias, orderAlias, poAlias, usrstatAlias, reservAlias } = useAlias();

  const pageid = parent && slug ? `slug-${toPathname(parent)}-${toPathname(slug)}` : "slug-dashboard";
  const pagetitle = slug ? `${toTitleCase(slug)}` : "Slug Dashboard";
  const pagepath = parent && slug ? `/${toPathname(parent)}/${toPathname(slug)}` : "/";
  const MIN_AMOUNT = 10000;

  const [limit, setLimit] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isFormFetching, setIsFormFetching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [selectedMode, setSelectedMode] = useState("add");
  const [selectedImage, setSelectedImage] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isFileOpen, setIsFileOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [status, setStatus] = useState(0);
  const [custExist, setCustExist] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [startDate, setStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)));
  const [endDate, setEndDate] = useState(new Date());

  const [custData, setCustData] = useState([]);
  const [allCustData, setAllCustData] = useState([]);
  const [selectedCust, setSelectedCust] = useState(null);
  const [servicedata, setservicedata] = useState([]);
  const [allservicedata, setAllservicedata] = useState([]);
  const [branchData, setBranchData] = useState([]);
  const [allBranchData, setAllBranchData] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("0");
  const [selectedBranch, setSelectedBranch] = useState(idoutlet);
  const [selectedDentist, setSelectedDentist] = useState(null);
  const [allDentistData, setAllDentistData] = useState([]);
  const [dentistData, setDentistData] = useState([]);
  const [branchDentistData, setBranchDentistData] = useState([]);
  const [stockData, setStockData] = useState([]);
  const [stockOutData, setStockOutData] = useState([]);
  const [allStockData, setAllStockData] = useState([]);
  const [categoryStockData, setCategoryStockData] = useState([]);
  const [inPOData, setInPOData] = useState([]);
  const [centralPOData, setCentralPOData] = useState([]);
  const [reservData, setReservData] = useState([]);
  const [bookedHoursData, setBookedHoursData] = useState([]);
  const [availHoursData, setAvailHoursData] = useState([]);
  const [orderData, setOrderData] = useState([]);
  const [fvaListData, setFvaListData] = useState([]);
  const [selectedOrderData, setSelectedOrderData] = useState(null);
  const [orderDetailData, setOrderDetailData] = useState(null);
  const [eventsData, setEventsData] = useState([]);
  const [selectedDayEvents, setSelectedDayEvents] = useState([]);
  const [onPageTabId, setOnpageTabId] = useState("1");
  const [medicRcdData, setMedicRcdData] = useState([]);
  const [historyReservData, setHistoryReservData] = useState([]);
  const [historyOrderData, setHistoryOrderData] = useState([]);
  const [userData, setUserData] = useState([]);
  const [stockExpData, setStockExpData] = useState([]);
  const [diagnoseData, setDiagnoseData] = useState([]);
  const [orderRData, setOrderRData] = useState([]);
  const [conditionData, setConditionData] = useState([]);
  const [practiciData, setPracticiData] = useState([]);
  const [orgData, setOrgData] = useState([]);
  const [provinceData, setProvinceData] = useState([]);
  const [cityData, setCityData] = useState([]);
  const [districtData, setDistrictData] = useState([]);
  const [villageData, setVillageData] = useState([]);
  const [locationData, setLocationData] = useState([]);
  const [patientData, setPatientData] = useState([]);
  const [invoiceData, setInvoiceData] = useState([]);
  const [credData, setCredData] = useState([]);
  const [outletFilter, setOutletFilter] = useState("999");
  const [dentistFilter, setDentistFilter] = useState("999");

  const [inputData, setInputData] = useState({ ...inputSchema });
  const [onpageData, setOnpageData] = useState({ ...inputSchema });
  const [errors, setErrors] = useState({ ...errorSchema });

  const handlePageChange = (page) => setCurrentPage(page);
  const handleBranchChange = (value) => setSelectedBranch(value);
  const handleDentistChange = (value) => setSelectedDentist(value);
  const handleImageSelect = (file) => setSelectedImage(file);
  const openDetail = (params) => navigate(`${pagepath}/${params.toLowerCase()}`);
  const handleABranchChange = async (value) => {
    setSelectedBranch(value);
    const branchdata = allBranchData.find((item) => item.idoutlet === value);
    if (branchdata) {
      const formData = new FormData();
      formData.append("data", JSON.stringify({ secret, kodeoutlet: branchdata.cctr }));
      const dentistdata = await apiRead(formData, "office", "viewdentistoutlet");
      if (dentistdata && dentistdata.data && dentistdata.data.length > 0) {
        setAllDentistData(dentistdata.data);
        setSelectedDentist(dentistdata.data[0].id_dentist);
      } else {
        setAllDentistData([]);
        setSelectedDentist(null);
      }
    } else {
      setAllDentistData([]);
      setSelectedDentist(null);
    }
  };

  const formatISODate = (date) => {
    return date.toISOString().slice(0, 16);
  };

  const getAvailHours = async (date) => {
    try {
      const formData = new FormData();
      formData.append("tgl", date);
      formData.append("idoutlet", idoutlet);
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

  const restoreInputState = () => {
    setInputData({ ...inputSchema });
    setErrors({ ...errorSchema });
    setCustExist(false);
  };

  const handleLimitChange = (value) => {
    setLimit(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value) => {
    setStatus(value);
    setCurrentPage(1);
  };

  const handleInputChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setInputData((prevState) => ({ ...prevState, [name]: value }));
      setOnpageData((prevState) => ({ ...prevState, [name]: value }));
      setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
      const validateServiceName = () => {
        const newvalue = value.toLowerCase();
        const serviceexists = allservicedata.some((item) => {
          const servicename = (item["Nama Layanan"] && item["Nama Layanan"].servicename).toLowerCase();
          return servicename === newvalue;
        });
        if (serviceexists) {
          setErrors((prevErrors) => ({ ...prevErrors, service: "Layanan dengan nama yang sama sudah ada." }));
        }
      };
      const validatePhone = () => {
        const phoneRegex = /^0\d*$/;
        if (phoneRegex.test(value)) {
          const matcheddata = allCustData.find((item) => item.userphone === value);
          if (matcheddata) {
            setCustExist(true);
            setInputData((prevState) => ({ ...prevState, name: matcheddata.username, email: matcheddata.useremail }));
          } else {
            setCustExist(false);
            setInputData((prevState) => ({ ...prevState, name: "", email: "" }));
          }
          setErrors((prevErrors) => ({ ...prevErrors, phone: "" }));
        } else {
          setErrors((prevErrors) => ({ ...prevErrors, phone: "Phone number must start with 0 and contain only numbers." }));
        }
      };
      const validateEmail = () => {
        if (!emailValidator(value)) {
          setErrors((prevErrors) => ({ ...prevErrors, email: "Format email salah" }));
        }
      };
      const updateSubService = () => {
        const selectedservice = allservicedata.find((s) => s["Nama Layanan"].servicename === inputData.service);
        const selectedsubservice = selectedservice["Jenis Layanan"].find((type) => type.servicetypename === value);
        setInputData((prevState) => ({ ...prevState, id: selectedsubservice.idservicetype, price: inputData.service === "RESERVATION" ? selectedsubservice.serviceprice : 0 }));
        log(`id servicetype set to ${selectedsubservice.idservicetype}, price: ${inputData.service === "RESERVATION" ? selectedsubservice.serviceprice : 0}`);
      };
      const validatePrice = () => {
        if (value < MIN_AMOUNT) {
          setErrors((prevErrors) => ({ ...prevErrors, price: `The minimum amount is ${MIN_AMOUNT.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}` }));
        }
      };
      const validateMedicalRecords = () => {
        const phoneRegex = /^0\d*$/;
        if (phoneRegex.test(value)) {
          const matcheddata = allCustData.find((item) => item.userphone === value);
          if (matcheddata && matcheddata.idauthuser !== selectedCust) {
            setCustExist(true);
            setErrors((prevErrors) => ({ ...prevErrors, phone: "Customer sudah terdaftar." }));
          } else {
            setCustExist(false);
            setErrors((prevErrors) => ({ ...prevErrors, phone: "" }));
          }
        } else {
          setErrors((prevErrors) => ({ ...prevErrors, phone: "Phone number must start with 0 and contain only numbers." }));
        }
      };
      const getCityID = async (provid) => {
        const formData = new FormData();
        formData.append("data", JSON.stringify({ secret, idprovincie: provid }));
        setIsSubmitting(true);
        try {
          const response = await apiRead(formData, "satusehat", "viewcity");
          setCityData(response && response.data && response.data.length > 0 ? response.data : []);
        } catch (error) {
          console.error("error:", error);
        } finally {
          setIsSubmitting(false);
        }
      };
      const getDistrictID = async (cityid) => {
        const formData = new FormData();
        formData.append("data", JSON.stringify({ secret, idcity: cityid }));
        setIsSubmitting(true);
        try {
          const response = await apiRead(formData, "satusehat", "viewdistrict");
          setDistrictData(response && response.data && response.data.length > 0 ? response.data : []);
        } catch (error) {
          console.error("error:", error);
        } finally {
          setIsSubmitting(false);
        }
      };
      const getVillageID = async (distrid) => {
        const formData = new FormData();
        formData.append("data", JSON.stringify({ secret, iddistrict: distrid }));
        setIsSubmitting(true);
        try {
          const response = await apiRead(formData, "satusehat", "viewvillage");
          setVillageData(response && response.data && response.data.length > 0 ? response.data : []);
        } catch (error) {
          console.error("error:", error);
        } finally {
          setIsSubmitting(false);
        }
      };
      if (slug === "LAYANAN" && name === "service") {
        validateServiceName();
      } else if (slug === "RESERVATION") {
        if (name === "phone") {
          validatePhone();
        } else if (name === "email") {
          validateEmail();
        } else if (name === "sub_service") {
          updateSubService();
        } else if (name === "date") {
          getAvailHours(value);
        } else if (name === "price") {
          validatePrice();
        }
      } else if (slug === "ORDER CUSTOMER" && name === "typepayment") {
        setInputData((prevState) => ({ ...prevState, [value === "cash" ? "bank_code" : "status"]: value === "cash" ? "CASH" : "0" }));
      } else if (slug === "REKAM MEDIS" && onPageTabId === "1" && name === "phone") {
        validateMedicalRecords();
      } else if (slug === "ORGANIZATION" || slug === "LOCATION") {
        if (name === "province" && value !== "") {
          getCityID(value);
        } else if (name === "city" && value !== "") {
          getDistrictID(value);
        } else if (name === "district" && value !== "") {
          getVillageID(value);
        }
      }
    },
    [setInputData, setOnpageData, setErrors, setCustExist, slug, onPageTabId, inputData, allservicedata, allCustData, MIN_AMOUNT]
  );

  const handleRowChange = (field, index, e) => {
    const { name, value } = e.target;
    const updatedvalues = [...inputData[field]];
    const updatederrors = errors[field] ? [...errors[field]] : [];
    updatedvalues[index] = { ...updatedvalues[index], [name]: value };
    if (field === "order" && name === "servicetype" && value !== "RESERVATION") {
      const selectedService = updatedvalues[index].service;
      const serviceData = allservicedata.find((service) => service["Nama Layanan"].servicename === selectedService);
      if (serviceData) {
        const selectedType = serviceData["Jenis Layanan"].find((type) => type.servicetypename === value);
        if (selectedType) {
          updatedvalues[index].price = selectedType.serviceprice || "";
        }
      }
    }
    if (field === "postock" && name === "itemname") {
      const selectedItem = allStockData.find((s) => s.itemname === value);
      if (selectedItem) {
        updatedvalues[index].idstock = selectedItem.idstock || "";
        updatedvalues[index].sku = selectedItem.sku || "";
      }
    }
    if (field === "alkesitem" && name === "itemname") {
      const selectedItem = allStockData.find((s) => s.itemname === value);
      if (selectedItem) {
        updatedvalues[index].idstock = selectedItem.idstock || "";
        updatedvalues[index].sku = selectedItem.sku || "";
        updatedvalues[index].unit = selectedItem.unit || "";
      }
    }
    if (field === "stockexp" && name === "itemname") {
      const selectedItem = allStockData.find((s) => s.itemname === value);
      if (selectedItem) {
        updatedvalues[index].idstock = selectedItem.idstock || "";
        updatedvalues[index].sku = selectedItem.sku || "";
        updatedvalues[index].unit = selectedItem.unit || "";
      }
    }
    if (!updatederrors[index]) {
      updatederrors[index] = {};
    } else {
      updatederrors[index] = { ...updatederrors[index], [name]: "" };
    }
    setInputData({ ...inputData, [field]: updatedvalues });
    setErrors({ ...errors, [field]: updatederrors });
  };

  const handleAddRow = (field) => {
    let newitems = {};
    if (field === "layanan") {
      newitems = { servicetype: "", price: "" };
    } else if (field === "order") {
      newitems = { service: "", servicetype: "", price: "" };
    } else if (field === "postock") {
      newitems = { idstock: "", itemname: "", sku: "", stockin: "", note: "" };
    } else if (field === "diagdetail") {
      newitems = { diagnosisdetail: "" };
    } else if (field === "stockexp") {
      newitems = { idstock: "", categorystock: "", subcategorystock: "", sku: "", itemname: "", unit: "", qty: "", status: "expire" };
    } else if (field === "alkesitem") {
      newitems = { idstock: "", categorystock: "", subcategorystock: "", sku: "", itemname: "", unit: "", qty: "", status: "" };
    }
    const updatedvalues = [...inputData[field], newitems];
    const updatederrors = errors[field] ? [...errors[field], newitems] : [{}];
    setInputData({ ...inputData, [field]: updatedvalues });
    setErrors({ ...errors, [field]: updatederrors });
  };

  const handleRmvRow = (field, index) => {
    const updatedrowvalue = [...inputData[field]];
    const updatedrowerror = errors[field] ? [...errors[field]] : [];
    updatedrowvalue.splice(index, 1);
    updatedrowerror.splice(index, 1);
    setInputData({ ...inputData, [field]: updatedrowvalue });
    setErrors({ ...errors, [field]: updatedrowerror });
  };

  const handleSort = (data, setData, params, type) => {
    const newData = [...data];
    const compare = (a, b) => {
      const valueA = getNestedValue(a, params);
      const valueB = getNestedValue(b, params);
      if (type === "date") {
        return new Date(valueA) - new Date(valueB);
      } else if (type === "number") {
        return valueA - valueB;
      } else if (type === "text") {
        return valueA.localeCompare(valueB);
      } else {
        return 0;
      }
    };
    if (!sortOrder || sortOrder === "desc") {
      newData.sort(compare);
      setSortOrder("asc");
    } else {
      newData.sort((a, b) => compare(b, a));
      setSortOrder("desc");
    }
    setData(newData);
  };

  const handleSearch = async (e) => {
    setSearchTerm(e.target.value);
  };

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
      const orderdata = orderData.find((item) => item["order"].idtransaction === id);
      setSelectedOrderData(orderdata ? orderdata : null);
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
    const formData = new FormData();
    const addtFormData = new FormData();
    let data;
    let addtdata;
    setIsFetching(true);
    try {
      const offset = (currentPage - 1) * limit;
      formData.append("data", JSON.stringify({ secret, limit, hal: offset, idoutlet: selectedBranch }));
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
        case "MANAJEMEN USER":
          data = await apiRead(formData, "office", "viewuser");
          if (data && data.data && data.data.length > 0) {
            setUserData(data.data);
            setTotalPages(data.TTLPage);
          } else {
            setUserData([]);
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
        case "DIAGNOSA":
          addtFormData.append("data", JSON.stringify({ secret }));
          data = await apiRead(addtFormData, "office", "viewdiagnosis");
          if (data && data.data && data.data.length > 0) {
            setDiagnoseData(data.data);
          } else {
            setDiagnoseData([]);
          }
          break;
        case "KONDISI GIGI":
          addtFormData.append("data", JSON.stringify({ secret }));
          data = await apiRead(addtFormData, "office", "viewtooth");
          if (data && data.data && data.data.length > 0) {
            setConditionData(data.data);
          } else {
            setConditionData([]);
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
        case "ORDER REPORT":
          addtFormData.append("data", JSON.stringify({ secret, idoutlet: outletFilter, status: selectedStatus, stardate: formatISODate(startDate), enddate: formatISODate(endDate), dentist: dentistFilter }));
          addtFormData.append("limit", limit);
          addtFormData.append("hal", offset);
          addtdata = await apiRead(addtFormData, "office", "vieworderreport");
          if (addtdata && addtdata.data && addtdata.data.length > 0) {
            setOrderRData(addtdata.data);
            setTotalPages(outletFilter === "999" || dentistFilter === "999" ? addtdata.TTLPage : null);
          } else {
            setOrderRData([]);
            setTotalPages(0);
          }
          break;
        case "STOCK OUT":
          data = await apiRead(formData, "office", "viewstockout");
          if (data && data.data && data.data.length > 0) {
            setStockOutData(data.data);
            setTotalPages(data.TTLPage);
          } else {
            setStockOutData([]);
            setTotalPages(0);
          }
          break;
        case "STOCK EXPIRE":
          data = await apiRead(formData, "office", "viewstockexpire");
          if (data && data.data && data.data.length > 0) {
            setStockExpData(data.data);
            setTotalPages(data.TTLPage);
          } else {
            setStockExpData([]);
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
        case "PO PUSAT":
          addtFormData.append("data", JSON.stringify({ secret, limit, hal: offset, status }));
          data = await apiRead(addtFormData, "office", "viewpostock");
          if (data && data.data && data.data.length > 0) {
            setCentralPOData(data.data);
            setTotalPages(data.TTLPage);
          } else {
            setCentralPOData([]);
            setTotalPages(0);
          }
          break;
        case "PO MASUK":
          addtFormData.append("data", JSON.stringify({ secret, limit, hal: offset, status }));
          data = await apiRead(addtFormData, "office", "viewpostock");
          if (data && data.data && data.data.length > 0) {
            setInPOData(data.data);
            setTotalPages(data.TTLPage);
          } else {
            setInPOData([]);
            setTotalPages(0);
          }
          break;
        case "REKAM MEDIS":
          if (selectedCust) {
            addtFormData.append("data", JSON.stringify({ secret, iduser: selectedCust }));
            switch (onPageTabId) {
              case "2":
                data = await apiRead(addtFormData, "office", "viewhistoryresev");
                if (data && data.data && data.data.length > 0) {
                  setHistoryReservData(data.data);
                } else {
                  setHistoryReservData([]);
                }
                break;
              case "3":
                data = await apiRead(addtFormData, "office", "viewhistoryorder2");
                if (data && data.data && data.data.length > 0) {
                  setHistoryOrderData(data.data);
                } else {
                  setHistoryOrderData([]);
                }
                break;
              case "4":
                data = await apiRead(addtFormData, "office", "viewmedics");
                if (data && data.data && data.data.length > 0) {
                  setMedicRcdData(data.data);
                } else {
                  setMedicRcdData([]);
                }
                break;
              default:
                break;
            }
          }
          break;
        case "XENDIT":
          data = await apiRead(formData, "office", "viewxendit");
          if (data && data.data && data.data.length > 0) {
            setInvoiceData(data.data);
            setTotalPages(data.TTLPage);
          } else {
            setInvoiceData([]);
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
          data = await apiRead(formData, "office", "vieworder2");
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
              const time = event.reservationtime;
              const status = event.status_reservation;
              const label = `${event.reservationtime} | ${event.rscode} - ${toTitleCase(event.name)}`;
              if (!acc[date]) {
                acc[date] = [];
              }
              acc[date].push({ ...event, label, time, status });
              acc[date].sort((a, b) => a.time.localeCompare(b.time));
              return acc;
            }, {});
            setEventsData(mutatedevents);
          } else {
            setEventsData([]);
          }
          break;
        case "PRACTITIONER":
          addtFormData.append("data", JSON.stringify({ secret }));
          data = await apiRead(addtFormData, "satusehat", "viewpractitioner");
          if (data && data.data && data.data.length > 0) {
            setPracticiData(data.data);
          } else {
            setPracticiData([]);
          }
          break;
        case "ORGANIZATION":
          addtFormData.append("data", JSON.stringify({ secret }));
          data = await apiRead(addtFormData, "satusehat", "vieworganization");
          if (data && data.data && data.data.length > 0) {
            setOrgData(data.data);
          } else {
            setOrgData([]);
          }
          break;
        case "LOCATION":
          addtFormData.append("data", JSON.stringify({ secret }));
          data = await apiRead(addtFormData, "satusehat", "viewlocation");
          addtdata = await apiRead(addtFormData, "satusehat", "vieworganization");
          setLocationData(data && data.data && data.data.length > 0 ? data.data : []);
          setOrgData(addtdata && addtdata.data && addtdata.data.length > 0 ? addtdata.data : []);
          break;
        case "CREDENTIAL":
          addtFormData.append("data", JSON.stringify({ secret, idoutlet: selectedBranch }));
          data = await apiRead(addtFormData, "satusehat", "viewcredential");
          if (data && data.data && data.data.length > 0) {
            setCredData(data.data);
          } else {
            setCredData([]);
          }
          break;
        case "PATIENT":
          addtFormData.append("data", JSON.stringify({ secret }));
          data = await apiRead(formData, "satusehat", "viewpatient");
          const practidata = await apiRead(addtFormData, "satusehat", "viewpractitioner");
          const organidata = await apiRead(addtFormData, "satusehat", "vieworganization");
          const locatidata = await apiRead(addtFormData, "satusehat", "viewlocation");
          setPracticiData(practidata && practidata.data && practidata.data.length > 0 ? practidata.data : []);
          setOrgData(organidata && organidata.data && organidata.data.length > 0 ? organidata.data : []);
          setLocationData(locatidata && locatidata.data && locatidata.data.length > 0 ? locatidata.data : []);
          if (data && data.data && data.data.length > 0) {
            setPatientData(data.data);
            setTotalPages(data.TTLPage);
          } else {
            setPatientData([]);
            setTotalPages(0);
          }
          break;
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
    setIsOptimizing(true);
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
      const staticdata = [{ code: "INVOICE", country: "ID", currency: "IDR", is_activated: true, name: "Invoice Xendit" }];
      const mergedvadata = [...staticdata, ...allfvadata];
      const filteredfvadata = mergedvadata.filter((va) => va.is_activated === true);
      if (filteredfvadata && filteredfvadata.length > 0) {
        setFvaListData(filteredfvadata);
      } else {
        setFvaListData([]);
      }
      addtFormData.append("data", JSON.stringify({ secret, idoutlet: selectedBranch }));
      const allcustdata = await apiRead(addtFormData, "office", "searchcustomer");
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
      const stockdata = await apiRead(formData, "office", "searchstock");
      if (stockdata && stockdata.data && stockdata.data.length > 0) {
        setAllStockData(stockdata.data);
      } else {
        setAllStockData([]);
      }
      const provincedata = await apiRead(formData, "satusehat", "viewprovincie");
      if (provincedata && provincedata.data && provincedata.data.length > 0) {
        setProvinceData(provincedata.data);
      } else {
        setProvinceData([]);
      }
    } catch (error) {
      showNotifications("danger", errormsg);
      console.error(errormsg, error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const fetchSearchData = async () => {
    const errormsg = "Terjadi kesalahan saat memuat hasil pencarian. Mohon periksa koneksi internet anda dan coba lagi.";
    const formData = new FormData();
    setIsFetching(true);
    try {
      if (searchTerm === "") {
        return;
      }
      let formdata;
      if (slug === "PO MASUK") {
        formdata = { secret, search: searchTerm, status: status.toString() };
      } else {
        formdata = { secret, search: searchTerm, idoutlet: selectedBranch };
      }
      formData.append("data", JSON.stringify(formdata));
      let endpoint;
      switch (slug) {
        case "RESERVATION":
          endpoint = "searchreservation";
          break;
        case "ORDER CUSTOMER":
          endpoint = "searchorder";
          break;
        case "XENDIT":
          endpoint = "searchxendit";
          break;
        case "STOCK":
          endpoint = "searchstockall";
          break;
        case "PO MASUK":
          endpoint = "searchpostock";
          break;
        case "DATA CUSTOMER":
          endpoint = "searchcustomerall";
          break;
        default:
          break;
      }
      const result = await apiRead(formData, "office", endpoint);
      setSearchResult(result && result.data && result.data.length > 0 ? result.data : []);
    } catch (error) {
      showNotifications("danger", errormsg);
      console.error(errormsg, error);
    } finally {
      setIsFetching(false);
    }
  };

  const postatus = [
    { label: "Open", onClick: () => handleStatusChange(0), active: status === 0 },
    { label: "Sent", onClick: () => handleStatusChange(2), active: status === 2 },
    { label: "Done", onClick: () => handleStatusChange(3), active: status === 3 },
    { label: "Rejected", onClick: () => handleStatusChange(4), active: status === 4 },
  ];

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
    const formData = new FormData();
    let data;
    let switchedData;
    setIsFormFetching(true);
    try {
      switch (slug) {
        case "MANAJEMEN USER":
          switchedData = currentData(userData, "idauth");
          log(`id ${slug} data switched:`, switchedData.idauth);
          setInputData({ outlet: switchedData.idoutlet, username: switchedData.username, level: switchedData.level, status: switchedData.apiauth_status });
          break;
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
          setInputData({ name: switchedData.outlet_name, phone: switchedData.outlet_phone, address: switchedData.outlet_address, postcode: switchedData.postcode, main_region: switchedData.mainregion, region: switchedData.outlet_region, cctr_group: switchedData.cctr_group, cctr: switchedData.cctr, coordinate: switchedData.coordinate });
          break;
        case "KONDISI GIGI":
          switchedData = currentData(conditionData, "idtooth");
          log(`id ${slug} data switched:`, switchedData.idtooth);
          setInputData({ name: switchedData.singkatan, desc: switchedData.arti, note: switchedData.keterangan });
          break;
        case "DENTIST":
          switchedData = currentData(dentistData, "id_dentist");
          log(`id ${slug} data switched:`, switchedData.id_dentist);
          setInputData({ cctr: switchedData.id_branch, name: switchedData.name_dentist, sip: switchedData.sip, phone: switchedData.phone, nik: switchedData.nik });
          break;
        case "PO PUSAT":
          switchedData = currentData(centralPOData, "PO Stock.idpostock");
          log(`id ${slug} data switched:`, switchedData["PO Stock"].idpostock);
          setInputData({ id: switchedData["PO Stock"].idpostock, status: switchedData["PO Stock"].statusstock });
          break;
        case "PO MASUK":
          switchedData = currentData(inPOData, "PO Stock.idpostock");
          log(`id ${slug} data switched:`, switchedData["PO Stock"].idpostock);
          setInputData({ id: switchedData["PO Stock"].idpostock, status: switchedData["PO Stock"].statusstock, postock: switchedData["Detail PO"].map((item) => ({ idstock: item.idpostockdetail, itemname: item.itemname, sku: item.sku, stockin: item.qty, note: item.note })) });
          break;
        case "RESERVATION":
          switchedData = currentData(reservData, "idreservation");
          log(`id ${slug} data switched:`, switchedData.idreservation);
          setInputData({ status: switchedData.status_reservation, statuspayment: switchedData.status_dp });
          break;
        case "ORDER CUSTOMER":
          switchedData = currentData(orderData, "idtransaction");
          log(`id ${slug} data switched:`, switchedData.idtransaction);
          formData.append("data", JSON.stringify({ secret, idtransaction: params }));
          data = await apiRead(formData, "office", "viewdetailorder");
          const orderdetaildata = data.data;
          if (data && orderdetaildata && orderdetaildata.length > 0) {
            if (switchedData.payment === "CASH") {
              setInputData({ name: switchedData.transactionname, phone: switchedData.transactionphone, id: switchedData.idtransaction, dentist: switchedData.dentist, typepayment: "cash", bank_code: "CASH", status: switchedData.transactionstatus, order: orderdetaildata.map((order) => ({ service: order.service, servicetype: order.servicetype, price: order.price })) });
            } else {
              setInputData({ name: switchedData.transactionname, phone: switchedData.transactionphone, id: switchedData.idtransaction, dentist: switchedData.dentist, typepayment: "cashless", bank_code: switchedData.payment, status: switchedData.transactionstatus, order: orderdetaildata.map((order) => ({ service: order.service, servicetype: order.servicetype, price: order.price })) });
            }
          }
          break;
        case "CREDENTIAL":
          switchedData = currentData(credData, "idcredential");
          log(`id ${slug} data switched:`, switchedData.idcredential);
          setInputData({ id: switchedData.idcredential, outlet: switchedData.idoutlet, client_id: switchedData.clientid, secret_id: switchedData.secretid });
          log(`id: ${switchedData.idcredential}, outlet: ${switchedData.idoutlet}, client_id: ${switchedData.clientid}, secret_id: ${switchedData.secretid}`);
          break;
        case "LOCATION":
          switchedData = currentData(orgData, "id");
          log(`id ${slug} data switched:`, switchedData.id);
          setInputData({ id: switchedData.id, phone: switchedData.phone, email: switchedData.email, address: switchedData.address, city_name: switchedData.cityname, postcode: switchedData.postalCode, province: switchedData.province, city: switchedData.city, district: switchedData.district, village: switchedData.village, rt: "", rw: "" });
          log(`id: ${switchedData.id}, phone: ${switchedData.phone}, email: ${switchedData.email}, address: ${switchedData.address}, city_name: ${switchedData.cityname}, postcode: ${switchedData.postalCode}, province: ${switchedData.province}, city: ${switchedData.city}, district: ${switchedData.district}, village: ${switchedData.village}`);
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

  const handleSubmit = async (e, endpoint, scope = "office") => {
    e.preventDefault();
    let requiredFields = [];
    switch (slug) {
      case "MANAJEMEN USER":
        requiredFields = ["username", "level", "status"];
        break;
      case "LAYANAN":
        requiredFields = ["service", "layanan.servicetype", "layanan.price"];
        break;
      case "CABANG EDENTAL":
        requiredFields = ["region", "name", "address", "phone", "main_region", "postcode", "cctr_group", "cctr", "coordinate"];
        break;
      case "DIAGNOSA":
        requiredFields = ["diagnosecode", "diagdetail.diagnosisdetail"];
        break;
      case "KONDISI GIGI":
        requiredFields = ["name", "desc"];
        break;
      case "DENTIST":
        requiredFields = ["cctr", "name", "sip", "phone", "nik"];
        break;
      case "STOCK EXPIRE":
        requiredFields = ["stockexp.categorystock", "stockexp.subcategorystock", "stockexp.itemname", "stockexp.unit", "stockexp.qty", "stockexp.status"];
        break;
      case "STOCK":
        requiredFields = ["category", "sub_category", "name", "unit", "count", "value"];
        break;
      case "PO PUSAT":
        if (selectedMode === "update") {
          requiredFields = [];
        } else {
          requiredFields = ["postock.itemname", "postock.sku", "postock.stockin"];
        }
        break;
      case "REKAM MEDIS":
        switch (onPageTabId) {
          case "1":
            requiredFields = ["name", "phone", "email", "birth", "nik", "address", "gender"];
            break;
          case "4":
            requiredFields = ["birth"];
            break;
          default:
            break;
        }
        break;
      case "RESERVATION":
        if (selectedMode === "update") {
          requiredFields = [];
        } else {
          if (inputData.service === "RESERVATION") {
            requiredFields = ["name", "phone", "email", "service", "sub_service", "date", "time", "price", "bank_code"];
          } else {
            requiredFields = ["name", "phone", "email", "service", "sub_service", "date", "time"];
          }
        }
        break;
      case "ORDER CUSTOMER":
        requiredFields = ["name", "phone", "dentist", "order.service", "order.servicetype", "order.price"];
        break;
      case "PRACTITIONER":
        requiredFields = ["city", "province", "district", "village", "rt", "rw", "address", "birth_date", "gender"];
        break;
      case "ORGANIZATION":
        requiredFields = ["name", "phone", "email", "address", "city_name", "postcode", "province", "city", "district", "village"];
        break;
      case "CREDENTIAL":
        requiredFields = ["outlet", "client_id", "secret_id"];
        break;
      default:
        requiredFields = [];
        break;
    }
    let validationErrors;
    if (slug === "REKAM MEDIS" && onPageTabId === "1") {
      validationErrors = inputValidator(onpageData, requiredFields);
    } else {
      validationErrors = inputValidator(inputData, requiredFields);
    }
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
        case "MANAJEMEN USER":
          submittedData = { secret, idoutlet: inputData.outlet, username: inputData.username, password: inputData.password, level: inputData.level, status: inputData.status };
          break;
        case "LAYANAN":
          submittedData = { secret, service: inputData.service, layanan: inputData.layanan };
          break;
        case "CABANG EDENTAL":
          submittedData = { secret, region: inputData.region, name: inputData.name, address: inputData.address, phone: inputData.phone, mainregion: inputData.main_region, postcode: inputData.postcode, cctr_group: inputData.cctr_group, cctr: inputData.cctr, coordinate: inputData.coordinate };
          break;
        case "DIAGNOSA":
          submittedData = { secret, diagnosiscode: inputData.diagnosecode, detail: inputData.diagdetail };
          break;
        case "KONDISI GIGI":
          submittedData = { secret, nama: inputData.name, arti: inputData.desc, note: inputData.note };
          break;
        case "DENTIST":
          submittedData = { secret, idbranch: inputData.cctr, name_dentist: inputData.name, sip: inputData.sip, phone: inputData.phone, nik: inputData.nik };
          break;
        case "STOCK EXPIRE":
          submittedData = { secret, stock: inputData.stockexp };
          break;
        case "STOCK":
          submittedData = { secret, categorystock: inputData.category, subcategorystock: inputData.sub_category, itemname: inputData.name, unit: inputData.unit, stockin: inputData.count, value: inputData.value };
          break;
        case "PO PUSAT":
          if (selectedMode === "update") {
            submittedData = { secret, idpostock: selectedData, status: inputData.status };
          } else {
            submittedData = { secret, postock: inputData.postock };
          }
          break;
        case "PO MASUK":
          submittedData = { secret, idpostock: inputData.id, status: inputData.status, stock: inputData.postock.map((item) => ({ idpostockdetail: item.idstock, qty: item.stockin, note: item.note })) };
          break;
        case "REKAM MEDIS":
          switch (onPageTabId) {
            case "1":
              submittedData = { secret, iduser: selectedCust, name: onpageData.name, phone: onpageData.phone, email: onpageData.email, birthday: onpageData.birth, noktp: onpageData.nik, address: onpageData.address, gender: onpageData.gender };
              break;
            case "4":
              submittedData = { secret, iduser: selectedCust, ageyear: inputData.ageyear, agemonth: inputData.agemonth, ageday: inputData.ageday };
              break;
            default:
              break;
          }
          break;
        case "RESERVATION":
          if (selectedMode === "update") {
            submittedData = { secret, status_reservation: inputData.status, status_dp: inputData.statuspayment };
          } else {
            submittedData = { secret, idservicetype: inputData.id, name: inputData.name, phone: inputData.phone, email: inputData.email, voucher: inputData.vouchercode, service: inputData.service, typeservice: inputData.sub_service, reservationdate: inputData.date, reservationtime: inputData.time, price: inputData.price, bank_code: inputData.bank_code, note: inputData.note, idoutlet: selectedBranch };
          }
          break;
        case "ORDER CUSTOMER":
          submittedData = { secret, name: inputData.name, phone: inputData.phone, bank_code: inputData.bank_code, dentist: inputData.dentist, transactionstatus: inputData.status, layanan: inputData.order };
          break;
        case "PRACTITIONER":
          submittedData = { secret, city: inputData.city, province: inputData.province, district: inputData.district, village: inputData.village, rt: inputData.rt, rw: inputData.rw, address: inputData.address, birthDate: inputData.birth_date, gender: inputData.gender, id: inputData.id, str: inputData.str };
          break;
        case "ORGANIZATION":
          submittedData = { secret, name: inputData.name, phone: inputData.phone, email: inputData.email, address: inputData.address, cityname: inputData.city_name, postalcode: inputData.postcode, province: inputData.province, city: inputData.city, district: inputData.district, village: inputData.village };
          break;
        case "CREDENTIAL":
          submittedData = { secret, idoutlet: inputData.outlet, clientid: inputData.client_id, secretid: inputData.secret_id };
          break;
        default:
          break;
      }
      const formData = new FormData();
      formData.append("data", JSON.stringify(submittedData));
      formData.append("fileimg", selectedImage);
      if (action === "update") {
        formData.append("idedit", selectedData);
      }
      await apiCrud(formData, scope, endpoint);
      showNotifications("success", successmsg);
      log("submitted data:", submittedData);
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

  const handleDelete = async (params, endpoint, scope = "office") => {
    const confirmmsg = `Apakah anda yakin untuk menghapus data terpilih dari ${toTitleCase(slug)}?`;
    const successmsg = `Selamat! Data terpilih dari ${toTitleCase(slug)} berhasil dihapus.`;
    const errormsg = "Terjadi kesalahan saat menghapus data. Mohon periksa koneksi internet anda dan coba lagi.";
    const confirm = window.confirm(confirmmsg);
    if (confirm) {
      try {
        let submittedData;
        switch (slug) {
          case "MANAJEMEN USER":
            submittedData = { secret, idoutlet: "", username: "", password: "", level: "", status: "" };
            break;
          case "LAYANAN":
            submittedData = { secret, service: "", layanan: [] };
            break;
          case "CABANG EDENTAL":
            submittedData = { secret, region: "", name: "", address: "", phone: "", mainregion: "", postcode: "", cctr_group: "", cctr: "", coordinate: "" };
            break;
          case "KONDISI GIGI":
            submittedData = { secret, nama: "", arti: "", note: "" };
            break;
          case "PRACTITIONER":
            submittedData = { secret };
            break;
          case "ORGANIZATION":
            submittedData = { secret };
            break;
          case "LOCATION":
            submittedData = { secret };
            break;
          case "CREDENTIAL":
            submittedData = { secret, idoutlet: "", clientid: "", secretid: "" };
            break;
          default:
            break;
        }
        const formData = new FormData();
        formData.append("data", JSON.stringify(submittedData));
        if (slug === "PRACTITIONER") {
          formData.append("idpractitioner", params);
        } else if (slug === "ORGANIZATION") {
          formData.append("idorganization", params);
        } else if (slug === "LOCATION") {
          formData.append("idlocation", params);
        } else {
          formData.append("iddelete", params);
        }
        await apiCrud(formData, scope, endpoint);
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
  const { searchTerm: stockOutSearch, handleSearch: handleStockOutSearch, filteredData: filteredStockOutData, isDataShown: isStockOutShown } = useSearch(stockOutData, ["categorystock", "subcategorystock", "sku", "itemname", "outletname"]);
  const { searchTerm: stockExpSearch, handleSearch: handleStockExpSearch, filteredData: filteredStockExpData, isDataShown: isStockExpShown } = useSearch(stockExpData, ["categorystock", "subcategorystock", "sku", "itemname", "outletname"]);
  const { searchTerm: inPOSearch, handleSearch: handleInPOSearch, filteredData: filteredInPOData, isDataShown: isInPOShown } = useSearch(inPOData, ["PO Stock.outletname", "PO Stock.postockcode"]);
  const { searchTerm: centralPOSearch, handleSearch: handleCentralPOSearch, filteredData: filteredCentralPOData, isDataShown: isCentralPOShown } = useSearch(centralPOData, ["PO Stock.outletname", "PO Stock.postockcode"]);
  const { searchTerm: userSearch, handleSearch: handleUserSearch, filteredData: filteredUserData, isDataShown: isUserShown } = useSearch(userData, ["username", "cctr", "outlet_name"]);
  const { searchTerm: diagnoseSearch, handleSearch: handleDiagnoseSearch, filteredData: filteredDiagnoseData, isDataShown: isDiagnoseShown } = useSearch(diagnoseData, ["code.diagnosiscode"]);
  const { searchTerm: orderRSearch, handleSearch: handleOrderRSearch, filteredData: filteredOrderRData, isDataShown: isOrderRShown } = useSearch(orderRData, ["order.transactionname"]);
  const { searchTerm: conditionSearch, handleSearch: handleConditionSearch, filteredData: filteredConditionData, isDataShown: isConditionShown } = useSearch(conditionData, ["singkatan", "arti", "keterangan"]);
  const { searchTerm: practiSearch, handleSearch: handlePractiSearch, filteredData: filteredPractiData, isDataShown: isPractiShown } = useSearch(practiciData, ["gender"]);
  const { searchTerm: orgSearch, handleSearch: handleOrgSearch, filteredData: filteredOrgData, isDataShown: isOrgShown } = useSearch(orgData, ["email"]);
  const { searchTerm: locationSearch, handleSearch: handleLocationSearch, filteredData: filteredLocationData, isDataShown: isLocationShown } = useSearch(locationData, ["cityname"]);
  const { searchTerm: patientSearch, handleSearch: handlePatientSearch, filteredData: filteredPatientData, isDataShown: isPatientShown } = useSearch(patientData, ["transaction.dentist"]);
  const { searchTerm: xenditSearch, handleSearch: handleXenditSearch, filteredData: filteredXenditData, isDataShown: isXenditShown } = useSearch(invoiceData, ["external_id", "account_number", "bank_code", "expected_amount", "expiration_date"]);
  const { searchTerm: credSearch, handleSearch: handleCredSearch, filteredData: filteredCredData, isDataShown: isCredShown } = useSearch(credData, ["outlet_name", "clientid", "secretid"]);

  const renderContent = () => {
    switch (slug) {
      case "DATA CUSTOMER":
        return (
          <Fragment>
            <DashboardHead title={pagetitle} desc="Daftar Customer yang memiliki riwayat Reservasi. Data ini dibuat otomatis saat proses reservasi dilakukan." />
            <DashboardToolbar>
              <DashboardTool>
                <Input id={`search-data-${pageid}`} radius="full" labeled={false} placeholder="Cari data ..." type="text" value={custSearch} onChange={(e) => handleCustSearch(e.target.value)} leadingicon={<Search />} />
                {level === "admin" && <Select id={`${pageid}-outlet`} labeled={false} searchable radius="full" placeholder="Pilih Cabang" value={selectedBranch} options={allBranchData.map((branch) => ({ value: branch.idoutlet, label: branch.outlet_name.replace("E DENTAL - DOKTER GIGI", "CABANG") }))} onChange={handleBranchChange} />}
              </DashboardTool>
              <DashboardTool>
                <Select id={`limit-data-${pageid}`} labeled={false} noemptyval radius="full" placeholder="Baris per Halaman" value={limit} options={limitopt} onChange={handleLimitChange} readonly={!isCustShown} />
                <Button id={`export-data-${pageid}`} radius="full" bgColor="var(--color-green)" buttonText="Export" onClick={() => exportToExcel(filteredCustData, "Daftar Customer", `daftar_customer_${getCurrentDate()}`)} isDisabled={!isCustShown} startContent={<Export />} />
              </DashboardTool>
            </DashboardToolbar>
            <DashboardBody>
              <Table byNumber page={currentPage} limit={limit} isNoData={!isCustShown} isLoading={isFetching}>
                <THead>
                  <TR>
                    <TH isSorted onSort={() => handleSort(custData, setCustData, "usercreate", "date")}>
                      Tanggal Bergabung
                    </TH>
                    <TH isSorted onSort={() => handleSort(custData, setCustData, "username", "text")}>
                      Nama Pengguna
                    </TH>
                    <TH isSorted onSort={() => handleSort(custData, setCustData, "useremail", "text")}>
                      Alamat Email
                    </TH>
                    <TH isSorted onSort={() => handleSort(custData, setCustData, "userphone", "number")}>
                      Nomor Telepon
                    </TH>
                    <TH isSorted onSort={() => handleSort(custData, setCustData, "address", "text")}>
                      Alamat
                    </TH>
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
            {isCustShown > 0 && <Pagination radius="full" nospacing currentPage={currentPage} ttlPages={totalPages} onChange={handlePageChange} />}
          </Fragment>
        );
      case "MANAJEMEN USER":
        return (
          <Fragment>
            <DashboardHead title={pagetitle} desc="Data pengguna aplikasi. Klik Tambah Baru untuk membuat data pengguna baru, atau klik ikon di kolom Action untuk memperbarui data." />
            <DashboardToolbar>
              <DashboardTool>
                <Input id={`search-data-${pageid}`} radius="full" labeled={false} placeholder="Cari data ..." type="text" value={userSearch} onChange={(e) => handleUserSearch(e.target.value)} leadingicon={<Search />} />
              </DashboardTool>
              <DashboardTool>
                <Select id={`limit-data-${pageid}`} labeled={false} noemptyval radius="full" placeholder="Baris per Halaman" value={limit} options={limitopt} onChange={handleLimitChange} readonly={!isUserShown} />
                <Button id={`add-new-data-${pageid}`} radius="full" buttonText="Tambah" onClick={openForm} startContent={<Plus />} />
              </DashboardTool>
            </DashboardToolbar>
            <DashboardBody>
              <Table byNumber isEditable isDeletable page={currentPage} limit={limit} isNoData={!isUserShown} isLoading={isFetching}>
                <THead>
                  <TR>
                    <TH isSorted onSort={() => handleSort(userData, setUserData, "apiauthcreate", "date")}>
                      Tanggal Dibuat
                    </TH>
                    <TH isSorted onSort={() => handleSort(userData, setUserData, "username", "text")}>
                      Username
                    </TH>
                    <TH isSorted onSort={() => handleSort(userData, setUserData, "level", "text")}>
                      Level
                    </TH>
                    <TH isSorted onSort={() => handleSort(userData, setUserData, "apiauth_status", "number")}>
                      Status
                    </TH>
                    <TH isSorted onSort={() => handleSort(userData, setUserData, "outlet_name", "text")}>
                      Nama Cabang
                    </TH>
                    <TH isSorted onSort={() => handleSort(userData, setUserData, "cctr", "text")}>
                      Kode Cabang
                    </TH>
                  </TR>
                </THead>
                <TBody>
                  {filteredUserData.map((data, index) => (
                    <TR key={index} onEdit={() => openEdit(data.idauth)} onDelete={() => handleDelete(data.idauth, "cuduser")} isDanger={data.apiauth_status !== "0"}>
                      <TD>{newDate(data.apiauthcreate, "id")}</TD>
                      <TD>{data.username}</TD>
                      <TD>{data.level}</TD>
                      <TD>{usrstatAlias(data.apiauth_status)}</TD>
                      <TD>{toTitleCase(data.outlet_name)}</TD>
                      <TD type="code">{data.cctr}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </DashboardBody>
            {isUserShown && <Pagination radius="full" nospacing currentPage={currentPage} ttlPages={totalPages} onChange={handlePageChange} />}
            {isFormOpen && (
              <SubmitForm size="sm" formTitle={selectedMode === "update" ? "Ubah Data Pengguna" : "Tambah Data Pengguna"} operation={selectedMode} fetching={isFormFetching} onSubmit={(e) => handleSubmit(e, "cuduser")} loading={isSubmitting} onClose={closeForm}>
                <Fieldset>
                  <Input id={`${pageid}-username`} radius="full" label="Username" placeholder="cabang.jakarta@edental.id" type="text" name="username" value={inputData.username} onChange={handleInputChange} errormsg={errors.username} required />
                  <Input id={`${pageid}-password`} radius="full" label="Password" placeholder="Masukkan password" type="password" name="password" value={inputData.password} onChange={handleInputChange} errormsg={errors.password} required />
                </Fieldset>
                <Fieldset>
                  <Select id={`${pageid}-level`} noemptyval radius="full" label="Level/Akses" placeholder="Pilih level/akses" name="level" value={inputData.level} options={levelopt} onChange={(selectedValue) => handleInputChange({ target: { name: "level", value: selectedValue } })} errormsg={errors.level} required />
                  <Select id={`${pageid}-status`} noemptyval radius="full" label="Status Pengguna" placeholder="Pilih status" name="status" value={inputData.status} options={usrstatopt} onChange={(selectedValue) => handleInputChange({ target: { name: "status", value: selectedValue } })} errormsg={errors.status} required />
                  <Select id={`${pageid}-outlet`} searchable radius="full" label="Cabang" placeholder="Pilih cabang" name="outlet" value={inputData.outlet} options={allBranchData.map((branch) => ({ value: branch.idoutlet, label: branch.outlet_name.replace("E DENTAL - DOKTER GIGI", "CABANG") }))} onChange={(selectedValue) => handleInputChange({ target: { name: "outlet", value: selectedValue } })} errormsg={errors.outlet} required />
                </Fieldset>
              </SubmitForm>
            )}
          </Fragment>
        );
      case "LAYANAN":
        return (
          <Fragment>
            <DashboardHead title={pagetitle} desc="Daftar layanan yang tersedia saat ini. Klik opsi ikon pada kolom Action untuk melihat detail, memperbarui, atau menghapus data." />
            <DashboardToolbar>
              <DashboardTool>
                <Input id={`search-data-${pageid}`} radius="full" labeled={false} placeholder="Cari data ..." type="text" value={serviceSearch} onChange={(e) => handleServiceSearch(e.target.value)} leadingicon={<Search />} />
              </DashboardTool>
              <DashboardTool>
                <Select id={`limit-data-${pageid}`} labeled={false} noemptyval radius="full" placeholder="Baris per Halaman" value={limit} options={limitopt} onChange={handleLimitChange} readonly={!isServiceShown} />
                <Button id={`add-new-data-${pageid}`} radius="full" buttonText="Tambah" onClick={openForm} startContent={<Plus />} />
              </DashboardTool>
            </DashboardToolbar>
            <DashboardBody>
              <Table byNumber isExpandable isEditable isDeletable page={currentPage} limit={limit} isNoData={!isServiceShown} isLoading={isFetching}>
                <THead>
                  <TR>
                    <TH isSorted onSort={() => handleSort(servicedata, setservicedata, "Nama Layanan.servicecreate", "date")}>
                      Tanggal Dibuat
                    </TH>
                    <TH isSorted onSort={() => handleSort(servicedata, setservicedata, "Nama Layanan.servicename", "text")}>
                      Nama Layanan
                    </TH>
                    <TH isSorted onSort={() => handleSort(servicedata, setservicedata, "Nama Layanan.idservice", "number")}>
                      Nomor ID Layanan
                    </TH>
                    <TH isSorted onSort={() => handleSort(servicedata, setservicedata, "Nama Layanan.serviceupdate", "date")}>
                      Terakhir Diperbarui
                    </TH>
                    <TH isSorted onSort={() => handleSort(servicedata, setservicedata, "Nama Layanan.servicestatus", "number")}>
                      Status Layanan
                    </TH>
                  </TR>
                </THead>
                <TBody>
                  {filteredservicedata.map((data, index) => (
                    <TR
                      key={index}
                      expandContent={
                        <Fragment>
                          {data["Jenis Layanan"].map((subdata, idx) => (
                            <Fieldset key={idx} type="row" markers={`${idx + 1}.`}>
                              <Input id={`${pageid}-name-${index}-${idx}`} radius="full" label="Jenis Layanan" value={subdata.servicetypename} readonly />
                              <Input id={`${pageid}-price-${index}-${idx}`} radius="full" label="Harga" value={newPrice(subdata.serviceprice)} readonly />
                              <Input id={`${pageid}-status-${index}-${idx}`} radius="full" label="Status" value={subdata.servicetypestatus} readonly />
                            </Fieldset>
                          ))}
                        </Fragment>
                      }
                      onEdit={() => openEdit(data["Nama Layanan"].idservice)}
                      onDelete={() => handleDelete(data["Nama Layanan"].idservice, "cudservice")}>
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
            {isServiceShown && <Pagination radius="full" nospacing currentPage={currentPage} ttlPages={totalPages} onChange={handlePageChange} />}
            {isFormOpen && (
              <SubmitForm size="md" formTitle={selectedMode === "update" ? "Perbarui Data Layanan" : "Tambah Data Layanan"} operation={selectedMode} fetching={isFormFetching} onSubmit={(e) => handleSubmit(e, "cudservice")} loading={isSubmitting} onClose={closeForm}>
                <Input id={`${pageid}-name`} radius="full" label="Nama Layanan" placeholder="Masukkan nama layanan" type="text" name="service" value={inputData.service} onChange={handleInputChange} errormsg={errors.service} required />
                {inputData.layanan.map((subservice, index) => (
                  <Fieldset
                    key={index}
                    type="row"
                    markers={`${index + 1}.`}
                    endContent={
                      <Fragment>
                        <Button id={`${pageid}-delete-row-${index}`} subVariant="icon" isTooltip tooltipText="Hapus" size="sm" color={inputData.layanan.length <= 1 ? "var(--color-red-30)" : "var(--color-red)"} bgColor="var(--color-red-10)" iconContent={<NewTrash />} onClick={() => handleRmvRow("layanan", index)} isDisabled={inputData.layanan.length <= 1} />
                        {index + 1 === inputData.layanan.length && <Button id={`${pageid}-add-row`} subVariant="icon" isTooltip tooltipText="Tambah" size="sm" color="var(--color-primary)" bgColor="var(--color-primary-10)" iconContent={<Plus />} onClick={() => handleAddRow("layanan")} />}
                      </Fragment>
                    }>
                    <Input id={`${pageid}-type-name-${index}`} radius="full" label="Jenis Layanan" placeholder="e.g. Scaling gigi" type="text" name="servicetype" value={subservice.servicetype} onChange={(e) => handleRowChange("layanan", index, e)} errormsg={errors[`layanan.${index}.servicetype`] ? errors[`layanan.${index}.servicetype`] : ""} required />
                    <Input id={`${pageid}-type-price-${index}`} radius="full" label="Atur Harga" placeholder="Masukkan harga" type="number" name="price" value={subservice.price} onChange={(e) => handleRowChange("layanan", index, e)} errormsg={errors[`layanan.${index}.price`] ? errors[`layanan.${index}.price`] : ""} required />
                  </Fieldset>
                ))}
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
                <Input id={`search-data-${pageid}`} radius="full" labeled={false} placeholder="Cari data ..." type="text" value={branchSearch} onChange={(e) => handleBranchSearch(e.target.value)} leadingicon={<Search />} />
              </DashboardTool>
              <DashboardTool>
                <Select id={`limit-data-${pageid}`} labeled={false} noemptyval radius="full" placeholder="Baris per Halaman" value={limit} options={limitopt} onChange={handleLimitChange} readonly={!isBranchShown} />
                <Button id={`add-new-data-${pageid}`} radius="full" buttonText="Tambah" onClick={openForm} startContent={<Plus />} />
                <Button id={`export-data-${pageid}`} radius="full" bgColor="var(--color-green)" buttonText="Export" onClick={() => exportToExcel(filteredBranchData, "Daftar Cabang", `daftar_cabang_${getCurrentDate()}`)} isDisabled={!isBranchShown} startContent={<Export />} />
              </DashboardTool>
            </DashboardToolbar>
            <DashboardBody>
              <Table byNumber isEditable isDeletable page={currentPage} limit={limit} isNoData={!isBranchShown} isLoading={isFetching}>
                <THead>
                  <TR>
                    <TH isSorted onSort={() => handleSort(branchData, setBranchData, "outletcreate", "date")}>
                      Tanggal Dibuat
                    </TH>
                    <TH isSorted onSort={() => handleSort(branchData, setBranchData, "outlet_name", "text")}>
                      Nama Cabang
                    </TH>
                    <TH isSorted onSort={() => handleSort(branchData, setBranchData, "outlet_address", "text")}>
                      Alamat Cabang
                    </TH>
                    <TH isSorted onSort={() => handleSort(branchData, setBranchData, "mainregion", "text")}>
                      Main Region
                    </TH>
                    <TH isSorted onSort={() => handleSort(branchData, setBranchData, "outlet_region", "text")}>
                      Region
                    </TH>
                    <TH isSorted onSort={() => handleSort(branchData, setBranchData, "cctr_group", "text")}>
                      CCTR Group
                    </TH>
                    <TH isSorted onSort={() => handleSort(branchData, setBranchData, "cctr", "text")}>
                      CCTR
                    </TH>
                    <TH isSorted onSort={() => handleSort(branchData, setBranchData, "outlet_phone", "number")}>
                      Nomor Kontak
                    </TH>
                    <TH isSorted onSort={() => handleSort(branchData, setBranchData, "postcode", "number")}>
                      Kode POS
                    </TH>
                    <TH isSorted onSort={() => handleSort(branchData, setBranchData, "coordinate", "number")}>
                      Titik Koordinat
                    </TH>
                  </TR>
                </THead>
                <TBody>
                  {filteredBranchData.map((data, index) => (
                    <TR key={index} onEdit={() => openEdit(data.idoutlet)} onDelete={() => handleDelete(data.idoutlet, "cudoutlet")}>
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
            {isBranchShown && <Pagination radius="full" nospacing currentPage={currentPage} ttlPages={totalPages} onChange={handlePageChange} />}
            {isFormOpen && (
              <SubmitForm formTitle={selectedMode === "update" ? "Perbarui Data Cabang" : "Tambah Data Cabang"} operation={selectedMode} fetching={isFormFetching} onSubmit={(e) => handleSubmit(e, "cudoutlet")} loading={isSubmitting} onClose={closeForm}>
                <Fieldset>
                  <Input id={`${pageid}-name`} radius="full" label="Nama Outlet" placeholder="Edental Jakarta Pusat" type="text" name="name" value={inputData.name} onChange={handleInputChange} errormsg={errors.name} required />
                  <Input id={`${pageid}-phone`} radius="full" label="Nomor Kontak Cabang" placeholder="0882xxx" type="tel" name="phone" value={inputData.phone} onChange={handleInputChange} errormsg={errors.phone} required />
                  <Input id={`${pageid}-mainregion`} radius="full" label="Main Region" placeholder="Jawa" type="text" name="main_region" value={inputData.main_region} onChange={handleInputChange} errormsg={errors.main_region} required />
                </Fieldset>
                <Fieldset>
                  <Input id={`${pageid}-region`} radius="full" label="Region" placeholder="DKI Jakarta" type="text" name="region" value={inputData.region} onChange={handleInputChange} errormsg={errors.region} required />
                  <Input id={`${pageid}-address`} radius="full" label="Alamat Cabang" placeholder="123 Main Street" type="text" name="address" value={inputData.address} onChange={handleInputChange} errormsg={errors.address} required />
                  <Input id={`${pageid}-postcode`} radius="full" label="Kode Pos" placeholder="40282" type="number" name="postcode" value={inputData.postcode} onChange={handleInputChange} errormsg={errors.postcode} required />
                </Fieldset>
                <Fieldset>
                  <Input id={`${pageid}-coords`} radius="full" label="Titik Koordinat" placeholder="Masukkan titik koordinat" type="text" name="coordinate" value={inputData.coordinate} onChange={handleInputChange} errormsg={errors.coordinate} required />
                  <Input id={`${pageid}-cctrgroup`} radius="full" label="CCTR Group" placeholder="Masukkan CCTR group" type="text" name="cctr_group" value={inputData.cctr_group} onChange={handleInputChange} errormsg={errors.cctr_group} required />
                  <Input id={`${pageid}-cctr`} radius="full" label="CCTR" placeholder="Masukkan CCTR" type="text" name="cctr" value={inputData.cctr} onChange={handleInputChange} errormsg={errors.cctr} required />
                </Fieldset>
              </SubmitForm>
            )}
          </Fragment>
        );
      case "DIAGNOSA":
        return (
          <Fragment>
            <DashboardHead title={pagetitle} desc="Daftar data Diagnosa. Klik opsi ikon pada kolom Action untuk melihat detail data." />
            <DashboardToolbar>
              <DashboardTool>
                <Input id={`search-data-${pageid}`} radius="full" labeled={false} placeholder="Cari data ..." type="text" value={diagnoseSearch} onChange={(e) => handleDiagnoseSearch(e.target.value)} leadingicon={<Search />} />
              </DashboardTool>
              <Button id={`add-new-data-${pageid}`} radius="full" buttonText="Tambah" onClick={openForm} startContent={<Plus />} />
            </DashboardToolbar>
            <DashboardBody>
              <Table byNumber isExpandable isNoData={!isDiagnoseShown} isLoading={isFetching}>
                <THead>
                  <TR>
                    <TH isSorted onSort={() => handleSort(diagnoseData, setDiagnoseData, "code.diagnosiscodecreate", "date")}>
                      Tanggal Dibuat
                    </TH>
                    <TH isSorted onSort={() => handleSort(diagnoseData, setDiagnoseData, "code.diagnosiscode", "text")}>
                      Kode Diagnosa
                    </TH>
                    <TH isSorted onSort={() => handleSort(diagnoseData, setDiagnoseData, "code.diagnosiscodestatus", "number")}>
                      Status Diagnosa
                    </TH>
                  </TR>
                </THead>
                <TBody>
                  {filteredDiagnoseData.map((data, index) => (
                    <TR
                      key={index}
                      expandContent={data["detail"].map((subdata, idx) => (
                        <Fieldset key={idx} type="row" markers={`${idx + 1}.`}>
                          <Input id={`${pageid}-detail-${index}-${idx}`} radius="full" label="Detail Diagnosa" value={subdata.diagnosisdetail} readonly />
                          <Input id={`${pageid}-status-${index}-${idx}`} radius="full" label="Status Detail Diagnosa" value={subdata.diagnosisdetailstatus} readonly />
                        </Fieldset>
                      ))}>
                      <TD>{newDate(data["code"].diagnosiscodecreate, "id")}</TD>
                      <TD type="code">{data["code"].diagnosiscode}</TD>
                      <TD>{data["code"].diagnosiscodestatus}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </DashboardBody>
            {isFormOpen && (
              <SubmitForm size="md" formTitle={selectedMode === "update" ? "Perbarui Data Diagnosa" : "Tambah Data Diagnosa"} operation={selectedMode} fetching={isFormFetching} onSubmit={(e) => handleSubmit(e, "adddiagnosis")} loading={isSubmitting} onClose={closeForm}>
                <Input id={`${pageid}-diagnose-code`} radius="full" label="Kode Diagnosa" placeholder="Masukkan kode diagnosa" type="text" name="diagnosecode" value={inputData.diagnosecode} onChange={handleInputChange} errormsg={errors.diagnosecode} required />
                {inputData.diagdetail.map((detail, index) => (
                  <Fieldset
                    key={index}
                    type="row"
                    markers={`${index + 1}.`}
                    endContent={
                      <Fragment>
                        <Button id={`${pageid}-delete-row-${index}`} subVariant="icon" isTooltip tooltipText="Hapus" size="sm" color={inputData.diagdetail.length <= 1 ? "var(--color-red-30)" : "var(--color-red)"} bgColor="var(--color-red-10)" iconContent={<NewTrash />} onClick={() => handleRmvRow("diagdetail", index)} isDisabled={inputData.diagdetail.length <= 1} />
                        {index + 1 === inputData.diagdetail.length && <Button id={`${pageid}-add-row`} subVariant="icon" isTooltip tooltipText="Tambah" size="sm" color="var(--color-primary)" bgColor="var(--color-primary-10)" iconContent={<Plus />} onClick={() => handleAddRow("diagdetail")} />}
                      </Fragment>
                    }>
                    <Input id={`${pageid}-diagnose-detail-${index}`} radius="full" label="Detail Diagnosa" placeholder="Masukkan detail diagnosa" type="text" name="diagnosisdetail" value={detail.diagnosisdetail} onChange={(e) => handleRowChange("diagdetail", index, e)} errormsg={errors[`diagdetail.${index}.diagnosisdetail`] ? errors[`diagdetail.${index}.diagnosisdetail`] : ""} required />
                  </Fieldset>
                ))}
              </SubmitForm>
            )}
          </Fragment>
        );
      case "KONDISI GIGI":
        return (
          <Fragment>
            <DashboardHead title={pagetitle} desc="Data master kondisi gigi. Klik Tambah Baru untuk membuat data baru, atau klik ikon di kolom Action untuk memperbarui/menghapus data." />
            <DashboardToolbar>
              <DashboardTool>
                <Input id={`search-data-${pageid}`} radius="full" labeled={false} placeholder="Cari data ..." type="text" value={conditionSearch} onChange={(e) => handleConditionSearch(e.target.value)} leadingicon={<Search />} />
              </DashboardTool>
              <Button id={`add-new-data-${pageid}`} radius="full" buttonText="Tambah" onClick={openForm} startContent={<Plus />} />
            </DashboardToolbar>
            <DashboardBody>
              <Table byNumber isEditable isDeletable page={currentPage} limit={limit} isNoData={!isConditionShown} isLoading={isFetching}>
                <THead>
                  <TR>
                    <TH isSorted onSort={() => handleSort(conditionData, setConditionData, "singkatan", "text")}>
                      Nama Kondisi
                    </TH>
                    <TH isSorted onSort={() => handleSort(conditionData, setConditionData, "arti", "text")}>
                      Arti Kondisi
                    </TH>
                    <TH isSorted onSort={() => handleSort(conditionData, setConditionData, "keterangan", "text")}>
                      Keterangan
                    </TH>
                  </TR>
                </THead>
                <TBody>
                  {filteredConditionData.map((data, index) => (
                    <TR key={index} onEdit={() => openEdit(data.idtooth)} onDelete={() => handleDelete(data.idtooth, "cudtooth")}>
                      <TD>{data.singkatan}</TD>
                      <TD>{data.arti}</TD>
                      <TD>{data.keterangan}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </DashboardBody>
            {isFormOpen && (
              <SubmitForm size="sm" formTitle={selectedMode === "update" ? "Ubah Data Kondisi" : "Tambah Data Kondisi"} operation={selectedMode} fetching={isFormFetching} onSubmit={(e) => handleSubmit(e, "cudtooth")} loading={isSubmitting} onClose={closeForm}>
                <Fieldset>
                  <Input id={`${pageid}-singkatan`} radius="full" label="Nama Kondisi" placeholder="sou" type="text" name="name" value={inputData.name} onChange={handleInputChange} errormsg={errors.name} required />
                  <Input id={`${pageid}-arti`} radius="full" label="Arti Kondisi" placeholder="Gigi sehat, normal, tanpa kelainan" type="text" name="desc" value={inputData.desc} onChange={handleInputChange} errormsg={errors.desc} required />
                </Fieldset>
                <Textarea id={`${pageid}-note`} radius="full" label="Keterangan" placeholder="Masukkan keterangan ..." name="note" rows={4} value={inputData.note} onChange={handleInputChange} errormsg={errors.note} />
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
                <Input id={`search-data-${pageid}`} radius="full" labeled={false} placeholder="Cari data ..." type="text" value={dentistSearch} onChange={(e) => handleDentistSearch(e.target.value)} leadingicon={<Search />} />
              </DashboardTool>
              <DashboardTool>
                <Select id={`limit-data-${pageid}`} labeled={false} noemptyval radius="full" placeholder="Baris per Halaman" value={limit} options={limitopt} onChange={handleLimitChange} readonly={!isDentistShown} />
                <Button id={`add-new-data-${pageid}`} radius="full" buttonText="Tambah" onClick={openForm} startContent={<Plus />} />
                <Button id={`export-data-${pageid}`} radius="full" bgColor="var(--color-green)" buttonText="Export" onClick={() => exportToExcel(filteredDentistData, "Daftar Dokter", `daftar_dokter_${getCurrentDate()}`)} isDisabled={!isDentistShown} startContent={<Export />} />
              </DashboardTool>
            </DashboardToolbar>
            <DashboardBody>
              <Table byNumber isEditable page={currentPage} limit={limit} isNoData={!isDentistShown} isLoading={isFetching}>
                <THead>
                  <TR>
                    <TH isSorted onSort={() => handleSort(dentistData, setDentistData, "id_branch", "text")}>
                      Kode Cabang
                    </TH>
                    <TH isSorted onSort={() => handleSort(dentistData, setDentistData, "name_dentist", "text")}>
                      Nama Dokter
                    </TH>
                    <TH isSorted onSort={() => handleSort(dentistData, setDentistData, "sip", "number")}>
                      Nomor SIP
                    </TH>
                    <TH isSorted onSort={() => handleSort(dentistData, setDentistData, "phone", "number")}>
                      Nomor Telepon
                    </TH>
                    <TH isSorted onSort={() => handleSort(dentistData, setDentistData, "nik", "number")}>
                      NIK
                    </TH>
                  </TR>
                </THead>
                <TBody>
                  {filteredDentistData.map((data, index) => (
                    <TR key={index} onEdit={() => openEdit(data.id_dentist)}>
                      <TD type="code">{data.id_branch}</TD>
                      <TD>{toTitleCase(data.name_dentist.replace(`${data.id_branch} -`, ""))}</TD>
                      <TD type="code">{data.sip}</TD>
                      <TD type="number">{data.phone}</TD>
                      <TD type="code">{data.nik}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </DashboardBody>
            {isDentistShown && <Pagination radius="full" nospacing currentPage={currentPage} ttlPages={totalPages} onChange={handlePageChange} />}
            {isFormOpen && (
              <SubmitForm size="md" formTitle={selectedMode === "update" ? "Perbarui Data Dokter" : "Tambah Data Dokter"} operation={selectedMode} fetching={isFormFetching} onSubmit={(e) => handleSubmit(e, "cuddentist")} loading={isSubmitting} onClose={closeForm}>
                <Select id={`${pageid}-outlet-code`} searchable radius="full" label="Cabang" placeholder="Pilih cabang" name="cctr" value={inputData.cctr} options={allBranchData.map((branch) => ({ value: branch.cctr, label: branch.outlet_name.replace("E DENTAL - DOKTER GIGI", "CABANG") }))} onChange={(selectedValue) => handleInputChange({ target: { name: "cctr", value: selectedValue } })} errormsg={errors.cctr} required />
                <Fieldset>
                  <Input id={`${pageid}-name`} radius="full" label="Nama Dokter" placeholder="Masukkan nama Dokter" type="text" name="name" value={inputData.name} onChange={handleInputChange} errormsg={errors.name} required />
                  <Input id={`${pageid}-sip`} radius="full" label="Nomor SIP" placeholder="Masukkan nomor SIP" type="number" name="sip" value={inputData.sip} onChange={handleInputChange} errormsg={errors.sip} required />
                </Fieldset>
                <Fieldset>
                  <Input id={`${pageid}-phone`} radius="full" label="Nomor Telepon" placeholder="0882xxx" type="tel" name="phone" value={inputData.phone} onChange={handleInputChange} errormsg={errors.phone} required />
                  <Input id={`${pageid}-nik`} radius="full" label="NIK" placeholder="327xxx" type="number" name="nik" value={inputData.nik} onChange={handleInputChange} errormsg={errors.nik} required />
                </Fieldset>
              </SubmitForm>
            )}
          </Fragment>
        );
      case "ORDER REPORT":
        const handleStatusChange = (value) => setSelectedStatus(value);
        const exportOReport = (data) => {
          const rowMapper = (item) =>
            item.detail.map((service) => {
              const [date, time] = item.order.transactionupdate.split(" ");
              return {
                date_transaction: date,
                time_transaction: time,
                idtransaction: item.order.idtransaction,
                nominal: item.order.totalpay,
                payment_method: item.order.payment,
                noinvoice: item.order.noinvoice,
                branch: item.order.cctr,
                labprice: item.order.labprice,
                labname: item.order.labname,
                service: service.service,
                transactionname: item.order.transactionname,
                servicetype: service.servicetype,
                dentist: item.order.dentist,
                rscode: item.order.rscode,
                transactionstatus: item.order.transactionstatus,
              };
            });
          generateExcel(data, rowMapper, slug);
        };

        const handleExportOReport = async () => {
          if (totalPages !== null) {
            const formData = new FormData();
            formData.append("data", JSON.stringify({ secret, idoutlet: outletFilter, status: selectedStatus, stardate: formatISODate(startDate), enddate: formatISODate(endDate), dentist: dentistFilter }));
            formData.append("limit", "10000");
            formData.append("hal", "0");
            setIsExporting(true);
            try {
              const response = await apiRead(formData, "office", "vieworderreport");
              exportOReport(response && response.data && response.data.length > 0 ? response.data : []);
            } catch (error) {
              showNotifications("danger", "Terjadi kesalahan saat mencoba mengunduh data ke excel. Mohon periksa koneksi internet anda dan coba lagi.");
              console.error("Terjadi kesalahan saat mencoba mengunduh data ke excel. Mohon periksa koneksi internet anda dan coba lagi.", error);
            } finally {
              setIsExporting(false);
            }
          } else {
            exportOReport(orderRData);
          }
        };

        const branchStatic = [{ idoutlet: "999", outletcreate: "0000-00-00 00:00:00", outletupdate: "0000-00-00 00:00:00", mainregion: "-", outlet_region: "-", cctr_group: "STA000", cctr: "STA000", outlet_name: "Semua Cabang", outlet_phone: "0000000000", postcode: "0", outlet_address: "-", coordinate: "-", outlet_status: "0" }];
        const branchMerged = [...branchStatic, ...allBranchData];

        const handleFilterBranch = async (value) => {
          setOutletFilter(value);
          const branchdata = allBranchData.find((item) => item.idoutlet === value);
          if (branchdata) {
            const formData = new FormData();
            formData.append("data", JSON.stringify({ secret, kodeoutlet: branchdata.cctr }));
            const dentistdata = await apiRead(formData, "office", "viewdentistoutlet");
            if (dentistdata && dentistdata.data && dentistdata.data.length > 0) {
              setAllDentistData(dentistdata.data);
              setDentistFilter(dentistdata.data[0].id_dentist);
            } else {
              setAllDentistData([]);
              setDentistFilter(null);
            }
          } else if (value === "999") {
            setDentistFilter("999");
          } else {
            setAllDentistData([]);
            setDentistFilter(null);
          }
        };

        const handleFilterDentist = (value) => setDentistFilter(value);

        const dentistStatic = [{ id_dentist: "999", name_dentist: "Semua Dokter", id_branch: "STA000", phone: "0000000000", sip: "000000", nik: "0000000000000000" }];
        const dentistMerged = [...dentistStatic, ...allDentistData];

        return (
          <Fragment>
            <DashboardHead title={pagetitle} desc="Data report Order yang telah selesai. Data ini dibuat otomatis saat proses transaksi dilakukan." />
            <DashboardToolbar>
              <DashboardTool>
                <Input id={`search-data-${pageid}`} radius="full" labeled={false} placeholder="Cari data ..." type="text" value={orderRSearch} onChange={(e) => handleOrderRSearch(e.target.value)} leadingicon={<Search />} />
              </DashboardTool>
              <DashboardTool>
                {totalPages !== null && <Select id={`limit-data-${pageid}`} labeled={false} noemptyval radius="full" placeholder="Baris per Halaman" value={limit} options={limitopt} onChange={handleLimitChange} readonly={!isOrderRShown} />}
                <Button id={`filter-data-${pageid}`} radius="full" buttonText="Filter" onClick={openForm} startContent={<Filter />} />
                <Button id={`export-data-${pageid}`} radius="full" bgColor="var(--color-green)" buttonText="Export" onClick={handleExportOReport} isDisabled={!isOrderRShown} startContent={<Export />} isLoading={isExporting} />
              </DashboardTool>
            </DashboardToolbar>
            <DashboardBody>
              <Table byNumber isExpandable page={totalPages !== null ? currentPage : undefined} limit={totalPages !== null ? limit : undefined} isNoData={!isOrderRShown} isLoading={isFetching}>
                <THead>
                  <TR>
                    <TH isSorted onSort={() => handleSort(orderRData, setOrderRData, "order.transactioncreate", "date")}>
                      Tanggal Dibuat
                    </TH>
                    <TH isSorted onSort={() => handleSort(orderRData, setOrderRData, "order.transactionstatus", "number")}>
                      Status Pembayaran
                    </TH>
                    <TH isSorted onSort={() => handleSort(orderRData, setOrderRData, "order.transactionname", "text")}>
                      Nama Pengguna
                    </TH>
                    <TH isSorted onSort={() => handleSort(orderRData, setOrderRData, "order.rscode", "text")}>
                      Kode Reservasi
                    </TH>
                    <TH isSorted onSort={() => handleSort(orderRData, setOrderRData, "order.noinvoice", "number")}>
                      Nomor Invoice
                    </TH>
                    <TH isSorted onSort={() => handleSort(orderRData, setOrderRData, "order.transactionphone", "number")}>
                      Nomor Telepon
                    </TH>
                    <TH isSorted onSort={() => handleSort(orderRData, setOrderRData, "order.payment", "text")}>
                      Metode Pembayaran
                    </TH>
                    <TH isSorted onSort={() => handleSort(orderRData, setOrderRData, "order.totalpay", "number")}>
                      Total Pembayaran
                    </TH>
                    <TH isSorted onSort={() => handleSort(orderRData, setOrderRData, "order.voucher", "text")}>
                      Kode Voucher
                    </TH>
                    <TH isSorted onSort={() => handleSort(orderRData, setOrderRData, "order.dentist", "text")}>
                      Nama Dokter
                    </TH>
                    <TH isSorted onSort={() => handleSort(orderRData, setOrderRData, "order.outlet_name", "text")}>
                      Nama Outlet
                    </TH>
                    <TH isSorted onSort={() => handleSort(orderRData, setOrderRData, "order.labname", "text")}>
                      Nama Lab
                    </TH>
                    <TH isSorted onSort={() => handleSort(orderRData, setOrderRData, "order.labprice", "number")}>
                      Harga Lab
                    </TH>
                    <TH isSorted onSort={() => handleSort(orderRData, setOrderRData, "order.labaddress", "text")}>
                      Alamat Lab
                    </TH>
                  </TR>
                </THead>
                <TBody>
                  {filteredOrderRData.map((data, index) => (
                    // <TR key={index} isComplete={data.transactionstatus === "1"} isDanger={data.transactionstatus === "2"} onEdit={data.transactionstatus === "0" ? () => openEdit(data.idtransaction) : () => showNotifications("danger", "Transaksi dengan status yang telah selesai atau dibatalkan tidak dapat diperbarui.")} onClick={() => openDetail(data.idtransaction)} onPrint={() => openFile(data.idtransaction)} onContact={() => contactWhatsApp(data.transactionphone)}>
                    <TR
                      key={index}
                      expandContent={data["detail"].map((subdata, idx) => (
                        <Fieldset key={idx} type="row" markers={`${idx + 1}.`}>
                          <Input id={`date-${index}-${idx}`} radius="full" label="Tanggal Dibuat" value={newDate(subdata.transactiondetailcreate, "id")} readonly />
                          <Input id={`service-${index}-${idx}`} radius="full" label="Layanan" value={subdata.service} readonly />
                          <Input id={`service-type-${index}-${idx}`} radius="full" label="Jenis Layanan" value={subdata.servicetype} readonly />
                          <Input id={`price-${index}-${idx}`} radius="full" label="Harga" value={newPrice(subdata.price)} readonly />
                        </Fieldset>
                      ))}>
                      <TD>{newDate(data["order"].transactioncreate, "id")}</TD>
                      <TD>{orderAlias(data["order"].transactionstatus)}</TD>
                      <TD>{toTitleCase(data["order"].transactionname)}</TD>
                      <TD type="code">{data["order"].rscode}</TD>
                      <TD type="code">{data["order"].noinvoice}</TD>
                      <TD type="number" isCopy>
                        {data["order"].transactionphone}
                      </TD>
                      <TD>{data["order"].payment}</TD>
                      <TD>{newPrice(data["order"].totalpay)}</TD>
                      <TD type="code">{data["order"].voucher}</TD>
                      <TD>{toTitleCase(data["order"].dentist)}</TD>
                      <TD>{toTitleCase(data["order"].outlet_name)}</TD>
                      <TD>{data["order"].labname}</TD>
                      <TD>{data["order"].labprice}</TD>
                      <TD>{data["order"].labaddress}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </DashboardBody>
            {totalPages !== null && isOrderRShown && <Pagination radius="full" nospacing currentPage={currentPage} ttlPages={totalPages} onChange={handlePageChange} />}
            {isFormOpen && (
              <SubmitForm size="sm" formTitle="Terapkan Filter" operation="event" onClose={closeForm} cancelText="Tutup">
                <Select id={`${pageid}-filter-outlet`} label="Nama Cabang" searchable radius="full" placeholder="Pilih Cabang" value={outletFilter} options={branchMerged.map((branch) => ({ value: branch.idoutlet, label: branch.outlet_name.replace("E DENTAL - DOKTER GIGI", "CABANG") }))} onChange={handleFilterBranch} />
                <Fieldset>
                  <Select id={`${pageid}-filter-dentist`} label="Nama Dokter" searchable radius="full" placeholder="Pilih Dokter" value={dentistFilter} options={dentistMerged.map((dentist) => ({ value: dentist.id_dentist, label: dentist.name_dentist }))} onChange={handleFilterDentist} />
                  <Select id={`${pageid}-filter-status`} label="Status" noemptyval radius="full" placeholder="Pilih Status" value={selectedStatus} options={reportstatopt} onChange={handleStatusChange} />
                </Fieldset>
                <Fieldset>
                  <Input id={`${pageid}-filter-startdate`} radius="full" label="Filter dari:" type="datetime-local" value={formatISODate(startDate)} onChange={(e) => setStartDate(new Date(e.target.value))} />
                  <Input id={`${pageid}-filter-enddate`} radius="full" label="Hingga:" type="datetime-local" value={formatISODate(endDate)} onChange={(e) => setEndDate(new Date(e.target.value))} />
                </Fieldset>
              </SubmitForm>
            )}
          </Fragment>
        );
      case "KAS":
        return (
          <Fragment>
            <DashboardHead title={pagetitle} />
            <DashboardToolbar>
              <DashboardTool>
                <Input id={`search-data-${pageid}`} radius="full" labeled={false} placeholder="Cari data ..." type="text" leadingicon={<Search />} />
              </DashboardTool>
              <DashboardTool>
                <Select id={`limit-data-${pageid}`} labeled={false} noemptyval radius="full" placeholder="Baris per Halaman" value={limit} options={limitopt} onChange={handleLimitChange} readonly />
              </DashboardTool>
            </DashboardToolbar>
            <DashboardBody>
              <Table isNoData></Table>
            </DashboardBody>
          </Fragment>
        );
      case "STOCK OUT":
        return (
          <Fragment>
            <DashboardHead title={pagetitle} desc="Data Stok Keluar berdasarkan kategori. Klik baris data untuk melihat masing-masing detail histori stok." />
            <DashboardToolbar>
              <DashboardTool>
                <Input id={`search-data-${pageid}`} radius="full" labeled={false} placeholder="Cari data ..." type="text" value={stockOutSearch} onChange={(e) => handleStockOutSearch(e.target.value)} leadingicon={<Search />} />
                {level === "admin" && <Select id={`${pageid}-outlet`} labeled={false} searchable radius="full" placeholder="Pilih Cabang" value={selectedBranch} options={allBranchData.map((branch) => ({ value: branch.idoutlet, label: branch.outlet_name.replace("E DENTAL - DOKTER GIGI", "CABANG") }))} onChange={handleBranchChange} />}
              </DashboardTool>
              <DashboardTool>
                <Select id={`limit-data-${pageid}`} labeled={false} noemptyval radius="full" placeholder="Baris per Halaman" value={limit} options={limitopt} onChange={handleLimitChange} readonly={!isStockOutShown} />
                <Button id={`export-data-${pageid}`} radius="full" bgColor="var(--color-green)" buttonText="Export" onClick={() => exportToExcel(filteredStockOutData, "Daftar Stok Keluar", `daftar_stok_keluar_${getCurrentDate()}`)} isDisabled={!isStockOutShown} startContent={<Export />} />
              </DashboardTool>
            </DashboardToolbar>
            <DashboardBody>
              <Table byNumber page={currentPage} limit={limit} isNoData={!isStockOutShown} isLoading={isFetching}>
                <THead>
                  <TR>
                    <TH isSorted onSort={() => handleSort(stockOutData, setStockOutData, "stockoutcreate", "date")}>
                      Tanggal Dibuat
                    </TH>
                    <TH isSorted onSort={() => handleSort(stockOutData, setStockOutData, "categorystock", "text")}>
                      Kategori
                    </TH>
                    <TH isSorted onSort={() => handleSort(stockOutData, setStockOutData, "subcategorystock", "text")}>
                      Sub Kategori
                    </TH>
                    <TH isSorted onSort={() => handleSort(stockOutData, setStockOutData, "sku", "text")}>
                      Kode SKU
                    </TH>
                    <TH isSorted onSort={() => handleSort(stockOutData, setStockOutData, "itemname", "text")}>
                      Nama Item
                    </TH>
                    <TH isSorted onSort={() => handleSort(stockOutData, setStockOutData, "lastqty", "number")}>
                      Stok Keluar
                    </TH>
                    <TH isSorted onSort={() => handleSort(stockOutData, setStockOutData, "unit", "text")}>
                      Unit
                    </TH>
                    <TH isSorted onSort={() => handleSort(stockOutData, setStockOutData, "outletname", "text")}>
                      Nama Cabang
                    </TH>
                  </TR>
                </THead>
                <TBody>
                  {filteredStockOutData.map((data, index) => (
                    <TR key={index}>
                      <TD>{newDate(data.stockoutcreate, "id")}</TD>
                      <TD>{toTitleCase(data.categorystock)}</TD>
                      <TD>{toTitleCase(data.subcategorystock)}</TD>
                      <TD type="code">{data.sku}</TD>
                      <TD>{toTitleCase(data.itemname)}</TD>
                      <TD>{data.lastqty}</TD>
                      <TD>{data.unit}</TD>
                      <TD>{toTitleCase(data.outletname)}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </DashboardBody>
            {isStockOutShown && <Pagination radius="full" nospacing currentPage={currentPage} ttlPages={totalPages} onChange={handlePageChange} />}
          </Fragment>
        );
      case "STOCK EXPIRE":
        return (
          <Fragment>
            <DashboardHead title={pagetitle} desc="Data Stok Expire berdasarkan kategori. Klik baris data untuk melihat masing-masing detail histori stok." />
            <DashboardToolbar>
              <DashboardTool>
                <Input id={`search-data-${pageid}`} radius="full" labeled={false} placeholder="Cari data ..." type="text" value={stockExpSearch} onChange={(e) => handleStockExpSearch(e.target.value)} leadingicon={<Search />} />
                {level === "admin" && <Select id={`${pageid}-outlet`} labeled={false} searchable radius="full" placeholder="Pilih Cabang" value={selectedBranch} options={allBranchData.map((branch) => ({ value: branch.idoutlet, label: branch.outlet_name.replace("E DENTAL - DOKTER GIGI", "CABANG") }))} onChange={handleBranchChange} />}
              </DashboardTool>
              <DashboardTool>
                <Select id={`limit-data-${pageid}`} labeled={false} noemptyval radius="full" placeholder="Baris per Halaman" value={limit} options={limitopt} onChange={handleLimitChange} readonly={!isStockExpShown} />
                <Button id={`add-new-data-${pageid}`} radius="full" buttonText="Tambah" onClick={openForm} startContent={<Plus />} />
                <Button id={`export-data-${pageid}`} radius="full" bgColor="var(--color-green)" buttonText="Export" onClick={() => exportToExcel(filteredStockExpData, "Daftar Stok Expire", `daftar_stok_expire_${getCurrentDate()}`)} isDisabled={!isStockExpShown} startContent={<Export />} />
              </DashboardTool>
            </DashboardToolbar>
            <DashboardBody>
              <Table byNumber page={currentPage} limit={limit} isNoData={!isStockExpShown} isLoading={isFetching}>
                <THead>
                  <TR>
                    <TH isSorted onSort={() => handleSort(stockExpData, setStockExpData, "stockexpirecreate", "date")}>
                      Tanggal Dibuat
                    </TH>
                    <TH isSorted onSort={() => handleSort(stockExpData, setStockExpData, "categorystock", "text")}>
                      Kategori
                    </TH>
                    <TH isSorted onSort={() => handleSort(stockExpData, setStockExpData, "subcategorystock", "text")}>
                      Sub Kategori
                    </TH>
                    <TH isSorted onSort={() => handleSort(stockExpData, setStockExpData, "sku", "text")}>
                      Kode SKU
                    </TH>
                    <TH isSorted onSort={() => handleSort(stockExpData, setStockExpData, "itemname", "text")}>
                      Nama Item
                    </TH>
                    <TH isSorted onSort={() => handleSort(stockExpData, setStockExpData, "lastqty", "number")}>
                      Stock Expire
                    </TH>
                    <TH isSorted onSort={() => handleSort(stockExpData, setStockExpData, "unit", "text")}>
                      Unit
                    </TH>
                    <TH isSorted onSort={() => handleSort(stockExpData, setStockExpData, "outletname", "text")}>
                      Nama Cabang
                    </TH>
                  </TR>
                </THead>
                <TBody>
                  {filteredStockExpData.map((data, index) => (
                    <TR key={index}>
                      <TD>{newDate(data.stockexpirecreate, "id")}</TD>
                      <TD>{toTitleCase(data.categorystock)}</TD>
                      <TD>{toTitleCase(data.subcategorystock)}</TD>
                      <TD type="code">{data.sku}</TD>
                      <TD>{toTitleCase(data.itemname)}</TD>
                      <TD>{data.lastqty}</TD>
                      <TD>{data.unit}</TD>
                      <TD>{toTitleCase(data.outletname)}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </DashboardBody>
            {isStockExpShown && <Pagination radius="full" nospacing currentPage={currentPage} ttlPages={totalPages} onChange={handlePageChange} />}
            {isFormOpen && (
              <SubmitForm formTitle="Tambah Data Stok Expire" operation="add" fetching={isFormFetching} onSubmit={(e) => handleSubmit(e, "addstockexpire")} loading={isSubmitting} onClose={closeForm}>
                {inputData.stockexp.map((alkes, index) => (
                  <Fieldset
                    key={index}
                    type="row"
                    markers={`${index + 1}.`}
                    endContent={
                      <Fragment>
                        <Button id={`${pageid}-delete-row-${index}`} subVariant="icon" isTooltip tooltipText="Hapus" size="sm" color={inputData.stockexp.length <= 1 ? "var(--color-red-30)" : "var(--color-red)"} bgColor="var(--color-red-10)" iconContent={<NewTrash />} onClick={() => handleRmvRow("stockexp", index)} isDisabled={inputData.stockexp.length <= 1} />
                        {index + 1 === inputData.stockexp.length && <Button id={`${pageid}-add-row`} subVariant="icon" isTooltip tooltipText="Tambah" size="sm" color="var(--color-primary)" bgColor="var(--color-primary-10)" iconContent={<Plus />} onClick={() => handleAddRow("stockexp")} />}
                      </Fragment>
                    }>
                    <Select id={`${pageid}-categorystock-${index}`} searchable radius="full" label="Kategori" placeholder="Pilih kategori" name="categorystock" value={alkes.categorystock} options={categoryStockData.map((cat) => ({ value: cat["category_stok"].categorystockname, label: cat["category_stok"].categorystockname }))} onChange={(selectedValue) => handleRowChange("stockexp", index, { target: { name: "categorystock", value: selectedValue } })} errormsg={errors[`stockexp.${index}.categorystock`] ? errors[`stockexp.${index}.categorystock`] : ""} required />
                    <Select id={`${pageid}-subcategorystock-${index}`} searchable radius="full" label="Sub Kategori" placeholder={alkes.categorystock ? "Pilih sub kategori" : "Mohon pilih kategori dahulu"} name="subcategorystock" value={alkes.subcategorystock} options={(alkes.categorystock && categoryStockData.find((cat) => cat["category_stok"].categorystockname === alkes.categorystock)?.["subcategory_stok"].map((sub) => ({ value: sub.subcategorystock, label: sub.subcategorystock }))) || []} onChange={(selectedValue) => handleRowChange("stockexp", index, { target: { name: "subcategorystock", value: selectedValue } })} errormsg={errors[`stockexp.${index}.subcategorystock`] ? errors[`stockexp.${index}.subcategorystock`] : ""} required disabled={!alkes.categorystock} />
                    <Select id={`${pageid}-item-name-${index}`} searchable radius="full" label="Nama Item" placeholder="Pilih Item" name="itemname" value={alkes.itemname} options={(alkes.subcategorystock && allStockData.filter((sub) => sub.subcategorystock === alkes.subcategorystock).map((item) => ({ value: item.itemname, label: item.itemname }))) || []} onChange={(selectedValue) => handleRowChange("stockexp", index, { target: { name: "itemname", value: selectedValue } })} errormsg={errors[`stockexp.${index}.itemname`] ? errors[`stockexp.${index}.itemname`] : ""} required disabled={!alkes.subcategorystock} />
                    <Input id={`${pageid}-item-sku-${index}`} radius="full" label="SKU Item" placeholder="AL2" type="text" name="sku" value={alkes.sku} onChange={(e) => handleRowChange("stockexp", index, e)} errormsg={errors[`stockexp.${index}.sku`] ? errors[`stockexp.${index}.sku`] : ""} required disabled={!alkes.itemname} />
                    <Input id={`${pageid}-item-unit-${index}`} radius="full" label="Unit Item" placeholder="PCS" type="text" name="unit" value={alkes.unit} onChange={(e) => handleRowChange("stockexp", index, e)} errormsg={errors[`stockexp.${index}.unit`] ? errors[`stockexp.${index}.unit`] : ""} required disabled={!alkes.itemname} />
                    <Input id={`${pageid}-item-qty-${index}`} radius="full" label="Jumlah Item" placeholder="50" type="number" name="qty" value={alkes.qty} onChange={(e) => handleRowChange("stockexp", index, e)} errormsg={errors[`stockexp.${index}.qty`] ? errors[`stockexp.${index}.qty`] : ""} required disabled={!alkes.itemname} />
                  </Fieldset>
                ))}
              </SubmitForm>
            )}
          </Fragment>
        );
      case "STOCK":
        return (
          <Fragment>
            <DashboardHead title={pagetitle} desc="Data Stok berdasarkan kategori. Klik baris data untuk melihat masing-masing detail histori stok." />
            <DashboardToolbar>
              <DashboardTool>
                <Input id={`search-data-${pageid}`} radius="full" labeled={false} placeholder="Cari data ..." type="text" value={stockSearch} onChange={(e) => handleStockSearch(e.target.value)} leadingicon={<Search />} />
                {level === "admin" && <Select id={`${pageid}-outlet`} labeled={false} searchable radius="full" placeholder="Pilih Cabang" value={selectedBranch} options={allBranchData.map((branch) => ({ value: branch.idoutlet, label: branch.outlet_name.replace("E DENTAL - DOKTER GIGI", "CABANG") }))} onChange={handleBranchChange} />}
              </DashboardTool>
              <DashboardTool>
                <Select id={`limit-data-${pageid}`} labeled={false} noemptyval radius="full" placeholder="Baris per Halaman" value={limit} options={limitopt} onChange={handleLimitChange} readonly={!isStockShown} />
                {level === "admin" && <Button id={`add-new-data-${pageid}`} radius="full" buttonText="Tambah" onClick={openForm} startContent={<Plus />} />}
                <Button id={`export-data-${pageid}`} radius="full" bgColor="var(--color-green)" buttonText="Export" onClick={() => exportToExcel(filteredStockData, "Daftar Stok", `daftar_stok_${getCurrentDate()}`)} isDisabled={!isStockShown} startContent={<Export />} />
              </DashboardTool>
            </DashboardToolbar>
            <DashboardBody>
              <Table byNumber isClickable page={currentPage} limit={limit} isNoData={!isStockShown} isLoading={isFetching}>
                <THead>
                  <TR>
                    <TH isSorted onSort={() => handleSort(stockData, setStockData, "stockcreate", "date")}>
                      Tanggal Dibuat
                    </TH>
                    <TH isSorted onSort={() => handleSort(stockData, setStockData, "categorystock", "text")}>
                      Kategori
                    </TH>
                    <TH isSorted onSort={() => handleSort(stockData, setStockData, "subcategorystock", "text")}>
                      Sub Kategori
                    </TH>
                    <TH isSorted onSort={() => handleSort(stockData, setStockData, "sku", "text")}>
                      Kode SKU
                    </TH>
                    <TH isSorted onSort={() => handleSort(stockData, setStockData, "itemname", "text")}>
                      Nama Item
                    </TH>
                    <TH isSorted onSort={() => handleSort(stockData, setStockData, "lastqty", "number")}>
                      Stok Akhir
                    </TH>
                    <TH isSorted onSort={() => handleSort(stockData, setStockData, "unit", "text")}>
                      Unit
                    </TH>
                    <Fragment>
                      {level === "admin" && (
                        <Fragment>
                          <TH isSorted onSort={() => handleSort(stockData, setStockData, "value", "number")}>
                            Harga
                          </TH>
                          <TH isSorted onSort={() => handleSort(stockData, setStockData, "totalvalue", "number")}>
                            Total Nilai
                          </TH>
                        </Fragment>
                      )}
                    </Fragment>
                    <TH isSorted onSort={() => handleSort(stockData, setStockData, "outletname", "text")}>
                      Nama Cabang
                    </TH>
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
                      <TD type="number">{data.lastqty}</TD>
                      <TD>{data.unit}</TD>
                      <Fragment>
                        {level === "admin" && (
                          <Fragment>
                            <TD>{newPrice(data.value)}</TD>
                            <TD>{newPrice(data.totalvalue)}</TD>
                          </Fragment>
                        )}
                      </Fragment>
                      <TD>{toTitleCase(data.outletname)}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </DashboardBody>
            {isStockShown && <Pagination radius="full" nospacing currentPage={currentPage} ttlPages={totalPages} onChange={handlePageChange} />}
            {isFormOpen && (
              <SubmitForm formTitle={selectedMode === "update" ? "Perbarui Data Stok" : "Tambah Data Stok"} operation={selectedMode} fetching={isFormFetching} onSubmit={(e) => handleSubmit(e, "cudstock")} loading={isSubmitting} onClose={closeForm}>
                <Fieldset>
                  <Select id={`${pageid}-category`} searchable radius="full" label="Kategori" placeholder="Pilih kategori" name="category" value={inputData.category} options={categoryStockData.map((cat) => ({ value: cat["category_stok"].categorystockname, label: cat["category_stok"].categorystockname }))} onChange={(selectedValue) => handleInputChange({ target: { name: "category", value: selectedValue } })} errormsg={errors.category} required />
                  <Select id={`${pageid}-subcategory`} searchable radius="full" label="Sub Kategori" placeholder={inputData.category ? "Pilih sub kategori" : "Mohon pilih kategori dahulu"} name="sub_category" value={inputData.sub_category} options={(inputData.category && categoryStockData.find((cat) => cat["category_stok"].categorystockname === inputData.category)?.["subcategory_stok"].map((sub) => ({ value: sub.subcategorystock, label: sub.subcategorystock }))) || []} onChange={(selectedValue) => handleInputChange({ target: { name: "sub_category", value: selectedValue } })} errormsg={errors.sub_category} required disabled={!inputData.category} />
                  <Input id={`${pageid}-name`} radius="full" label="Nama Item" placeholder="STERILISATOR" type="text" name="name" value={inputData.name} onChange={handleInputChange} errormsg={errors.name} required />
                </Fieldset>
                <Fieldset>
                  <Select id={`${pageid}-unit`} radius="full" label="Unit/satuan" placeholder="Pilih satuan/unit" name="unit" value={inputData.unit} options={unitopt} onChange={(selectedValue) => handleInputChange({ target: { name: "unit", value: selectedValue } })} errormsg={errors.unit} required />
                  <Input id={`${pageid}-qty`} radius="full" label="Jumlah" placeholder="40" type="number" name="count" value={inputData.count} onChange={handleInputChange} errormsg={errors.count} required />
                  <Input id={`${pageid}-price`} radius="full" label="Harga Item Satuan" placeholder="100000" type="number" name="value" value={inputData.value} onChange={handleInputChange} errormsg={errors.value} required />
                </Fieldset>
              </SubmitForm>
            )}
          </Fragment>
        );
      case "PO PUSAT":
        return (
          <Fragment>
            <DashboardHead title={pagetitle} desc="Daftar permintaan PO ke Pusat. Klik Tambah untuk membuat permintaan PO baru, atau review status permintaan PO terkini." />
            <DashboardToolbar>
              <DashboardTool>
                <Input id={`search-data-${pageid}`} radius="full" labeled={false} placeholder="Cari data ..." type="text" value={centralPOSearch} onChange={(e) => handleCentralPOSearch(e.target.value)} leadingicon={<Search />} />
              </DashboardTool>
              <DashboardTool>
                <Select id={`limit-data-${pageid}`} labeled={false} noemptyval radius="full" placeholder="Baris per Halaman" value={limit} options={limitopt} onChange={handleLimitChange} readonly={!isCentralPOShown} />
                <Button id={`add-new-data-${pageid}`} radius="full" buttonText="Tambah" onClick={openForm} startContent={<Plus />} />
              </DashboardTool>
            </DashboardToolbar>
            <TabGroup buttons={postatus} />
            <DashboardBody>
              <Table byNumber isExpandable isEditable={status === 2} page={currentPage} limit={limit} isNoData={!isCentralPOShown} isLoading={isFetching}>
                <THead>
                  <TR>
                    <TH isSorted onSort={() => handleSort(centralPOData, setCentralPOData, "PO Stock.postockcreate", "date")}>
                      Tanggal Dibuat
                    </TH>
                    <TH isSorted onSort={() => handleSort(centralPOData, setCentralPOData, "PO Stock.postockcode", "text")}>
                      Kode PO
                    </TH>
                    <TH isSorted onSort={() => handleSort(centralPOData, setCentralPOData, "PO Stock.username", "text")}>
                      Nama Admin
                    </TH>
                    <TH isSorted onSort={() => handleSort(centralPOData, setCentralPOData, "PO Stock.statusstock", "number")}>
                      Status PO
                    </TH>
                  </TR>
                </THead>
                <TBody>
                  {filteredCentralPOData.map((data, index) => (
                    <TR
                      key={index}
                      expandContent={
                        <Fragment>
                          {data["Detail PO"].map((subdata, idx) => (
                            <Fieldset key={idx} type="row" markers={`${idx + 1}.`}>
                              <Input id={`item-name-${index}-${idx}`} radius="full" label="Nama Item" value={subdata.itemname} readonly />
                              <Input id={`item-sku-${index}-${idx}`} radius="full" label="Kode SKU" value={subdata.sku} readonly />
                              <Input id={`item-qty-${index}-${idx}`} radius="full" label="Jumlah Item" value={subdata.qty} readonly />
                              <Textarea id={`item-note-${index}-${idx}`} radius="full" label="Keterangan" rows={4} value={subdata.note} fallbackValue="Tidak ada keterangan." readonly />
                            </Fieldset>
                          ))}
                        </Fragment>
                      }
                      onEdit={() => openEdit(data["PO Stock"].idpostock)}>
                      <TD>{newDate(data["PO Stock"].postockcreate, "id")}</TD>
                      <TD type="code">{data["PO Stock"].postockcode}</TD>
                      <TD>{toTitleCase(data["PO Stock"].username)}</TD>
                      <TD>{poAlias(data["PO Stock"].statusstock)}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </DashboardBody>
            {isCentralPOShown && <Pagination radius="full" nospacing currentPage={currentPage} ttlPages={totalPages} onChange={handlePageChange} />}
            {isFormOpen && (
              <Fragment>
                {selectedMode === "update" ? (
                  <SubmitForm size="sm" formTitle="Ubah Status PO Pusat" operation="update" fetching={isFormFetching} onSubmit={(e) => handleSubmit(e, "updatepostock")} loading={isSubmitting} onClose={closeForm}>
                    <Fieldset>
                      <Select id={`${pageid}-po-status`} noemptyval radius="full" label="Status PO" placeholder="Set status" name="status" value={inputData.status} options={pocstatopt} onChange={(selectedValue) => handleInputChange({ target: { name: "status", value: selectedValue } })} />
                    </Fieldset>
                  </SubmitForm>
                ) : (
                  <SubmitForm formTitle="Tambah Data PO Pusat" operation="add" fetching={isFormFetching} onSubmit={(e) => handleSubmit(e, "postock")} loading={isSubmitting} onClose={closeForm}>
                    {inputData.postock.map((po, index) => (
                      <Fieldset
                        key={index}
                        type="row"
                        markers={`${index + 1}.`}
                        endContent={
                          <Fragment>
                            <Button id={`${pageid}-delete-row-${index}`} subVariant="icon" isTooltip tooltipText="Hapus" size="sm" color={inputData.postock.length <= 1 ? "var(--color-red-30)" : "var(--color-red)"} bgColor="var(--color-red-10)" iconContent={<NewTrash />} onClick={() => handleRmvRow("postock", index)} isDisabled={inputData.postock.length <= 1} />
                            {index + 1 === inputData.postock.length && <Button id={`${pageid}-add-row`} subVariant="icon" isTooltip tooltipText="Tambah" size="sm" color="var(--color-primary)" bgColor="var(--color-primary-10)" iconContent={<Plus />} onClick={() => handleAddRow("postock")} />}
                          </Fragment>
                        }>
                        <Select id={`${pageid}-item-name-${index}`} searchable radius="full" label="Nama Item" placeholder="Pilih Item" name="itemname" value={po.itemname} options={allStockData.map((item) => ({ value: item.itemname, label: item.itemname }))} onChange={(selectedValue) => handleRowChange("postock", index, { target: { name: "itemname", value: selectedValue } })} errormsg={errors[`postock.${index}.itemname`] ? errors[`postock.${index}.itemname`] : ""} required />
                        <Input id={`${pageid}-item-sku-${index}`} radius="full" label="SKU Item" placeholder="Masukkan SKU item" type="text" name="sku" value={po.sku} onChange={(e) => handleRowChange("postock", index, e)} errormsg={errors[`postock.${index}.sku`] ? errors[`postock.${index}.sku`] : ""} required />
                        <Input id={`${pageid}-item-qty-${index}`} radius="full" label="Jumlah Item" placeholder="50" type="number" name="stockin" value={po.stockin} onChange={(e) => handleRowChange("postock", index, e)} errormsg={errors[`postock.${index}.stockin`] ? errors[`postock.${index}.stockin`] : ""} required />
                        <Textarea id={`${pageid}-item-note-${index}`} radius="full" label="Catatan" placeholder="Masukkan catatan" name="note" rows={4} value={po.note} onChange={(e) => handleRowChange("postock", index, e)} errormsg={errors[`postock.${index}.note`] ? errors[`postock.${index}.note`] : ""} />
                      </Fieldset>
                    ))}
                  </SubmitForm>
                )}
              </Fragment>
            )}
          </Fragment>
        );
      case "PO MASUK":
        const exportPOReport = (data) => {
          const formattedData = [];
          formattedData.push(data["PO Stock"]);
          data["Detail PO"].forEach((detail) => {
            formattedData.push(detail);
          });
          const workbook = XLSX.utils.book_new();
          const worksheet = XLSX.utils.json_to_sheet(formattedData);
          XLSX.utils.book_append_sheet(workbook, worksheet, "PO Data");
          const pocode = data["PO Stock"].postockcode;
          const filename = `PO_Masuk_${pocode}.xlsx`;
          XLSX.writeFile(workbook, filename);
        };

        return (
          <Fragment>
            <DashboardHead title={pagetitle} desc="Daftar permintaan PO item dari semua cabang. Filter status PO melalui tombol tab, atau klik ikon pada kolom Action untuk memperbarui status PO." />
            <DashboardToolbar>
              <DashboardTool>
                <Input id={`search-data-${pageid}`} radius="full" labeled={false} placeholder="Cari data ..." type="text" value={inPOSearch} onChange={(e) => handleInPOSearch(e.target.value)} leadingicon={<Search />} />
              </DashboardTool>
              <DashboardTool>
                <Select id={`limit-data-${pageid}`} labeled={false} noemptyval radius="full" placeholder="Baris per Halaman" value={limit} options={limitopt} onChange={handleLimitChange} readonly={!isInPOShown} />
              </DashboardTool>
            </DashboardToolbar>
            <TabGroup buttons={postatus} />
            <DashboardBody>
              <Table byNumber isExpandable isXlsxble isEditable isDeletable page={currentPage} limit={limit} isNoData={!isInPOShown} isLoading={isFetching}>
                <THead>
                  <TR>
                    <TH isSorted onSort={() => handleSort(inPOData, setInPOData, "PO Stock.postockcreate", "date")}>
                      Tanggal Dibuat
                    </TH>
                    <TH isSorted onSort={() => handleSort(inPOData, setInPOData, "PO Stock.postockcode", "text")}>
                      Kode PO
                    </TH>
                    <TH isSorted onSort={() => handleSort(inPOData, setInPOData, "PO Stock.username", "text")}>
                      Nama Admin
                    </TH>
                    <TH isSorted onSort={() => handleSort(inPOData, setInPOData, "PO Stock.outletname", "text")}>
                      Nama Cabang
                    </TH>
                    <TH isSorted onSort={() => handleSort(inPOData, setInPOData, "PO Stock.statusstock", "number")}>
                      Status PO
                    </TH>
                  </TR>
                </THead>
                <TBody>
                  {filteredInPOData.map((data, index) => (
                    <TR
                      key={index}
                      expandContent={
                        <Fragment>
                          {data["Detail PO"].map((subdata, idx) => (
                            <Fieldset key={idx} type="row" markers={`${idx + 1}.`}>
                              <Input id={`item-name-${index}-${idx}`} radius="full" label="Nama Item" value={subdata.itemname} readonly />
                              <Input id={`item-sku-${index}-${idx}`} radius="full" label="Kode SKU" value={subdata.sku} readonly />
                              <Input id={`item-qty-${index}-${idx}`} radius="full" label="Jumlah Item" value={subdata.qty} readonly />
                              <Textarea id={`item-note-${index}-${idx}`} radius="full" label="Keterangan" rows={4} value={subdata.note} fallbackValue="Tidak ada keterangan." readonly />
                            </Fieldset>
                          ))}
                        </Fragment>
                      }
                      onEdit={() => openEdit(data["PO Stock"].idpostock)}
                      onDelete={() => {}}
                      onXlsx={() => exportPOReport(data)}>
                      <TD>{newDate(data["PO Stock"].postockcreate, "id")}</TD>
                      <TD type="code">{data["PO Stock"].postockcode}</TD>
                      <TD>{toTitleCase(data["PO Stock"].username)}</TD>
                      <TD>{toTitleCase(data["PO Stock"].outletname)}</TD>
                      <TD>{poAlias(data["PO Stock"].statusstock)}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </DashboardBody>
            {isInPOShown && <Pagination radius="full" nospacing currentPage={currentPage} ttlPages={totalPages} onChange={handlePageChange} />}
            {isFormOpen && (
              <SubmitForm formTitle="Ubah Status PO" operation="update" fetching={isFormFetching} onSubmit={(e) => handleSubmit(e, "editstockpo")} loading={isSubmitting} onClose={closeForm}>
                <Select id={`${pageid}-po-status`} noemptyval radius="full" label="Status PO" placeholder="Set status" name="status" value={inputData.status} options={postatopt} onChange={(selectedValue) => handleInputChange({ target: { name: "status", value: selectedValue } })} />
                {inputData.postock.map((po, index) => (
                  <Fieldset key={index} type="row" markers={`${index + 1}.`}>
                    <Select id={`${pageid}-item-name-${index}`} searchable radius="full" label="Nama Item" placeholder="Pilih Item" name="itemname" value={po.itemname} options={allStockData.map((item) => ({ value: item.itemname, label: item.itemname }))} onChange={(selectedValue) => handleRowChange("postock", index, { target: { name: "itemname", value: selectedValue } })} errormsg={errors[`postock.${index}.itemname`] ? errors[`postock.${index}.itemname`] : ""} required />
                    <Input id={`${pageid}-item-sku-${index}`} radius="full" label="SKU Item" placeholder="Masukkan SKU item" type="text" name="sku" value={po.sku} onChange={(e) => handleRowChange("postock", index, e)} errormsg={errors[`postock.${index}.sku`] ? errors[`postock.${index}.sku`] : ""} required />
                    <Input id={`${pageid}-item-qty-${index}`} radius="full" label="Jumlah Item" placeholder="50" type="number" name="stockin" value={po.stockin} onChange={(e) => handleRowChange("postock", index, e)} errormsg={errors[`postock.${index}.stockin`] ? errors[`postock.${index}.stockin`] : ""} required />
                    <Textarea id={`${pageid}-item-note-${index}`} radius="full" label="Catatan" placeholder="Masukkan catatan" name="note" rows={4} value={po.note} onChange={(e) => handleRowChange("postock", index, e)} errormsg={errors[`postock.${index}.note`] ? errors[`postock.${index}.note`] : ""} />
                  </Fieldset>
                ))}
              </SubmitForm>
            )}
          </Fragment>
        );
      case "PO KELUAR":
        return (
          <Fragment>
            <DashboardHead title={pagetitle} />
            <DashboardToolbar>
              <DashboardTool>
                <Input id={`search-data-${pageid}`} radius="full" labeled={false} placeholder="Cari data ..." type="text" leadingicon={<Search />} />
              </DashboardTool>
              <DashboardTool>
                <Select id={`limit-data-${pageid}`} labeled={false} noemptyval radius="full" placeholder="Baris per Halaman" value={limit} options={limitopt} onChange={handleLimitChange} readonly />
              </DashboardTool>
            </DashboardToolbar>
            <DashboardBody>
              <Table isNoData></Table>
            </DashboardBody>
          </Fragment>
        );
      case "REKAM MEDIS":
        const handleCustChange = (value) => {
          setSelectedCust(value);
          let custFind = false;
          let matchedData;
          allCustData.forEach((item) => {
            if (item.idauthuser === value) {
              matchedData = item;
              custFind = true;
            }
          });
          if (custFind) {
            setOnpageData({ ...onpageData, name: matchedData.username, address: matchedData.address, email: matchedData.useremail, phone: matchedData.userphone, gender: matchedData.gender, nik: matchedData.noktp, image: matchedData.imgktp, birth: matchedData.birthday });
            log("selected cust ID:", matchedData.idauthuser);
          } else {
            setOnpageData({ ...onpageData, name: "", address: "", email: "", phone: "", gender: "", nik: "", image: null, birth: "" });
          }
        };

        const handleAddError = () => showNotifications("danger", "Mohon pilih Customer terlebih dahulu sebelum menambahkan data.");
        const handleOnpageTabChange = (id) => setOnpageTabId(id);

        const onPageTabButton = [
          { label: "Profil", onClick: () => handleOnpageTabChange("1"), active: onPageTabId === "1" },
          { label: "Histori Rekam Medis", onClick: () => handleOnpageTabChange("4"), active: onPageTabId === "4" },
          { label: "Histori Reservasi", onClick: () => handleOnpageTabChange("2"), active: onPageTabId === "2" },
          { label: "Histori Order", onClick: () => handleOnpageTabChange("3"), active: onPageTabId === "3" },
        ];

        const renderSection = () => {
          switch (onPageTabId) {
            case "1":
              return (
                <OnpageForm onSubmit={(e) => handleSubmit(e, "edituser")}>
                  <FormHead title="Informasi Pribadi" />
                  <Fieldset>
                    <Input id={`${pageid}-name`} radius="full" label="Nama Pelanggan" placeholder="e.g. John Doe" type="text" name="name" value={onpageData.name} onChange={handleInputChange} errormsg={errors.name} required readonly={custExist} />
                    <Input id={`${pageid}-phone`} radius="full" label="Nomor Telepon" placeholder="0882xxx" type="tel" name="phone" value={onpageData.phone} onChange={handleInputChange} errormsg={errors.phone} required />
                    <Input id={`${pageid}-email`} radius="full" label="Email" placeholder="customer@gmail.com" type="email" name="email" value={onpageData.email} onChange={handleInputChange} errormsg={errors.email} required readonly={custExist} />
                    <Input id={`${pageid}-nik`} radius="full" label="Nomor KTP" placeholder="3271xxx" type="number" name="nik" value={onpageData.nik} onChange={handleInputChange} errormsg={errors.nik} required />
                  </Fieldset>
                  <Fieldset>
                    <Input id={`${pageid}-birth`} radius="full" label="Tanggal Lahir" type="date" name="birth" max={getCurrentDate()} value={onpageData.birth} onChange={handleInputChange} errormsg={errors.birth} required />
                    <Select id={`${pageid}-gender`} radius="full" label="Jenis Kelamin" placeholder="Pilih jenis kelamin" name="gender" value={onpageData.gender} options={genderopt} onChange={(selectedValue) => handleInputChange({ target: { name: "gender", value: selectedValue } })} errormsg={errors.gender} required />
                    <Input id={`${pageid}-address`} radius="full" label="Alamat" placeholder="123 Main Street" type="text" name="address" value={onpageData.address} onChange={handleInputChange} errormsg={errors.address} required />
                    <Input id={`${pageid}-scanid`} type="file" accept="image/*" radius="full" label="Scan KTP" name="image" initial={onpageData.image} onChange={handleImageSelect} />
                  </Fieldset>
                  <FormFooter>
                    <Button id={`add-new-data-${pageid}`} type="submit" action="onpage" radius="full" buttonText={selectedCust ? "Simpan Perubahan" : "Simpan Baru"} isLoading={isSubmitting} startContent={<Check />} loadingContent={<LoadingContent />} isDisabled={errors.name !== "" || errors.phone !== "" || errors.email !== "" || errors.nik !== "" || errors.birth !== "" || errors.gender !== "" || errors.address !== ""} />
                  </FormFooter>
                </OnpageForm>
              );
            case "2":
              return (
                <Table byNumber isNoData={historyReservData.length > 0 ? false : true || selectedCust === null || selectedCust === ""} isLoading={isFetching}>
                  <THead>
                    <TR>
                      <TH isSorted onSort={() => handleSort(historyReservData, setHistoryReservData, "datetimecreate", "date")}>
                        Tanggal Dibuat
                      </TH>
                      <TH isSorted onSort={() => handleSort(historyReservData, setHistoryReservData, "reservationdate", "number")}>
                        Tanggal Reservasi
                      </TH>
                      <TH isSorted onSort={() => handleSort(historyReservData, setHistoryReservData, "reservationtime", "number")}>
                        Jam Reservasi
                      </TH>
                      <TH isSorted onSort={() => handleSort(historyReservData, setHistoryReservData, "rscode", "text")}>
                        Kode Reservasi
                      </TH>
                      <TH isSorted onSort={() => handleSort(historyReservData, setHistoryReservData, "name", "text")}>
                        Nama Customer
                      </TH>
                      <TH isSorted onSort={() => handleSort(historyReservData, setHistoryReservData, "phone", "number")}>
                        Nomor Telepon
                      </TH>
                      <TH isSorted onSort={() => handleSort(historyReservData, setHistoryReservData, "email", "text")}>
                        Alamat Email
                      </TH>
                      <TH isSorted onSort={() => handleSort(historyReservData, setHistoryReservData, "status_reservation", "number")}>
                        Status Reservasi
                      </TH>
                      <TH isSorted onSort={() => handleSort(historyReservData, setHistoryReservData, "status_dp", "number")}>
                        Status DP
                      </TH>
                      <TH isSorted onSort={() => handleSort(historyReservData, setHistoryReservData, "service", "text")}>
                        Layanan
                      </TH>
                      <TH isSorted onSort={() => handleSort(historyReservData, setHistoryReservData, "typeservice", "text")}>
                        Jenis Layanan
                      </TH>
                      <TH isSorted onSort={() => handleSort(historyReservData, setHistoryReservData, "price_reservation", "number")}>
                        Biaya DP
                      </TH>
                      <TH isSorted onSort={() => handleSort(historyReservData, setHistoryReservData, "voucher", "text")}>
                        Kode Voucher
                      </TH>
                    </TR>
                  </THead>
                  <TBody>
                    {historyReservData.map((data, index) => (
                      <TR key={index} isComplete={data.status_reservation === "1"} isWarning={data.status_reservation === "2"} isDanger={data.status_reservation === "3"}>
                        <TD>{newDate(data.datetimecreate, "id")}</TD>
                        <TD>{data.reservationdate}</TD>
                        <TD>{data.reservationtime}</TD>
                        <TD type="code">{data.rscode}</TD>
                        <TD>{toTitleCase(data.name)}</TD>
                        <TD type="number" isCopy>
                          {data.phone}
                        </TD>
                        <TD>{data.email}</TD>
                        <TD>{reservAlias(data.status_reservation)}</TD>
                        <TD>{paymentAlias(data.status_dp)}</TD>
                        <TD>{toTitleCase(data.service)}</TD>
                        <TD>{toTitleCase(data.typeservice)}</TD>
                        <TD>{newPrice(data.price_reservation)}</TD>
                        <TD type="code">{data.voucher}</TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>
              );
            case "3":
              return (
                <Table byNumber isClickable isNoData={historyOrderData.length > 0 ? false : true || selectedCust === null || selectedCust === ""} isLoading={isFetching}>
                  <THead>
                    <TR>
                      <TH isSorted onSort={() => handleSort(historyOrderData, setHistoryOrderData, "transactioncreate", "date")}>
                        Tanggal Dibuat
                      </TH>
                      <TH isSorted onSort={() => handleSort(historyOrderData, setHistoryOrderData, "transactionname", "text")}>
                        Nama Pengguna
                      </TH>
                      <TH isSorted onSort={() => handleSort(historyOrderData, setHistoryOrderData, "rscode", "text")}>
                        Kode Reservasi
                      </TH>
                      <TH isSorted onSort={() => handleSort(historyOrderData, setHistoryOrderData, "noinvoice", "number")}>
                        Nomor Invoice
                      </TH>
                      <TH isSorted onSort={() => handleSort(historyOrderData, setHistoryOrderData, "transactionphone", "number")}>
                        Nomor Telepon
                      </TH>
                      <TH isSorted onSort={() => handleSort(historyOrderData, setHistoryOrderData, "payment", "text")}>
                        Metode Pembayaran
                      </TH>
                      <TH isSorted onSort={() => handleSort(historyOrderData, setHistoryOrderData, "totalpay", "number")}>
                        Total Pembayaran
                      </TH>
                      <TH isSorted onSort={() => handleSort(historyOrderData, setHistoryOrderData, "transactionstatus", "number")}>
                        Status Pembayaran
                      </TH>
                      <TH isSorted onSort={() => handleSort(historyOrderData, setHistoryOrderData, "voucher", "text")}>
                        Kode Voucher
                      </TH>
                      <TH isSorted onSort={() => handleSort(historyOrderData, setHistoryOrderData, "dentist", "text")}>
                        Nama Dokter
                      </TH>
                    </TR>
                  </THead>
                  <TBody>
                    {historyOrderData.map((data, index) => (
                      <TR key={index} isComplete={data.transactionstatus === "1"} isDanger={data.transactionstatus === "2"} onClick={() => navigate(`/${toPathname(parent)}/order-customer/${toPathname(data.idtransaction)}`)}>
                        <TD>{newDate(data.transactioncreate, "id")}</TD>
                        <TD>{toTitleCase(data.transactionname)}</TD>
                        <TD type="code">{data.rscode}</TD>
                        <TD type="code">{data.noinvoice}</TD>
                        <TD type="number" isCopy>
                          {data.transactionphone}
                        </TD>
                        <TD>{data.payment}</TD>
                        <TD>{newPrice(data.totalpay)}</TD>
                        <TD>{orderAlias(data.transactionstatus)}</TD>
                        <TD type="code">{data.voucher}</TD>
                        <TD>{toTitleCase(data.dentist)}</TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>
              );
            case "4":
              const handleRMDelete = async (params) => {
                const confirmmsg = `Apakah anda yakin untuk menghapus data terpilih dari ${toTitleCase(slug)}?`;
                const successmsg = `Selamat! Data terpilih dari ${toTitleCase(slug)} berhasil dihapus.`;
                const errormsg = "Terjadi kesalahan saat menghapus data. Mohon periksa koneksi internet anda dan coba lagi.";
                const confirm = window.confirm(confirmmsg);
                if (!confirm) {
                  return;
                }
                try {
                  const formData = new FormData();
                  formData.append("data", JSON.stringify({ secret, idmedics: params }));
                  await apiCrud(formData, "office", "delmedics");
                  showNotifications("success", successmsg);
                  await fetchData();
                  await fetchAdditionalData();
                } catch (error) {
                  showNotifications("danger", errormsg);
                  console.error(errormsg, error);
                }
              };

              return (
                <Fragment>
                  <Table byNumber isEditable isDeletable isNoData={medicRcdData.length > 0 ? false : true || selectedCust === null || selectedCust === ""} isLoading={isFetching}>
                    <THead>
                      <TR>
                        <TH isSorted onSort={() => handleSort(medicRcdData, setMedicRcdData, "datemedical", "date")}>
                          Tanggal Dibuat
                        </TH>
                        <TH isSorted onSort={() => handleSort(medicRcdData, setMedicRcdData, "rscode", "text")}>
                          Kode Reservasi
                        </TH>
                        <TH isSorted onSort={() => handleSort(medicRcdData, setMedicRcdData, "ageyear", "number")}>
                          Usia Pasien
                        </TH>
                        <TH isSorted onSort={() => handleSort(medicRcdData, setMedicRcdData, "room", "text")}>
                          Ruang Pemeriksaan
                        </TH>
                        <TH isSorted onSort={() => handleSort(medicRcdData, setMedicRcdData, "service", "text")}>
                          Layanan
                        </TH>
                        <TH isSorted onSort={() => handleSort(medicRcdData, setMedicRcdData, "servicetype", "text")}>
                          Jenis Layanan
                        </TH>
                        <TH isSorted onSort={() => handleSort(medicRcdData, setMedicRcdData, "dentist", "text")}>
                          Dokter Pemeriksa
                        </TH>
                      </TR>
                    </THead>
                    <TBody>
                      {medicRcdData.map((data, index) => (
                        <TR key={index} onEdit={() => navigate(`${pagepath}/${data.idmedicalrecords}`)} onDelete={() => handleRMDelete(data.idmedicalrecords)}>
                          <TD>{newDate(data.datemedical, "id")}</TD>
                          <TD type="code">{data.rscode}</TD>
                          <TD>{`${data.ageyear} tahun, ${data.agemonth} bulan, ${data.ageday} hari`}</TD>
                          <TD>{toTitleCase(data.room)}</TD>
                          <TD>{toTitleCase(data.service)}</TD>
                          <TD>{toTitleCase(data.servicetype)}</TD>
                          <TD>{toTitleCase(data.dentist)}</TD>
                        </TR>
                      ))}
                    </TBody>
                  </Table>
                  {isFormOpen && (
                    <SubmitForm size="md" formTitle="Tambah Data Rekam Medis" operation="add" fetching={isFormFetching} onSubmit={(e) => handleSubmit(e, "addmedics")} loading={isSubmitting} onClose={closeForm}>
                      <Fieldset>
                        <Input id={`${pageid}-birth`} radius="full" label="Tanggal Lahir" type="date" name="birth" max={getCurrentDate()} value={inputData.birth} onChange={handleInputChange} errormsg={errors.birth} required />
                        <Input id={`${pageid}-ageyear`} radius="full" label="Umur (tahun)" placeholder="24" fallbackValue="24" type="number" name="ageyear" value={inputData.ageyear} readonly />
                      </Fieldset>
                      <Fieldset>
                        <Input id={`${pageid}-agemonth`} radius="full" label="Umur (bulan)" placeholder="5" fallbackValue="5" type="number" name="agemonth" value={inputData.agemonth} readonly />
                        <Input id={`${pageid}-ageday`} radius="full" label="Umur (hari)" placeholder="10" fallbackValue="10" type="number" name="ageday" value={inputData.ageday} readonly />
                      </Fieldset>
                    </SubmitForm>
                  )}
                </Fragment>
              );
            default:
              return <Table isNoData={true}></Table>;
          }
        };

        const addtCustData = [{ idauthuser: "", username: "Tambah Baru" }];
        const mergedCustData = [...addtCustData, ...allCustData];

        const openRMForm = () => {
          setSelectedMode("add");
          setIsFormOpen(true);
          const selecteduser = allCustData.find((data) => data.idauthuser === selectedCust);
          if (selecteduser) {
            setInputData({ ...inputData, birth: selecteduser.birthday });
          } else {
            setInputData({ ...inputData });
          }
        };

        return (
          <Fragment>
            <DashboardHead title={pagetitle} desc="Panel untuk memperbarui profil data dan menambah histori catatan medis pasien." />
            <DashboardToolbar>
              <DashboardTool>
                <Select id={`cust-select-${pageid}`} labeled={false} searchable radius="full" placeholder="Pilih Customer" name="id" options={mergedCustData.map((cust) => ({ value: cust.idauthuser, label: toTitleCase(cust.username) }))} onChange={handleCustChange} />
              </DashboardTool>
              {onPageTabId === "4" && <Button id={`add-new-data-${pageid}`} radius="full" buttonText="Tambah" onClick={selectedCust ? openRMForm : handleAddError} startContent={<Plus />} />}
            </DashboardToolbar>
            <TabGroup buttons={onPageTabButton} />
            <DashboardBody>{renderSection()}</DashboardBody>
          </Fragment>
        );
      case "XENDIT":
        return (
          <Fragment>
            <DashboardHead title={pagetitle} desc="Daftar Customer yang memiliki riwayat Reservasi. Data ini dibuat otomatis saat proses reservasi dilakukan." />
            <DashboardToolbar>
              <DashboardTool>
                <Input id={`search-data-${pageid}`} radius="full" labeled={false} placeholder="Cari data ..." type="text" value={xenditSearch} onChange={(e) => handleXenditSearch(e.target.value)} leadingicon={<Search />} />
                {level === "admin" && <Select id={`${pageid}-outlet`} labeled={false} searchable radius="full" placeholder="Pilih Cabang" value={selectedBranch} options={allBranchData.map((branch) => ({ value: branch.idoutlet, label: branch.outlet_name.replace("E DENTAL - DOKTER GIGI", "CABANG") }))} onChange={handleBranchChange} />}
              </DashboardTool>
              <DashboardTool>
                <Select id={`limit-data-${pageid}`} labeled={false} noemptyval radius="full" placeholder="Baris per Halaman" value={limit} options={limitopt} onChange={handleLimitChange} readonly={!isXenditShown} />
                <Button id={`export-data-${pageid}`} radius="full" bgColor="var(--color-green)" buttonText="Export" onClick={() => exportToExcel(filteredXenditData, "Daftar Invoice", `daftar_invoice_${getCurrentDate()}`)} isDisabled={!isXenditShown} startContent={<Export />} />
              </DashboardTool>
            </DashboardToolbar>
            <DashboardBody>
              <Table byNumber page={currentPage} limit={limit} isNoData={!isXenditShown} isLoading={isFetching}>
                <THead>
                  <TR>
                    <TH isSorted onSort={() => handleSort(invoiceData, setInvoiceData, "xenditcreate", "date")}>
                      Tanggal Dibuat
                    </TH>
                    <TH isSorted onSort={() => handleSort(invoiceData, setInvoiceData, "idoutlet", "number")}>
                      Nama Cabang
                    </TH>
                    <TH isSorted onSort={() => handleSort(invoiceData, setInvoiceData, "external_id", "text")}>
                      Kode
                    </TH>
                    <TH isSorted onSort={() => handleSort(invoiceData, setInvoiceData, "account_number", "number")}>
                      Nomor VA
                    </TH>
                    <TH isSorted onSort={() => handleSort(invoiceData, setInvoiceData, "bank_code", "text")}>
                      Bank
                    </TH>
                    <TH isSorted onSort={() => handleSort(invoiceData, setInvoiceData, "expected_amount", "number")}>
                      Total Bayar
                    </TH>
                    <TH isSorted onSort={() => handleSort(invoiceData, setInvoiceData, "expiration_date", "date")}>
                      Tanggal Expire
                    </TH>
                  </TR>
                </THead>
                <TBody>
                  {filteredXenditData.map((data, index) => (
                    <TR key={index}>
                      <TD>{data.xenditcreate && newDate(data.xenditcreate, "id")}</TD>
                      <TD>{data.outlet_name && data.outlet_name}</TD>
                      <TD type="code">{data.external_id && data.external_id}</TD>
                      <TD type="code">{data.account_number && data.account_number}</TD>
                      <TD type="link">{data.bank_code && data.bank_code}</TD>
                      <TD>{newPrice(data.expected_amount && data.expected_amount)}</TD>
                      <TD>{newDate(data.expiration_date && data.expiration_date, "id")}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </DashboardBody>
            {isXenditShown && <Pagination radius="full" nospacing currentPage={currentPage} ttlPages={totalPages} onChange={handlePageChange} />}
          </Fragment>
        );
      case "RESERVATION":
        return (
          <Fragment>
            <DashboardHead title={pagetitle} desc="Data Reservasi customer. Klik Tambah Baru untuk membuat data reservasi baru, atau klik ikon di kolom Action untuk memperbarui data." />
            <DashboardToolbar>
              <DashboardTool>
                <div style={{ display: "flex", flexDirection: "row", gap: "var(--pixel-5)" }}>
                  <Input id={`search-data-${pageid}`} radius="full" labeled={false} placeholder="Cari data ..." type="text" name="inspect-data" value={searchTerm} onChange={handleSearch} />
                  <Button subVariant="icon" radius="full" iconContent={<Search />} onClick={fetchSearchData} />
                </div>
                {level === "admin" && <Select id={`${pageid}-outlet`} labeled={false} searchable radius="full" placeholder="Pilih Cabang" value={selectedBranch} options={allBranchData.map((branch) => ({ value: branch.idoutlet, label: branch.outlet_name.replace("E DENTAL - DOKTER GIGI", "CABANG") }))} onChange={handleBranchChange} />}
              </DashboardTool>
              <DashboardTool>
                <Select id={`limit-data-${pageid}`} labeled={false} noemptyval radius="full" placeholder="Baris per Halaman" value={limit} options={limitopt} onChange={handleLimitChange} readonly={searchTerm !== ""} />
                <Button id={`add-new-data-${pageid}`} radius="full" buttonText="Tambah" onClick={openForm} startContent={<Plus />} />
                <Button id={`export-data-${pageid}`} radius="full" bgColor="var(--color-green)" buttonText="Export" onClick={() => exportToExcel(searchTerm === "" ? reservData : searchResult, "Daftar Reservasi", `daftar_reservasi_${getCurrentDate()}`)} isDisabled={searchTerm === "" ? (reservData.length > 0 ? false : true) : searchResult.length > 0 ? false : true} startContent={<Export />} />
              </DashboardTool>
            </DashboardToolbar>
            <DashboardBody>
              <Table byNumber isEditable page={searchResult.length > 0 ? undefined : currentPage} limit={searchResult.length > 0 ? undefined : limit} isNoData={searchTerm === "" ? (reservData.length > 0 ? false : true) : searchResult.length > 0 ? false : true} isLoading={isFetching}>
                <THead>
                  <TR>
                    <TH isSorted onSort={() => handleSort(reservData, setReservData, "status_dp", "number")}>
                      Status DP
                    </TH>
                    <TH isSorted onSort={() => handleSort(reservData, setReservData, "reservationdate", "date")}>
                      Tanggal Reservasi
                    </TH>
                    <TH isSorted onSort={() => handleSort(reservData, setReservData, "reservationtime", "number")}>
                      Jam Reservasi
                    </TH>
                    <TH isSorted onSort={() => handleSort(reservData, setReservData, "rscode", "text")}>
                      Kode Reservasi
                    </TH>
                    <TH isSorted onSort={() => handleSort(reservData, setReservData, "name", "text")}>
                      Nama Customer
                    </TH>
                    <TH isSorted onSort={() => handleSort(reservData, setReservData, "phone", "number")}>
                      Nomor Telepon
                    </TH>
                    <TH isSorted onSort={() => handleSort(reservData, setReservData, "email", "text")}>
                      Alamat Email
                    </TH>
                    <TH isSorted onSort={() => handleSort(reservData, setReservData, "status_reservation", "number")}>
                      Status Reservasi
                    </TH>
                    <TH isSorted onSort={() => handleSort(reservData, setReservData, "service", "text")}>
                      Layanan
                    </TH>
                    <TH isSorted onSort={() => handleSort(reservData, setReservData, "typeservice", "text")}>
                      Jenis Layanan
                    </TH>
                    <TH isSorted onSort={() => handleSort(reservData, setReservData, "price_reservation", "number")}>
                      Biaya DP
                    </TH>
                    <TH isSorted onSort={() => handleSort(reservData, setReservData, "voucher", "text")}>
                      Kode Voucher
                    </TH>
                    <TH isSorted onSort={() => handleSort(reservData, setReservData, "outlet_name", "text")}>
                      Nama Cabang
                    </TH>
                    <TH isSorted onSort={() => handleSort(reservData, setReservData, "note", "text")}>
                      Catatan
                    </TH>
                    <TH isSorted onSort={() => handleSort(reservData, setReservData, "datetimecreate", "date")}>
                      Tanggal Dibuat
                    </TH>
                  </TR>
                </THead>
                <TBody>
                  {(searchTerm !== "" ? searchResult : reservData).map((data, index) => (
                    <TR key={index} onEdit={data.status_reservation === "0" ? () => openEdit(data.idreservation) : () => showNotifications("danger", "Reservasi dengan status yang telah selesai, reschedule atau dibatalkan tidak dapat diperbarui.")} isComplete={data.status_reservation === "1"} isWarning={data.status_reservation === "2"} isDanger={data.status_reservation === "3"}>
                      <TD>{paymentAlias(data.status_dp)}</TD>
                      <TD>{data.reservationdate}</TD>
                      <TD>{data.reservationtime}</TD>
                      <TD type="code">{data.rscode}</TD>
                      <TD>{toTitleCase(data.name)}</TD>
                      <TD type="number" isCopy>
                        {data.phone}
                      </TD>
                      <TD>{data.email}</TD>
                      <TD>{reservAlias(data.status_reservation)}</TD>
                      <TD>{toTitleCase(data.service)}</TD>
                      <TD>{toTitleCase(data.typeservice)}</TD>
                      <TD>{newPrice(data.price_reservation)}</TD>
                      <TD type="code">{data.voucher}</TD>
                      <TD>{toTitleCase(data.outlet_name)}</TD>
                      <TD>{data.note}</TD>
                      <TD>{newDate(data.datetimecreate, "id")}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </DashboardBody>
            {searchTerm === "" && <Pagination radius="full" nospacing currentPage={currentPage} ttlPages={totalPages} onChange={handlePageChange} />}
            {isFormOpen && (
              <SubmitForm size={selectedMode === "update" ? "sm" : "lg"} formTitle={selectedMode === "update" ? "Ubah Status Reservasi" : "Tambah Data Reservasi"} operation={selectedMode} fetching={isFormFetching} onSubmit={(e) => handleSubmit(e, "cudreservation")} loading={isSubmitting} onClose={closeForm}>
                {selectedMode === "update" ? (
                  <Fieldset>
                    <Select id={`${pageid}-reserv-status`} noemptyval radius="full" label="Status Reservasi" placeholder="Set status" name="status" value={inputData.status} options={reservstatopt} onChange={(selectedValue) => handleInputChange({ target: { name: "status", value: selectedValue } })} />
                    {inputData.statuspayment !== "1" && <Select id={`${pageid}-dp-status`} noemptyval radius="full" label="Status DP" placeholder="Set status" name="statuspayment" value={inputData.statuspayment} options={paymentstatopt} onChange={(selectedValue) => handleInputChange({ target: { name: "statuspayment", value: selectedValue } })} />}
                  </Fieldset>
                ) : (
                  <Fragment>
                    <Fieldset>
                      <Input id={`${pageid}-phone`} radius="full" label="Nomor Telepon" placeholder="0882xxx" type="tel" name="phone" value={inputData.phone} onChange={handleInputChange} additmsg={custExist ? "Customer sudah terdaftar. Nama dan Email otomatis terisi." : ""} errormsg={errors.phone} required />
                      <Input id={`${pageid}-name`} radius="full" label="Nama Pelanggan" placeholder="e.g. John Doe" type="text" name="name" value={inputData.name} onChange={handleInputChange} errormsg={errors.name} required readonly={custExist} />
                      <Input id={`${pageid}-email`} radius="full" label="Email" placeholder="customer@gmail.com" type="email" name="email" value={inputData.email} onChange={handleInputChange} errormsg={errors.email} required readonly={custExist} />
                    </Fieldset>
                    <Fieldset>
                      <Select id={`${pageid}-service`} searchable radius="full" label="Nama Layanan" placeholder="Pilih layanan" name="service" value={inputData.service} options={allservicedata.map((service) => ({ value: service["Nama Layanan"].servicename, label: service["Nama Layanan"].servicename }))} onChange={(selectedValue) => handleInputChange({ target: { name: "service", value: selectedValue } })} errormsg={errors.service} required />
                      <Select id={`${pageid}-subservice`} searchable radius="full" label="Jenis Layanan" placeholder={inputData.service ? "Pilih jenis layanan" : "Mohon pilih layanan dahulu"} name="sub_service" value={inputData.sub_service} options={(inputData.service && allservicedata.find((s) => s["Nama Layanan"].servicename === inputData.service)?.["Jenis Layanan"].map((type) => ({ value: type.servicetypename, label: type.servicetypename }))) || []} onChange={(selectedValue) => handleInputChange({ target: { name: "sub_service", value: selectedValue } })} errormsg={errors.sub_service} required disabled={!inputData.service} />
                      <Input id={`${pageid}-voucher`} radius="full" label="Kode Voucher" placeholder="e.g 598RE3" type="text" name="vouchercode" value={inputData.vouchercode} onChange={handleInputChange} errormsg={errors.vouchercode} />
                    </Fieldset>
                    <Fieldset>
                      <Input id={`${pageid}-date`} radius="full" label="Tanggal Reservasi" placeholder="Atur tanggal" type="date" name="date" min={getCurrentDate()} value={inputData.date} onChange={handleInputChange} errormsg={errors.date} required />
                      <Select id={`${pageid}-time`} searchable radius="full" label="Jam Reservasi" placeholder={inputData.date ? "Pilih jadwal tersedia" : "Mohon pilih tanggal dahulu"} name="time" value={inputData.time} options={availHoursData.map((hour) => ({ value: hour, label: hour }))} onChange={(selectedValue) => handleInputChange({ target: { name: "time", value: selectedValue } })} errormsg={errors.time} required disabled={!inputData.date} />
                    </Fieldset>
                    <Textarea name="note" radius="full" label="Catatan" placeholder="Masukkan catatan/sumber informasi" value={inputData.note} onChange={handleInputChange} errormsg={errors.note} rows={4} />
                    {inputData.service === "RESERVATION" && (
                      <Fieldset>
                        <Input id={`${pageid}-price`} radius="full" label="Biaya Layanan" placeholder="Masukkan biaya layanan" type="number" name="price" value={inputData.price} onChange={handleInputChange} errormsg={errors.price} required={inputData.service === "RESERVATION"} />
                        <Select id={`${pageid}-payments`} searchable radius="full" label="Metode Pembayaran" placeholder="Pilih metode pembayaran" name="bank_code" value={inputData.bank_code} options={fvaListData.map((va) => ({ value: va.code, label: va.name }))} onChange={(selectedValue) => handleInputChange({ target: { name: "bank_code", value: selectedValue } })} errormsg={errors.bank_code} required={inputData.service === "RESERVATION"} />
                      </Fieldset>
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
          const opt = { margin: 0.2, filename: `invoice-${toPathname(selectedOrderData["order"].transactionname)}-${selectedOrderData["order"].rscode}.pdf`, image: { type: "jpeg", quality: 0.99 }, html2canvas: { scale: 2 }, jsPDF: { unit: "in", format: "letter", orientation: "portrait" } };
          html2pdf().from(element).set(opt).save();
        };

        const sendPDFLink = async (number, name) => {
          const element = printRef.current;
          const opt = { margin: 0.2, filename: `invoice-${toPathname(selectedOrderData["order"].transactionname)}-${selectedOrderData["order"].rscode}.pdf`, image: { type: "jpeg", quality: 0.99 }, html2canvas: { scale: 2 }, jsPDF: { unit: "in", format: "letter", orientation: "portrait" } };
          try {
            const pdfBlob = await html2pdf().from(element).set(opt).outputPdf("blob");
            const pdfURL = URL.createObjectURL(pdfBlob);
            contactWhatsApp(number, name, pdfURL);
            setTimeout(() => URL.revokeObjectURL(pdfURL), 30 * 60 * 1000);
          } catch (error) {
            console.error("Failed to generate and copy PDF link:", error);
          }
        };

        const contactWhatsApp = (number, name, invLink) => {
          const wanumber = getNormalPhoneNumber(number);
          window.open(`https://wa.me/${wanumber}?text=Halo%20${name}!%0ATerima%20kasih%20sudah%20melakukan%20transaksi%20di%20Edental.%20Klik%20link%20dibawah%20untuk%20mengunduh%20Invoice%20transaksimu%20%3A%0A%0A${invLink}%0A%0A*Link%20diatas%20berlaku%20selama%2030%20menit.%20Hubungi%20kami%20jika%20link%20tidak%20dapat%20diakses.%20Terima%20kasih!`, "_blank");
        };

        return (
          <Fragment>
            <DashboardHead title={pagetitle} desc="Data order customer ini dibuat otomatis saat proses reservasi dilakukan. Klik baris data untuk melihat masing-masing detail layanan & produk terpakai." />
            <DashboardToolbar>
              <DashboardTool>
                <div style={{ display: "flex", flexDirection: "row", gap: "var(--pixel-5)" }}>
                  <Input id={`search-data-${pageid}`} radius="full" labeled={false} placeholder="Cari data ..." type="text" name="inspect-data" value={searchTerm} onChange={handleSearch} />
                  <Button subVariant="icon" radius="full" iconContent={<Search />} onClick={fetchSearchData} />
                </div>
                {level === "admin" && <Select id={`${pageid}-outlet`} labeled={false} searchable radius="full" placeholder="Pilih Cabang" value={selectedBranch} options={allBranchData.map((branch) => ({ value: branch.idoutlet, label: branch.outlet_name.replace("E DENTAL - DOKTER GIGI", "CABANG") }))} onChange={handleBranchChange} />}
              </DashboardTool>
              <DashboardTool>
                <Select id={`limit-data-${pageid}`} labeled={false} noemptyval radius="full" placeholder="Baris per Halaman" value={limit} options={limitopt} onChange={handleLimitChange} readonly={searchTerm !== ""} />
                <Button id={`export-data-${pageid}`} radius="full" bgColor="var(--color-green)" buttonText="Export" onClick={() => exportToExcel(searchTerm === "" ? reservData : searchResult, "Daftar Order", `daftar_order_${getCurrentDate()}`)} isDisabled={searchTerm === "" ? (reservData.length > 0 ? false : true) : searchResult.length > 0 ? false : true} startContent={<Export />} />
              </DashboardTool>
            </DashboardToolbar>
            <DashboardBody>
              <Table byNumber isExpandable isPrintable page={searchResult.length > 0 ? undefined : currentPage} limit={searchResult.length > 0 ? undefined : limit} isNoData={searchTerm === "" ? (orderData.length > 0 ? false : true) : searchResult.length > 0 ? false : true} isLoading={isFetching}>
                <THead>
                  <TR>
                    <TH isSorted onSort={() => handleSort(orderData, setOrderData, "order.transactioncreate", "date")}>
                      Tanggal Dibuat
                    </TH>
                    <TH isSorted onSort={() => handleSort(orderData, setOrderData, "order.transactionupdate", "date")}>
                      Tanggal Tiba
                    </TH>
                    <TH isSorted onSort={() => handleSort(orderData, setOrderData, "order.transactionstatus", "number")}>
                      Status Pembayaran
                    </TH>
                    <TH isSorted onSort={() => handleSort(orderData, setOrderData, "order.transactionname", "text")}>
                      Nama Pengguna
                    </TH>
                    <TH isSorted onSort={() => handleSort(orderData, setOrderData, "order.rscode", "text")}>
                      Kode Reservasi
                    </TH>
                    <TH isSorted onSort={() => handleSort(orderData, setOrderData, "order.noinvoice", "number")}>
                      Nomor Invoice
                    </TH>
                    <TH isSorted onSort={() => handleSort(orderData, setOrderData, "order.transactionphone", "number")}>
                      Nomor Telepon
                    </TH>
                    <TH isSorted onSort={() => handleSort(orderData, setOrderData, "order.payment", "text")}>
                      Metode Pembayaran
                    </TH>
                    <TH isSorted onSort={() => handleSort(orderData, setOrderData, "order.totalpay", "number")}>
                      Total Pembayaran
                    </TH>
                    <TH isSorted onSort={() => handleSort(orderData, setOrderData, "order.voucher", "text")}>
                      Kode Voucher
                    </TH>
                    <TH isSorted onSort={() => handleSort(orderData, setOrderData, "order.dentist", "text")}>
                      Nama Dokter
                    </TH>
                    <TH isSorted onSort={() => handleSort(orderData, setOrderData, "order.outlet_name", "text")}>
                      Nama Outlet
                    </TH>
                  </TR>
                </THead>
                <TBody>
                  {(searchTerm !== "" ? searchResult : orderData).map((data, index) => (
                    // <TR key={index} isComplete={data.transactionstatus === "1"} isDanger={data.transactionstatus === "2"} onEdit={data.transactionstatus === "0" ? () => openEdit(data.idtransaction) : () => showNotifications("danger", "Transaksi dengan status yang telah selesai atau dibatalkan tidak dapat diperbarui.")} onClick={() => openDetail(data.idtransaction)} onPrint={() => openFile(data.idtransaction)} onContact={() => contactWhatsApp(data.transactionphone)}>
                    <TR
                      key={index}
                      isComplete={data.order && data.order.transactionstatus === "1"}
                      isDanger={data.order && data.order.transactionstatus === "2"}
                      onPrint={() => openFile(data.order.idtransaction)}
                      expandContent={
                        <Fragment>
                          {data.orderdetail &&
                            data.orderdetail.map((subdata, idx) => (
                              <Fieldset key={idx} type="row" markers={`${idx + 1}.`}>
                                <Input id={`${pageid}-service-${index}-${idx}`} radius="full" label="Layanan" value={subdata.service} readonly />
                                <Input id={`${pageid}-service-type-${index}-${idx}`} radius="full" label="Jenis Layanan" value={subdata.servicetype} readonly />
                                <Input id={`${pageid}-price-${index}-${idx}`} radius="full" label="Harga" value={newPrice(subdata.price)} readonly />
                              </Fieldset>
                            ))}
                        </Fragment>
                      }>
                      <TD>{data.order && newDate(data.order.transactioncreate, "id")}</TD>
                      <TD>{data.order && data.order.transactionupdate === "0000-00-00 00:00:00" ? "" : newDate(data.order && data.order.transactionupdate, "id")}</TD>
                      <TD>{data.order && orderAlias(data.order.transactionstatus)}</TD>
                      <TD>{data.order && toTitleCase(data.order.transactionname)}</TD>
                      <TD type="code">{data.order && data.order.rscode}</TD>
                      <TD type="code">{data.order && data.order.noinvoice}</TD>
                      <TD type="number" isCopy>
                        {data.order && data.order.transactionphone}
                      </TD>
                      <TD>{data.order && data.order.payment}</TD>
                      <TD>{data.order && newPrice(data.order.totalpay)}</TD>
                      <TD type="code">{data.order && data.order.voucher}</TD>
                      <TD>{data.order && toTitleCase(data.order.dentist)}</TD>
                      <TD>{data.order && toTitleCase(data.order.outlet_name)}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </DashboardBody>
            {searchTerm === "" && <Pagination radius="full" nospacing currentPage={currentPage} ttlPages={totalPages} onChange={handlePageChange} />}
            {isFormOpen && (
              <SubmitForm formTitle={selectedMode === "update" ? "Perbarui Data Order" : "Tambah Data Order"} operation={selectedMode} fetching={isFormFetching} onSubmit={(e) => handleSubmit(e, "cudorder")} loading={isSubmitting} onClose={closeForm}>
                <Fieldset>
                  <Select id={`${pageid}-dentist`} searchable radius="full" label="Dokter" placeholder="Pilih Dokter" name="dentist" value={inputData.dentist} options={branchDentistData.map((dentist) => ({ value: dentist.name_dentist, label: dentist.name_dentist.replace(`${dentist.id_branch} -`, "") }))} onChange={(selectedValue) => handleInputChange({ target: { name: "dentist", value: selectedValue } })} errormsg={errors.dentist} required />
                  <Select id={`${pageid}-type-payments`} noemptyval radius="full" label="Tipe Pembayaran" placeholder="Pilih tipe pembayaran" name="typepayment" value={inputData.typepayment} options={paymenttypeopt} onChange={(selectedValue) => handleInputChange({ target: { name: "typepayment", value: selectedValue } })} errormsg={errors.typepayment} required />
                  {inputData.typepayment && <Fragment>{inputData.typepayment === "cashless" ? <Select id={`${pageid}-method-payments`} searchable radius="full" label="Metode Pembayaran" placeholder={inputData.typepayment ? "Pilih metode pembayaran" : "Mohon pilih tipe dahulu"} name="bank_code" value={inputData.bank_code} options={fvaListData.map((va) => ({ value: va.code, label: va.name }))} onChange={(selectedValue) => handleInputChange({ target: { name: "bank_code", value: selectedValue } })} errormsg={errors.bank_code} disabled={!inputData.typepayment} /> : <Select id={`${pageid}-status-payments`} noemptyval radius="full" label="Status Pembayaran" placeholder={inputData.typepayment ? "Set status pembayaran" : "Mohon pilih tipe dahulu"} name="status" value={inputData.status} options={orderstatopt} onChange={(selectedValue) => handleInputChange({ target: { name: "status", value: selectedValue } })} errormsg={errors.status} disabled={!inputData.typepayment} />}</Fragment>}
                </Fieldset>
                {inputData.order.map((subservice, index) => (
                  <Fieldset
                    key={index}
                    type="row"
                    markers={`${index + 1}.`}
                    endContent={
                      <Fragment>
                        <Button id={`${pageid}-delete-row-${index}`} subVariant="icon" isTooltip tooltipText="Hapus" size="sm" color={inputData.order.length <= 1 ? "var(--color-red-30)" : "var(--color-red)"} bgColor="var(--color-red-10)" iconContent={<NewTrash />} onClick={() => handleRmvRow("order", index)} isDisabled={inputData.order.length <= 1} />
                        {index + 1 === inputData.order.length && <Button id={`${pageid}-add-row`} subVariant="icon" isTooltip tooltipText="Tambah" size="sm" color="var(--color-primary)" bgColor="var(--color-primary-10)" iconContent={<Plus />} onClick={() => handleAddRow("order")} />}
                      </Fragment>
                    }>
                    <Select id={`${pageid}-name-${index}`} searchable radius="full" label="Nama Layanan" placeholder="Pilih Layanan" name="service" value={subservice.service} options={allservicedata.map((service) => ({ value: service["Nama Layanan"].servicename, label: service["Nama Layanan"].servicename }))} onChange={(selectedValue) => handleRowChange("order", index, { target: { name: "service", value: selectedValue } })} errormsg={errors[`order.${index}.service`] ? errors[`order.${index}.service`] : ""} required readonly={inputData.order[index].service === "RESERVATION"} />
                    <Select id={`${pageid}-type-name-${index}`} searchable radius="full" label="Jenis Layanan" placeholder={subservice.service ? "Pilih jenis layanan" : "Mohon pilih layanan dahulu"} name="servicetype" value={subservice.servicetype} options={(inputData.order[index].service && allservicedata.find((s) => s["Nama Layanan"].servicename === inputData.order[index].service)?.["Jenis Layanan"].map((type) => ({ value: type.servicetypename, label: type.servicetypename }))) || []} onChange={(selectedValue) => handleRowChange("order", index, { target: { name: "servicetype", value: selectedValue } })} errormsg={errors[`order.${index}.servicetype`] ? errors[`order.${index}.servicetype`] : ""} required disabled={!inputData.order[index].service} readonly={inputData.order[index].service === "RESERVATION"} />
                    <Input id={`${pageid}-type-price-${index}`} radius="full" label="Atur Harga" placeholder="Masukkan harga" type="number" name="price" value={subservice.price} onChange={(e) => handleRowChange("order", index, e)} errormsg={errors[`order.${index}.price`] ? errors[`order.${index}.price`] : ""} required readonly={inputData.order[index].service === "RESERVATION"} />
                  </Fieldset>
                ))}
              </SubmitForm>
            )}
            {selectedOrderData && isFileOpen && (
              <FileForm fetching={isFormFetching} onNext={exportToPDF} onSend={() => sendPDFLink(selectedOrderData["order"].transactionphone, selectedOrderData["order"].transactionname)} onClose={closeFile}>
                <Invoice ref={printRef} data={selectedOrderData["order"]} items={selectedOrderData["orderdetail"]} />
              </FileForm>
            )}
          </Fragment>
        );
      case "CALENDAR RESERVATION":
        const daysofweek = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jum'at", "Sabtu"];
        const getDaysMonth = (year, month) => {
          return new Date(year, month + 1, 0).getDate();
        };
        const getFirstDayMonth = (year, month) => {
          return new Date(year, month, 1).getDay();
        };
        const formatDate = (year, month, day) => {
          return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        };

        const generateCalendar = () => {
          const year = currentDate.getFullYear();
          const month = currentDate.getMonth();
          const daysmonth = getDaysMonth(year, month);
          const firstdaymonth = getFirstDayMonth(year, month);
          const daysprevmonth = getDaysMonth(year, month - 1);
          const calendardays = [];
          let dayCounter = 1;

          for (let i = firstdaymonth - 1; i >= 0; i--) {
            const day = daysprevmonth - i;
            const date = formatDate(year, month - 1, day);
            calendardays.push({ day, events: eventsData[date] || [], isCurrentMonth: false, date });
          }
          while (dayCounter <= daysmonth) {
            const date = formatDate(year, month, dayCounter);
            calendardays.push({ day: dayCounter, events: eventsData[date] || [], isCurrentMonth: true, date });
            dayCounter++;
          }
          const anotherdaysmonth = 42 - calendardays.length;
          for (let i = 1; i <= anotherdaysmonth; i++) {
            const date = formatDate(year, month + 1, i);
            calendardays.push({ day: i, events: eventsData[date] || [], isCurrentMonth: false, date });
          }

          const openEvent = (dayObj) => {
            if (dayObj) {
              setSelectedDayEvents(dayObj.events);
              setIsModalOpen(true);
            }
          };

          return calendardays.map((dayObj, index) => (
            <CalendarDate key={index} date={dayObj.day} isDisabled={!dayObj.isCurrentMonth} hasEvent={dayObj.events.length > 0} onClick={() => openEvent(dayObj)}>
              {dayObj.events.slice(0, 3).map((event, i) => (
                <DateEvent key={i} label={event.label} status={event.status} isDisabled={!dayObj.isCurrentMonth} />
              ))}
              {dayObj.events.length > 3 && <DateEvent label={`+${dayObj.events.length - 3} more events`} />}
            </CalendarDate>
          ));
        };

        const handlePrevMonth = () => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
        const handleNextMonth = () => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
        const handleToday = () => {
          const todayWIB = new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" });
          setCurrentDate(new Date(todayWIB));
        };

        const closeEvent = () => {
          setIsModalOpen(false);
          setSelectedDayEvents([]);
        };

        return (
          <Fragment>
            <DashboardHead title={`Jadwal Reservasi ${currentDate.toLocaleString("default", { month: "long" })} ${currentDate.getFullYear()}`} desc="Data visual jadwal reservasi, klik kolom tanggal untuk melihat daftar jadwal reservasi harian." />
            <DashboardToolbar>
              <DashboardTool>{level === "admin" && <Select id={`${pageid}-outlet`} labeled={false} searchable radius="full" placeholder="Pilih Cabang" value={selectedBranch} options={allBranchData.map((branch) => ({ value: branch.idoutlet, label: branch.outlet_name.replace("E DENTAL - DOKTER GIGI", "CABANG") }))} onChange={handleBranchChange} />}</DashboardTool>
              <DashboardTool>
                <Button id={`${pageid}-today`} radius="full" buttonText="Hari Ini" onClick={handleToday} />
                <Button id={`${pageid}-prev-month`} radius="full" variant="line" color="var(--color-primary)" buttonText="Prev Month" onClick={handlePrevMonth} startContent={<HChevron direction="left" />} />
                <Button id={`${pageid}-next-month`} radius="full" buttonText="Next Month" onClick={handleNextMonth} endContent={<HChevron />} />
              </DashboardTool>
            </DashboardToolbar>
            <DashboardBody>
              <Calendar>
                {daysofweek.map((day) => (
                  <CalendarDay key={day}>{day}</CalendarDay>
                ))}
                {generateCalendar()}
              </Calendar>
            </DashboardBody>
            {isModalOpen && <EventModal events={selectedDayEvents} onClose={closeEvent} />}
          </Fragment>
        );
      case "PRACTITIONER":
        const handlePInputChange = async (e) => {
          const { name, value } = e.target;
          const formData = new FormData();
          setInputData((prevState) => ({ ...prevState, [name]: value }));
          setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
          if (name === "practici_id" && value !== "") {
            formData.append("secret", secret);
            formData.append("nik", value);
            setIsSubmitting(true);
            try {
              const practicidata = await apiRead(formData, "satusehat", "searchpractitioner");
              if (practicidata && practicidata.data) {
                const aliasedpractic = practicidata.data;
                setInputData((prevState) => ({ ...prevState, city: aliasedpractic.entry[0].resource.address[0].extension[0].extension[1].valueCode, province: aliasedpractic.entry[0].resource.address[0].extension[0].extension[0].valueCode, district: aliasedpractic.entry[0].resource.address[0].extension[0].extension[2].valueCode, village: aliasedpractic.entry[0].resource.address[0].extension[0].extension[3].valueCode, rt: aliasedpractic.entry[0].resource.address[0].extension[0].extension[4].valueCode, rw: aliasedpractic.entry[0].resource.address[0].extension[0].extension[5].valueCode, address: aliasedpractic.entry[0].resource.address[0].line[0], birth_date: aliasedpractic.entry[0].resource.birthDate, gender: aliasedpractic.entry[0].resource.gender, id: aliasedpractic.entry[0].resource.id, str: aliasedpractic.entry[0].resource.qualification[0].identifier[0].value }));
              } else {
                setInputData((prevState) => ({ ...prevState, city: "", province: "", district: "", village: "", rt: "", rw: "", address: "", birth_date: "", gender: "", id: "", str: "" }));
              }
            } catch (error) {
              console.error("error:", error);
            } finally {
              setIsSubmitting(false);
            }
          }
        };

        return (
          <Fragment>
            <DashboardHead title={pagetitle} desc="Data pengguna aplikasi. Klik Tambah Baru untuk membuat data pengguna baru, atau klik ikon di kolom Action untuk memperbarui data." />
            <DashboardToolbar>
              <DashboardTool>
                <Input id={`search-data-${pageid}`} radius="full" labeled={false} placeholder="Cari data ..." type="text" value={practiSearch} onChange={(e) => handlePractiSearch(e.target.value)} leadingicon={<Search />} />
              </DashboardTool>
              <Button id={`add-new-data-${pageid}`} radius="full" buttonText="Tambah" onClick={openForm} startContent={<Plus />} />
            </DashboardToolbar>
            <DashboardBody>
              <Table byNumber isDeletable isNoData={!isPractiShown} isLoading={isFetching}>
                <THead>
                  <TR>
                    <TH isSorted onSort={() => handleSort(practiciData, setPracticiData, "city", "number")}>
                      City
                    </TH>
                    <TH isSorted onSort={() => handleSort(practiciData, setPracticiData, "province", "number")}>
                      Province
                    </TH>
                    <TH isSorted onSort={() => handleSort(practiciData, setPracticiData, "district", "number")}>
                      District
                    </TH>
                    <TH isSorted onSort={() => handleSort(practiciData, setPracticiData, "village", "number")}>
                      Village
                    </TH>
                    <TH isSorted onSort={() => handleSort(practiciData, setPracticiData, "rt", "number")}>
                      RT
                    </TH>
                    <TH isSorted onSort={() => handleSort(practiciData, setPracticiData, "rw", "number")}>
                      RW
                    </TH>
                    <TH isSorted onSort={() => handleSort(practiciData, setPracticiData, "postalCode", "number")}>
                      Postal Code
                    </TH>
                    <TH isSorted onSort={() => handleSort(practiciData, setPracticiData, "address", "text")}>
                      Address
                    </TH>
                    <TH isSorted onSort={() => handleSort(practiciData, setPracticiData, "birthDate", "number")}>
                      Birthdate
                    </TH>
                    <TH isSorted onSort={() => handleSort(practiciData, setPracticiData, "gender", "text")}>
                      Gender
                    </TH>
                    <TH isSorted onSort={() => handleSort(practiciData, setPracticiData, "id", "number")}>
                      ID
                    </TH>
                    <TH isSorted onSort={() => handleSort(practiciData, setPracticiData, "str", "number")}>
                      STR
                    </TH>
                    <TH isSorted onSort={() => handleSort(practiciData, setPracticiData, "phone", "number")}>
                      Phone
                    </TH>
                  </TR>
                </THead>
                <TBody>
                  {filteredPractiData.map((data, index) => (
                    <TR key={index} onDelete={() => handleDelete(data.idpractitioner, "delsatusehat", "satusehat")}>
                      <TD>{data.city}</TD>
                      <TD>{data.province}</TD>
                      <TD>{data.district}</TD>
                      <TD>{data.village}</TD>
                      <TD>{data.rt}</TD>
                      <TD>{data.rw}</TD>
                      <TD>{data.postalCode}</TD>
                      <TD>{data.address}</TD>
                      <TD>{data.birthDate}</TD>
                      <TD>{data.gender}</TD>
                      <TD isCopy>{data.id}</TD>
                      <TD isCopy>{data.str}</TD>
                      <TD isCopy>{data.phone}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </DashboardBody>
            {isFormOpen && (
              <SubmitForm size="sm" formTitle="Tambah Data Praktisioner" operation="add" fetching={isFormFetching} onSubmit={(e) => handleSubmit(e, "addpractitioner", "satusehat")} loading={isSubmitting} onClose={closeForm}>
                <Select id={`${pageid}-dentist`} searchable radius="full" label="Dokter" placeholder="Pilih Dokter" name="practici_id" value={inputData.practici_id} options={branchDentistData.map((dentist) => ({ value: dentist.nik, label: dentist.name_dentist.replace(`${dentist.id_branch} -`, "") }))} onChange={(selectedValue) => handlePInputChange({ target: { name: "practici_id", value: selectedValue } })} errormsg={errors.practici_id} required />
                <Fieldset>
                  <Input id={`${pageid}-city`} radius="full" label="City ID" placeholder="e.g 30" type="text" name="city" value={inputData.city} onChange={handlePInputChange} errormsg={errors.city} required />
                  <Input id={`${pageid}-province`} radius="full" label="Province ID" placeholder="e.g 200" type="text" name="province" value={inputData.province} onChange={handlePInputChange} errormsg={errors.province} required />
                </Fieldset>
                <Fieldset>
                  <Input id={`${pageid}-district`} radius="full" label="District ID" placeholder="e.g 50" type="text" name="district" value={inputData.district} onChange={handlePInputChange} errormsg={errors.district} required />
                  <Input id={`${pageid}-village`} radius="full" label="Village ID" placeholder="e.g 100" type="text" name="village" value={inputData.village} onChange={handlePInputChange} errormsg={errors.village} required />
                </Fieldset>
                <Fieldset>
                  <Input id={`${pageid}-rt`} radius="full" label="RT" placeholder="004" type="text" name="rt" value={inputData.rt} onChange={handlePInputChange} errormsg={errors.rt} required />
                  <Input id={`${pageid}-rw`} radius="full" label="RW" placeholder="006" type="text" name="rw" value={inputData.rw} onChange={handlePInputChange} errormsg={errors.rw} required />
                </Fieldset>
                <Input id={`${pageid}-address`} radius="full" label="Alamat" placeholder="123 Main Street" type="text" name="address" value={inputData.address} onChange={handlePInputChange} errormsg={errors.address} required />
                <Fieldset>
                  <Input id={`${pageid}-birth`} radius="full" label="Tanggal Lahir" type="date" name="birth_date" value={inputData.birth_date} onChange={handlePInputChange} errormsg={errors.birth_date} required />
                  <Input id={`${pageid}-gender`} radius="full" label="Jenis Kelamin" placeholder="Perempuan" type="text" name="gender" value={inputData.gender} onChange={handlePInputChange} errormsg={errors.gender} required />
                </Fieldset>
              </SubmitForm>
            )}
          </Fragment>
        );
      case "ORGANIZATION":
        const handleCreateOrg = async (e) => {
          e.preventDefault();
          const requiredFields = ["name", "phone", "email", "address", "city_name", "postcode", "province", "city", "district", "village"];
          const validationErrors = inputValidator(inputData, requiredFields);
          if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
          }
          const confirmmsg = `Apakah anda yakin untuk menambahkan data baru pada ${toTitleCase(slug)}?`;
          const successmsg = `Selamat! Data baru berhasil ditambahkan pada ${toTitleCase(slug)}.`;
          const errormsg = "Terjadi kesalahan saat menambahkan data. Mohon periksa koneksi internet anda dan coba lagi.";
          const confirm = window.confirm(confirmmsg);
          if (!confirm) {
            return;
          }
          setIsSubmitting(true);
          try {
            const submittedData = { secret, name: inputData.name, phone: inputData.phone, email: inputData.email, address: inputData.address, cityname: inputData.city_name, postalcode: inputData.postcode, province: inputData.province, city: inputData.city, district: inputData.district, village: inputData.village };
            const formData = new FormData();
            const fFormData = new FormData();
            formData.append("data", JSON.stringify(submittedData));
            const response = await apiCrud(formData, "satusehat", "addorganization");
            if (response && response.status !== false) {
              const aliasedorg = response.data;
              const fSubmittedData = { secret, id: aliasedorg.id, cityname: inputData.city_name, province: inputData.province, city: inputData.city, district: inputData.district, village: inputData.village, dept: aliasedorg.type[0].coding[0].display, address: inputData.address, postalCode: inputData.postcode, identifier: aliasedorg.identifier[0].value, reference: aliasedorg.partOf.reference, phone: inputData.phone, email: inputData.email };
              fFormData.append("data", JSON.stringify(fSubmittedData));
              await apiCrud(fFormData, "satusehat", "saveorganization");
              log("added data:", fSubmittedData);
              log("created data:", submittedData);
              showNotifications("success", successmsg);
              closeForm();
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

        return (
          <Fragment>
            <DashboardHead title={pagetitle} desc="Data pengguna aplikasi. Klik Tambah Baru untuk membuat data pengguna baru, atau klik ikon di kolom Action untuk memperbarui data." />
            <DashboardToolbar>
              <DashboardTool>
                <Input id={`search-data-${pageid}`} radius="full" labeled={false} placeholder="Cari data ..." type="text" value={orgSearch} onChange={(e) => handleOrgSearch(e.target.value)} leadingicon={<Search />} />
              </DashboardTool>
              <Button id={`add-new-data-${pageid}`} radius="full" buttonText="Tambah" onClick={openForm} startContent={<Plus />} />
            </DashboardToolbar>
            <DashboardBody>
              <Table byNumber isDeletable isNoData={!isOrgShown} isLoading={isFetching}>
                <THead>
                  <TR>
                    <TH isSorted onSort={() => handleSort(orgData, setOrgData, "id", "number")}>
                      ID
                    </TH>
                    <TH isSorted onSort={() => handleSort(orgData, setOrgData, "cityname", "text")}>
                      Kota
                    </TH>
                    <TH isSorted onSort={() => handleSort(orgData, setOrgData, "address", "text")}>
                      Alamat
                    </TH>
                    <TH isSorted onSort={() => handleSort(orgData, setOrgData, "phone", "number")}>
                      Telepon
                    </TH>
                    <TH isSorted onSort={() => handleSort(orgData, setOrgData, "email", "text")}>
                      Email
                    </TH>
                    <TH isSorted onSort={() => handleSort(orgData, setOrgData, "identifier", "text")}>
                      Identifier
                    </TH>
                    <TH isSorted onSort={() => handleSort(orgData, setOrgData, "reference", "text")}>
                      Referensi
                    </TH>
                  </TR>
                </THead>
                <TBody>
                  {filteredOrgData.map((data, index) => (
                    <TR key={index} onDelete={() => handleDelete(data.idorganization, "delsatusehat", "satusehat")}>
                      <TD>{data.id}</TD>
                      <TD>{data.cityname}</TD>
                      <TD>{data.address}</TD>
                      <TD>{data.phone}</TD>
                      <TD>{data.email}</TD>
                      <TD>{data.identifier}</TD>
                      <TD>{data.reference}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </DashboardBody>
            {isFormOpen && (
              <SubmitForm size="sm" formTitle="Tambah Data Organisasi" operation="add" fetching={isFormFetching} onSubmit={handleCreateOrg} loading={isSubmitting} onClose={closeForm}>
                {level === "admin" && <Select id={`${pageid}-outlet`} label="Cabang" searchable radius="full" placeholder="Pilih Cabang" value={selectedBranch} options={allBranchData.map((branch) => ({ value: branch.idoutlet, label: branch.outlet_name.replace("E DENTAL - DOKTER GIGI", "CABANG") }))} onChange={handleBranchChange} />}
                <Fieldset>
                  <Input id={`${pageid}-orgname`} radius="full" label="Nama Organisasi" placeholder="Cabang Jakarta" type="text" name="name" value={inputData.name} onChange={handleInputChange} errormsg={errors.name} required />
                  <Input id={`${pageid}-phone`} radius="full" label="Nomor Telepon" placeholder="0882xxx" type="tel" name="phone" value={inputData.phone} onChange={handleInputChange} errormsg={errors.phone} required />
                </Fieldset>
                <Fieldset>
                  <Input id={`${pageid}-email`} radius="full" label="Email" placeholder="outlet@gmail.com" type="email" name="email" value={inputData.email} onChange={handleInputChange} errormsg={errors.email} required />
                  <Input id={`${pageid}-address`} radius="full" label="Alamat" placeholder="123 Main Street" type="text" name="address" value={inputData.address} onChange={handleInputChange} errormsg={errors.address} required />
                </Fieldset>
                <Fieldset>
                  <Input id={`${pageid}-cityname`} radius="full" label="Nama Kota" placeholder="Jakarta" type="text" name="city_name" value={inputData.city_name} onChange={handleInputChange} errormsg={errors.city_name} required />
                  <Input id={`${pageid}-postcode`} radius="full" label="Kode POS" placeholder="40282" type="number" name="postcode" value={inputData.postcode} onChange={handleInputChange} errormsg={errors.postcode} required />
                </Fieldset>
                <Fieldset>
                  <Select id={`${pageid}-province`} searchable radius="full" label="Province ID" placeholder="Pilih Provinsi" name="province" value={inputData.province} options={provinceData.map((item) => ({ value: item.id, label: item.name }))} onChange={(selectedValue) => handleInputChange({ target: { name: "province", value: selectedValue } })} errormsg={errors.province} required />
                  <Select id={`${pageid}-city`} searchable radius="full" label="City ID" placeholder="Pilih Kota" name="city" value={inputData.city} options={cityData.map((item) => ({ value: item.id, label: item.name }))} onChange={(selectedValue) => handleInputChange({ target: { name: "city", value: selectedValue } })} errormsg={errors.city} required disabled={!inputData.province} />
                </Fieldset>
                <Fieldset>
                  <Select id={`${pageid}-district`} searchable radius="full" label="District ID" placeholder="Pilih Kecamatan" name="district" value={inputData.district} options={districtData.map((item) => ({ value: item.id, label: item.name }))} onChange={(selectedValue) => handleInputChange({ target: { name: "district", value: selectedValue } })} errormsg={errors.district} required disabled={!inputData.city} />
                  <Select id={`${pageid}-village`} searchable radius="full" label="Village ID" placeholder="Pilih Kelurahan" name="village" value={inputData.village} options={villageData.map((item) => ({ value: item.id, label: item.name }))} onChange={(selectedValue) => handleInputChange({ target: { name: "village", value: selectedValue } })} errormsg={errors.village} required disabled={!inputData.district} />
                </Fieldset>
              </SubmitForm>
            )}
          </Fragment>
        );
      case "LOCATION":
        const handleCreateLoc = async (e) => {
          e.preventDefault();
          const requiredFields = ["phone", "email", "address", "city_name", "postcode", "rt", "rw"];
          const validationErrors = inputValidator(inputData, requiredFields);
          if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
          }
          const confirmmsg = `Apakah anda yakin untuk menambahkan data baru pada ${toTitleCase(slug)}?`;
          const successmsg = `Selamat! Data baru berhasil ditambahkan pada ${toTitleCase(slug)}.`;
          const errormsg = "Terjadi kesalahan saat menambahkan data. Mohon periksa koneksi internet anda dan coba lagi.";
          const confirm = window.confirm(confirmmsg);
          if (!confirm) {
            return;
          }
          setIsSubmitting(true);
          try {
            const selectedorg = orgData[0];
            const submittedData = { secret, id: inputData.id, phone: inputData.phone, email: inputData.email, address: inputData.address, cityname: inputData.city_name, postalcode: inputData.postcode, province: inputData.province, city: inputData.city, district: inputData.district, village: inputData.village, rt: inputData.rt, rw: inputData.rw };
            const formData = new FormData();
            const fFormData = new FormData();
            formData.append("data", JSON.stringify(submittedData));
            const response = await apiCrud(formData, "satusehat", "createlocation");
            if (response && response.status !== false) {
              const aliasedorg = response.data;
              const fSubmittedData = { secret, id: aliasedorg.id, name: aliasedorg.name, phone: selectedorg.phone, email: selectedorg.email, address: selectedorg.address, cityname: selectedorg.cityname, province: selectedorg.province, city: selectedorg.city, district: selectedorg.district, village: selectedorg.village, rt: inputData.rt, rw: inputData.rw, description: aliasedorg.description, identifier: aliasedorg.identifier[0].system, reference: aliasedorg.managingOrganization.reference };
              fFormData.append("data", JSON.stringify(fSubmittedData));
              await apiCrud(fFormData, "satusehat", "savelocation");
              log("added data:", fSubmittedData);
              log("created data:", submittedData);
              showNotifications("success", successmsg);
              closeForm();
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

        return (
          <Fragment>
            <DashboardHead title={pagetitle} desc="Data pengguna aplikasi. Klik Tambah Baru untuk membuat data pengguna baru, atau klik ikon di kolom Action untuk memperbarui data." />
            <DashboardToolbar>
              <DashboardTool>
                <Input id={`search-data-${pageid}`} radius="full" labeled={false} placeholder="Cari data ..." type="text" value={locationSearch} onChange={(e) => handleLocationSearch(e.target.value)} leadingicon={<Search />} />
              </DashboardTool>
              <Button id={`add-new-data-${pageid}`} radius="full" buttonText="Tambah" onClick={() => openEdit(orgData[0].id)} startContent={<Plus />} isDisabled={orgData.length < 0} />
            </DashboardToolbar>
            <DashboardBody>
              <Table byNumber isDeletable isNoData={!isLocationShown} isLoading={isFetching}>
                <THead>
                  <TR>
                    <TH isSorted onSort={() => handleSort(locationData, setLocationData, "id", "number")}>
                      ID
                    </TH>
                    <TH isSorted onSort={() => handleSort(locationData, setLocationData, "cityname", "text")}>
                      Kota
                    </TH>
                    <TH isSorted onSort={() => handleSort(locationData, setLocationData, "address", "text")}>
                      Alamat
                    </TH>
                    <TH isSorted onSort={() => handleSort(locationData, setLocationData, "phone", "number")}>
                      Telepon
                    </TH>
                    <TH isSorted onSort={() => handleSort(locationData, setLocationData, "email", "text")}>
                      Email
                    </TH>
                    <TH isSorted onSort={() => handleSort(locationData, setLocationData, "identifier", "text")}>
                      Identifier
                    </TH>
                    <TH isSorted onSort={() => handleSort(locationData, setLocationData, "reference", "text")}>
                      Referensi
                    </TH>
                  </TR>
                </THead>
                <TBody>
                  {filteredLocationData.map((data, index) => (
                    <TR key={index} onDelete={() => handleDelete(data.idlocation, "delsatusehat", "satusehat")}>
                      <TD>{data.id}</TD>
                      <TD>{data.cityname}</TD>
                      <TD>{data.address}</TD>
                      <TD>{data.phone}</TD>
                      <TD>{data.email}</TD>
                      <TD>{data.identifier}</TD>
                      <TD>{data.reference}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </DashboardBody>
            {isFormOpen && (
              <SubmitForm size="sm" formTitle="Tambah Data Lokasi" operation="add" fetching={isFormFetching} onSubmit={handleCreateLoc} loading={isSubmitting} onClose={closeForm}>
                <Fieldset>
                  <Input id={`${pageid}-phone`} radius="full" label="Nomor Telepon" placeholder="0882xxx" type="tel" name="phone" value={inputData.phone} onChange={handleInputChange} errormsg={errors.phone} required />
                  <Input id={`${pageid}-email`} radius="full" label="Email" placeholder="outlet@gmail.com" type="email" name="email" value={inputData.email} onChange={handleInputChange} errormsg={errors.email} required />
                </Fieldset>
                <Input id={`${pageid}-address`} radius="full" label="Alamat" placeholder="123 Main Street" type="text" name="address" value={inputData.address} onChange={handleInputChange} errormsg={errors.address} required />
                <Fieldset>
                  <Input id={`${pageid}-cityname`} radius="full" label="Nama Kota" placeholder="Jakarta" type="text" name="city_name" value={inputData.city_name} onChange={handleInputChange} errormsg={errors.city_name} required />
                  <Input id={`${pageid}-postcode`} radius="full" label="Kode POS" placeholder="40282" type="number" name="postcode" value={inputData.postcode} onChange={handleInputChange} errormsg={errors.postcode} required />
                </Fieldset>
                {/* <Fieldset>
                  <Select id={`${pageid}-province`}  searchable radius="full" label="Province ID" placeholder="Pilih Provinsi" name="province" value={inputData.province} options={provinceData.map((item) => ({ value: item.id, label: item.name }))} onChange={(selectedValue) => handleInputChange({ target: { name: "province", value: selectedValue } })} errormsg={errors.province} required />
                  <Select id={`${pageid}-city`}  searchable radius="full" label="City ID" placeholder="Pilih Kota" name="city" value={inputData.city} options={cityData.map((item) => ({ value: item.id, label: item.name }))} onChange={(selectedValue) => handleInputChange({ target: { name: "city", value: selectedValue } })} errormsg={errors.city} required disabled={!inputData.province} />
                </Fieldset>
                <Fieldset>
                  <Select id={`${pageid}-district`}  searchable radius="full" label="District ID" placeholder="Pilih Kecamatan" name="district" value={inputData.district} options={districtData.map((item) => ({ value: item.id, label: item.name }))} onChange={(selectedValue) => handleInputChange({ target: { name: "district", value: selectedValue } })} errormsg={errors.district} required disabled={!inputData.city} />
                  <Select id={`${pageid}-village`}  searchable radius="full" label="Village ID" placeholder="Pilih Kelurahan" name="village" value={inputData.village} options={villageData.map((item) => ({ value: item.id, label: item.name }))} onChange={(selectedValue) => handleInputChange({ target: { name: "village", value: selectedValue } })} errormsg={errors.village} required disabled={!inputData.district} />
                </Fieldset> */}
                <Fieldset>
                  <Input id={`${pageid}-rt`} radius="full" label="RT" placeholder="005" type="number" name="rt" value={inputData.rt} onChange={handleInputChange} errormsg={errors.rt} required />
                  <Input id={`${pageid}-rw`} radius="full" label="RW" placeholder="006" type="number" name="rw" value={inputData.rw} onChange={handleInputChange} errormsg={errors.rw} required />
                </Fieldset>
              </SubmitForm>
            )}
          </Fragment>
        );
      case "CREDENTIAL":
        return (
          <Fragment>
            <DashboardHead title={pagetitle} desc="Data pengguna aplikasi. Klik Tambah Baru untuk membuat data pengguna baru, atau klik ikon di kolom Action untuk memperbarui data." />
            <DashboardToolbar>
              <DashboardTool>
                <Input id={`search-data-${pageid}`} radius="full" labeled={false} placeholder="Cari data ..." type="text" value={credSearch} onChange={(e) => handleCredSearch(e.target.value)} leadingicon={<Search />} />
              </DashboardTool>
              <Button id={`add-new-data-${pageid}`} radius="full" buttonText="Tambah" onClick={openForm} startContent={<Plus />} />
            </DashboardToolbar>
            <DashboardBody>
              <Table byNumber isEditable isDeletable isNoData={!isCredShown} isLoading={isFetching}>
                <THead>
                  <TR>
                    <TH isSorted onSort={() => handleSort(credData, setCredData, "credentialcreate", "date")}>
                      Tanggal Dibuat
                    </TH>
                    <TH isSorted onSort={() => handleSort(credData, setCredData, "outlet_name", "text")}>
                      Nama Outlet
                    </TH>
                    <TH isSorted onSort={() => handleSort(credData, setCredData, "clientid", "text")}>
                      Client ID
                    </TH>
                    <TH isSorted onSort={() => handleSort(credData, setCredData, "secretid", "text")}>
                      Secret ID
                    </TH>
                  </TR>
                </THead>
                <TBody>
                  {filteredCredData.map((data, index) => (
                    <TR key={index} onEdit={() => openEdit(data.idcredential)} onDelete={() => handleDelete(data.idcredential, "cudcredential", "satusehat")}>
                      <TD>{newDate(data.credentialcreate, "ID")}</TD>
                      <TD>{data.outlet_name}</TD>
                      <TD type="code">{data.clientid}</TD>
                      <TD type="code">{data.secretid}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </DashboardBody>
            {isFormOpen && (
              <SubmitForm size="sm" formTitle={selectedMode === "update" ? "Perbarui Data Kredensial" : "Tambah Data Kredensial"} operation={selectedMode} fetching={isFormFetching} onSubmit={(e) => handleSubmit(e, "cudcredential", "satusehat")} loading={isSubmitting} onClose={closeForm}>
                <Select id={`${pageid}-outlet`} searchable radius="full" label="Cabang" placeholder="Pilih cabang" name="outlet" value={inputData.outlet} options={allBranchData.map((branch) => ({ value: branch.idoutlet, label: branch.outlet_name.replace("E DENTAL - DOKTER GIGI", "CABANG") }))} onChange={(selectedValue) => handleInputChange({ target: { name: "outlet", value: selectedValue } })} errormsg={errors.outlet} required />
                <Input id={`${pageid}-client-id`} radius="full" label="Client ID" placeholder="Masukkan client ID" type="text" name="client_id" value={inputData.client_id} onChange={handleInputChange} errormsg={errors.client_id} required />
                <Input id={`${pageid}-secret-id`} radius="full" label="Secret ID" placeholder="Masukkan secret ID" type="text" name="secret_id" value={inputData.secret_id} onChange={handleInputChange} errormsg={errors.secret_id} required />
              </SubmitForm>
            )}
          </Fragment>
        );
      case "PATIENT":
        const handleSSSubmit = async (params) => {
          const confirmmsg = "Apakah anda yakin untuk menambahkan data terpilih ke SatuSehat?";
          const successmsg = "Selamat! Data terpilih berhasil ditambahkan ke SatuSehat.";
          const faileddmsg = "Data Praktisioner, Organisasi, dan Lokasi tidak valid. Mohon lengkapi terlebih dahulu dan coba lagi.";
          const errormsg = "Terjadi kesalahan saat menambahkan data. Mohon periksa koneksi internet anda dan coba lagi.";
          const confirm = window.confirm(confirmmsg);
          if (!confirm) {
            return;
          }
          setIsSubmitting(true);
          try {
            const formData = new FormData();
            if (practiciData.length > 0 && orgData.length > 0 && locationData.length > 0) {
              const submittedData = { secret, practitioner: practiciData[0].id, location: locationData[0].id, description: locationData[0].description, organization: orgData[0].reference.replace("Organization/", ""), idtransaction: params["transaction"].idtransaction, nik: params["transaction"].noktp };
              formData.append("data", JSON.stringify(submittedData));
              const response = await apiCrud(formData, "satusehat", "satusehat");
              if (response.status === false) {
                showNotifications("danger", response.message);
                log("error:", response.message);
              } else {
                showNotifications("success", successmsg);
                log("submitted data:", submittedData);
                await fetchData();
                await fetchAdditionalData();
              }
            } else {
              showNotifications("danger", faileddmsg);
              return;
            }
          } catch (error) {
            console.error(errormsg, error);
          } finally {
            setIsSubmitting(false);
          }
        };

        return (
          <Fragment>
            <DashboardHead title={pagetitle} desc="Data pengguna aplikasi. Klik Tambah Baru untuk membuat data pengguna baru, atau klik ikon di kolom Action untuk memperbarui data." />
            <DashboardToolbar>
              <DashboardTool>
                <Input id={`search-data-${pageid}`} radius="full" labeled={false} placeholder="Cari data ..." type="text" value={patientSearch} onChange={(e) => handlePatientSearch(e.target.value)} leadingicon={<Search />} />
              </DashboardTool>
              <DashboardTool>
                <Select id={`limit-data-${pageid}`} labeled={false} noemptyval radius="full" placeholder="Baris per Halaman" value={limit} options={limitopt} onChange={handleLimitChange} readonly={!isPatientShown} />
              </DashboardTool>
            </DashboardToolbar>
            <DashboardBody>
              <Table byNumber isExpandable isSSable page={currentPage} limit={limit} isNoData={!isPatientShown} isLoading={isFetching}>
                <THead>
                  <TR>
                    <TH>Satu Sehat</TH>
                    <TH isSorted onSort={() => handleSort(patientData, setPatientData, "transaction.noktp", "number")}>
                      NIK
                    </TH>
                    <TH isSorted onSort={() => handleSort(patientData, setPatientData, "transaction.transactionupdate", "date")}>
                      Tanggal Kedatangan
                    </TH>
                    <TH isSorted onSort={() => handleSort(patientData, setPatientData, "transaction.rscode", "text")}>
                      Reservasi
                    </TH>
                    <TH isSorted onSort={() => handleSort(patientData, setPatientData, "transaction.transactionname", "text")}>
                      Pasien
                    </TH>
                    <TH isSorted onSort={() => handleSort(patientData, setPatientData, "transaction.transactionphone", "number")}>
                      Telepon
                    </TH>
                    <TH isSorted onSort={() => handleSort(patientData, setPatientData, "transaction.payment", "text")}>
                      Metode Bayar
                    </TH>
                    <TH isSorted onSort={() => handleSort(patientData, setPatientData, "transaction.totalpay", "number")}>
                      Total Bayar
                    </TH>
                    <TH isSorted onSort={() => handleSort(patientData, setPatientData, "status.encounter", "number")}>
                      Encounter
                    </TH>
                    <TH isSorted onSort={() => handleSort(patientData, setPatientData, "status.firstcondition", "number")}>
                      First Condition
                    </TH>
                    <TH isSorted onSort={() => handleSort(patientData, setPatientData, "status.secondcondition", "number")}>
                      Second Condition
                    </TH>
                  </TR>
                </THead>
                <TBody>
                  {filteredPatientData.map((data, index) => (
                    <TR
                      key={index}
                      onSS={data["status"].length > 0 ? () => {} : () => handleSSSubmit(data)}
                      expandContent={
                        <Fragment>
                          {data["detail"].map((subdata, idx) => (
                            <Fieldset key={idx} type="row" markers={`${idx + 1}.`}>
                              <Input id={`${pageid}-date-${index}-${idx}`} radius="full" label="Tanggal Dibuat" value={subdata.transactiondetailcreate === "0000-00-00 00:00:00" ? "" : newDate(subdata.transactiondetailcreate, "id")} readonly />
                              <Input id={`${pageid}-service-${index}-${idx}`} radius="full" label="Layanan" value={subdata.service} readonly />
                              <Input id={`${pageid}-service-type-${index}-${idx}`} radius="full" label="Jenis Layanan" value={subdata.servicetype} readonly />
                              <Input id={`${pageid}-price-${index}-${idx}`} radius="full" label="Harga" value={newPrice(subdata.price)} readonly />
                            </Fieldset>
                          ))}
                        </Fragment>
                      }>
                      <TD>{data["status"].length > 0 ? "Terdaftar" : "Pending"}</TD>
                      <TD type="code">{data["transaction"].noktp}</TD>
                      <TD>{newDate(data["transaction"].transactionupdate)}</TD>
                      <TD type="code">{data["transaction"].rscode}</TD>
                      <TD>{data["transaction"].transactionname}</TD>
                      <TD type="code">{data["transaction"].transactionphone}</TD>
                      <TD>{data["transaction"].payment}</TD>
                      <TD>{newPrice(data["transaction"].totalpay)}</TD>
                      <TD type={data["status"].length > 0 ? "code" : "reg"}>{data["status"].length > 0 ? data["status"][0].encounter : ""}</TD>
                      <TD type={data["status"].length > 0 ? "code" : "reg"}>{data["status"].length > 0 ? data["status"][0].firstcondition : ""}</TD>
                      <TD type={data["status"].length > 0 ? "code" : "reg"}>{data["status"].length > 0 ? data["status"][0].secondcondition : ""}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </DashboardBody>
            {isPatientShown && <Pagination radius="full" nospacing currentPage={currentPage} ttlPages={totalPages} onChange={handlePageChange} />}
          </Fragment>
        );
      default:
        return <DashboardHead title={`Halaman Dashboard ${pagetitle} akan segera hadir.`} />;
    }
  };

  useEffect(() => {
    const calculateAge = () => {
      if (inputData.birth) {
        try {
          const birthDate = moment(inputData.birth, moment.ISO_8601, true);
          if (birthDate.isValid()) {
            const today = moment().tz("Asia/Jakarta");
            const years = today.diff(birthDate, "years", true);
            const months = today.diff(birthDate, "months") % 12;
            const days = today.diff(birthDate, "days") % 30 || 0;
            setInputData({ ...inputData, ageyear: Math.floor(years), agemonth: months, ageday: days });
          } else {
            console.warn("Invalid birth date format. Please use YYYY-MM-DD.");
          }
        } catch (error) {
          console.error("Error calculating age:", error);
        }
      } else {
        setInputData({ ...inputData, ageyear: "", agemonth: "", ageday: "" });
      }
    };
    calculateAge();
  }, [inputData.birth]);

  useEffect(() => {
    if (slug === "RESERVATION") {
      setAvailHoursData(houropt.filter((hour) => !bookedHoursData.includes(hour)));
    }
  }, [slug, bookedHoursData]);

  useEffect(() => {
    log("formatted date:", `${startDate} - ${endDate}`);
  }, [startDate, endDate]);

  useEffect(() => {
    setInputData({ ...inputSchema });
    setErrors({ ...errorSchema });
    setSelectedData(null);
    setSelectedImage(null);
    fetchData();
  }, [slug, currentPage, limit, status, selectedStatus, selectedBranch, selectedDentist, selectedCust, onPageTabId, startDate, endDate]);

  useEffect(() => {
    if (slug === "ORGANIZATION") {
      if (selectedBranch) {
        const selecteddata = allBranchData.find((item) => item.idoutlet === selectedBranch);
        if (selecteddata) {
          setInputData({ ...inputData, name: selecteddata.outlet_name, phone: selecteddata.outlet_phone, address: selecteddata.outlet_address, postcode: selecteddata.postcode });
        } else {
          setInputData({ ...inputData, name: "", phone: "", address: "", postcode: "" });
        }
      } else {
        setInputData({ ...inputData, name: "", phone: "", address: "", postcode: "" });
      }
    }
  }, [selectedBranch]);

  useEffect(() => {
    fetchAdditionalData();
  }, [slug === "RESERVATION" ? selectedBranch : null]);

  useEffect(() => {
    setLimit(5);
    setCurrentPage(1);
    setSelectedMode("add");
    setSortOrder("asc");
    setSelectedBranch(idoutlet);
    setSelectedCust(null);
    setOnpageData({ ...inputSchema });
    handleABranchChange(idoutlet);
  }, [slug]);

  if (!isLoggedin) {
    return <Navigate to="/login" />;
  }

  return (
    <Pages title={`${pagetitle} - Dashboard`} loading={isOptimizing}>
      <DashboardContainer>{renderContent()}</DashboardContainer>
    </Pages>
  );
};

export default DashboardSlugPage;
