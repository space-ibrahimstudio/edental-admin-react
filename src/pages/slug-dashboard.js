import React, { Fragment, useState, useEffect, useRef } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useContent, useFormat, useDevmode } from "@ibrahimstudio/react";
import { ISTrash } from "@ibrahimstudio/icons";
import { Input } from "@ibrahimstudio/input";
import { Button } from "@ibrahimstudio/button";
import html2pdf from "html2pdf.js";
import moment from "moment-timezone";
import { useAuth } from "../libs/securities/auth";
import { useApi } from "../libs/apis/office";
import { useNotifications } from "../components/feedbacks/context/notifications-context";
import { useSearch } from "../libs/plugins/handler";
import { getCurrentDate, getNormalPhoneNumber, exportToExcel, getNestedValue, inputValidator, emailValidator } from "../libs/plugins/controller";
import { inputSchema, errorSchema } from "../libs/sources/common";
import { useOptions, useAlias } from "../libs/plugins/helper";
import Pages from "../components/frames/pages";
import { DashboardContainer, DashboardHead, DashboardToolbar, DashboardTool, DashboardBody } from "./overview-dashboard";
import Table, { THead, TBody, TR, TH, TD } from "../components/contents/table";
import Grid, { GridItem } from "../components/contents/grid";
import Calendar, { CalendarDay, CalendarDate, DateEvent, EventModal } from "../components/contents/calendar";
import { SubmitForm, FileForm } from "../components/input-controls/forms";
import OnpageForm, { FormHead, FormFooter } from "../components/input-controls/onpage-forms";
import Fieldset from "../components/input-controls/inputs";
import TabGroup from "../components/input-controls/tab-group";
import TabSwitch from "../components/input-controls/tab-switch";
import { Search, Plus, Export, HChevron, Check } from "../components/contents/icons";
import { LoadingContent } from "../components/feedbacks/screens";
import Pagination from "../components/navigations/pagination";
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
  const { limitopt, genderopt, levelopt, usrstatopt, unitopt, houropt, postatopt, pocstatopt, reservstatopt, paymentstatopt, paymenttypeopt, orderstatopt } = useOptions();
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

  const [custData, setCustData] = useState([]);
  const [allCustData, setAllCustData] = useState([]);
  const [selectedCust, setSelectedCust] = useState(null);
  const [servicedata, setservicedata] = useState([]);
  const [allservicedata, setAllservicedata] = useState([]);
  const [branchData, setBranchData] = useState([]);
  const [allBranchData, setAllBranchData] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(idoutlet);
  const [dentistData, setDentistData] = useState([]);
  const [branchDentistData, setBranchDentistData] = useState([]);
  const [stockData, setStockData] = useState([]);
  const [stockOutData, setStockOutData] = useState([]);
  const [allStockData, setAllStockData] = useState([]);
  const [categoryStockData, setCategoryStockData] = useState([]);
  const [inPOData, setInPOData] = useState([]);
  const [centralPOData, setCentralPOData] = useState([]);
  const [reservData, setReservData] = useState([]);
  const [rscodeData, setRscodeData] = useState([]);
  const [bookedHoursData, setBookedHoursData] = useState([]);
  const [availHoursData, setAvailHoursData] = useState([]);
  const [orderData, setOrderData] = useState([]);
  const [fvaListData, setFvaListData] = useState([]);
  const [selectedOrderData, setSelectedOrderData] = useState(null);
  const [orderDetailData, setOrderDetailData] = useState(null);
  const [eventsData, setEventsData] = useState([]);
  const [selectedDayEvents, setSelectedDayEvents] = useState([]);
  const [tabId, setTabId] = useState("1");
  const [subTabId, setSubTabId] = useState("1");
  const [medicRcdData, setMedicRcdData] = useState([]);
  const [anamesaData, setAnamesaData] = useState([]);
  const [odontogramData, setOdontogramData] = useState([]);
  const [inspectData, setInspectData] = useState([]);
  const [historyReservData, setHistoryReservData] = useState([]);
  const [historyOrderData, setHistoryOrderData] = useState([]);
  const [photoMedic, setPhotoMedic] = useState([]);
  const [userData, setUserData] = useState([]);
  const [alkesData, setAlkesData] = useState([]);

  const [inputData, setInputData] = useState({ ...inputSchema });
  const [onpageData, setOnpageData] = useState({ ...inputData });
  const [errors, setErrors] = useState({ ...errorSchema });

  const handlePageChange = (page) => setCurrentPage(page);
  const handleBranchChange = (value) => setSelectedBranch(value);
  const handleImageSelect = (file) => setSelectedImage(file);
  const openDetail = (params) => navigate(`${pagepath}/${toPathname(params)}`);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputData((prevState) => ({ ...prevState, [name]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
    if (slug === "LAYANAN") {
      if (name === "service") {
        const newvalue = value.toLowerCase();
        let serviceexists = allservicedata.some((item) => {
          const servicename = (item["Nama Layanan"] && item["Nama Layanan"].servicename).toLowerCase();
          return servicename === newvalue;
        });
        if (serviceexists) {
          setErrors((prevErrors) => ({ ...prevErrors, service: "Layanan dengan nama yang sama sudah ada." }));
        }
      }
    } else if (slug === "RESERVATION") {
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
      } else if (name === "email") {
        if (!emailValidator(value)) {
          setErrors((prevErrors) => ({ ...prevErrors, email: "Invalid email format" }));
        } else {
          setErrors((prevErrors) => ({ ...prevErrors, email: "" }));
        }
      } else if (name === "sub_service") {
        const selectedservice = allservicedata.find((s) => s["Nama Layanan"].servicename === inputData.service);
        const selectedsubservice = selectedservice["Jenis Layanan"].find((type) => type.servicetypename === value);
        if (value === "RESERVATION") {
          setInputData((prevState) => ({ ...prevState, id: selectedsubservice.idservicetype, price: 100000 }));
        } else {
          setInputData((prevState) => ({ ...prevState, id: selectedsubservice.idservicetype, price: 0 }));
        }
        log(`id servicetype set to ${selectedsubservice.idservicetype}`);
      } else if (name === "date") {
        getAvailHours(value);
      } else if (name === "price") {
        if (value < MIN_AMOUNT) {
          setErrors((prevErrors) => ({ ...prevErrors, price: `The minimum amount is ${MIN_AMOUNT.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}` }));
        } else {
          setErrors((prevErrors) => ({ ...prevErrors, price: "" }));
        }
      }
    } else if (slug === "ORDER CUSTOMER") {
      if (name === "typepayment") {
        if (value === "cash") {
          setInputData((prevState) => ({ ...prevState, bank_code: "CASH" }));
        } else {
          setInputData((prevState) => ({ ...prevState, status: "0" }));
        }
      }
    }
  };

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
        updatedvalues[index].idstock = selectedItem.idstock;
        updatedvalues[index].sku = selectedItem.sku;
        log(`id item set to ${selectedItem.idstock}`);
        log(`sku item set to ${selectedItem.sku}`);
      }
    }
    if (field === "alkesitem" && name === "itemname") {
      const selectedItem = allStockData.find((s) => s.itemname === value);
      if (selectedItem) {
        updatedvalues[index].idstock = selectedItem.idstock;
        updatedvalues[index].sku = selectedItem.sku;
        updatedvalues[index].unit = selectedItem.unit;
        log(`id item set to ${selectedItem.idstock}`);
        log(`sku item set to ${selectedItem.sku}`);
        log(`unit item set to ${selectedItem.unit}`);
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
        case "PO PUSAT":
          addtFormData.append("data", JSON.stringify({ secret, limit, hal: offset, status }));
          addtdata = await apiRead(addtFormData, "office", "viewpostock");
          if (addtdata && addtdata.data && addtdata.data.length > 0) {
            setCentralPOData(addtdata.data);
            setTotalPages(addtdata.TTLPage);
          } else {
            setCentralPOData([]);
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
        case "REKAM MEDIS":
          const nikno = allCustData.find((data) => data.idauthuser === selectedCust);
          switch (tabId) {
            case "1":
              switch (subTabId) {
                case "2":
                  if (selectedCust) {
                    addtFormData.append("data", JSON.stringify({ secret, noktp: nikno.noktp }));
                    addtdata = await apiRead(addtFormData, "office", "viewhistoryresev");
                    if (addtdata && addtdata.data && addtdata.data.length > 0) {
                      setHistoryReservData(addtdata.data);
                    } else {
                      setHistoryReservData([]);
                    }
                  } else {
                    setHistoryReservData([]);
                  }
                  break;
                case "3":
                  if (selectedCust) {
                    addtFormData.append("data", JSON.stringify({ secret, noktp: nikno.noktp }));
                    addtdata = await apiRead(addtFormData, "office", "viewhistoryorder");
                    if (addtdata && addtdata.data && addtdata.data.length > 0) {
                      setHistoryOrderData(addtdata.data);
                    } else {
                      setHistoryOrderData([]);
                    }
                  } else {
                    setHistoryOrderData([]);
                  }
                  break;
                case "4":
                  addtFormData.append("data", JSON.stringify({ secret, iduser: selectedCust }));
                  addtdata = await apiRead(addtFormData, "office", "viewmedics");
                  if (addtdata && addtdata.data && addtdata.data.length > 0) {
                    setMedicRcdData(addtdata.data);
                  } else {
                    setMedicRcdData([]);
                  }
                  break;
                default:
                  break;
              }
              break;
            case "2":
              addtFormData.append("data", JSON.stringify({ secret, iduser: selectedCust }));
              switch (subTabId) {
                case "1":
                  addtdata = await apiRead(addtFormData, "office", "viewanamnesa");
                  if (addtdata && addtdata.data && addtdata.data.length > 0) {
                    setAnamesaData(addtdata.data);
                  } else {
                    setAnamesaData([]);
                  }
                  break;
                case "2":
                  addtdata = await apiRead(addtFormData, "office", "viewodontogram");
                  if (addtdata && addtdata.data && addtdata.data.length > 0) {
                    setOdontogramData(addtdata.data);
                  } else {
                    setOdontogramData([]);
                  }
                  break;
                case "3":
                  addtdata = await apiRead(addtFormData, "office", "viewinspection");
                  if (addtdata && addtdata.data && addtdata.data.length > 0) {
                    setInspectData(addtdata.data);
                  } else {
                    setInspectData([]);
                  }
                  break;
                case "4":
                  addtdata = await apiRead(addtFormData, "office", "viewphoto");
                  if (addtdata && addtdata.data && addtdata.data.length > 0) {
                    setPhotoMedic(addtdata.data);
                  } else {
                    setPhotoMedic([]);
                  }
                  break;
                default:
                  break;
              }
              break;
            case "3":
              switch (subTabId) {
                case "3":
                  if (selectedCust) {
                    addtFormData.append("data", JSON.stringify({ secret, noktp: nikno.noktp }));
                    addtdata = await apiRead(addtFormData, "office", "viewhistoryorder");
                    if (addtdata && addtdata.data && addtdata.data.length > 0) {
                      setHistoryOrderData(addtdata.data);
                    } else {
                      setHistoryOrderData([]);
                    }
                  } else {
                    setHistoryOrderData([]);
                  }
                  break;
                case "4":
                  addtFormData.append("data", JSON.stringify({ secret, iduser: selectedCust }));
                  addtdata = await apiRead(addtFormData, "office", "viewstockoutdetail");
                  if (addtdata && addtdata.data && addtdata.data.length > 0) {
                    setAlkesData(addtdata.data);
                  } else {
                    setAlkesData([]);
                  }
                  break;
                default:
                  break;
              }
              break;
            default:
              break;
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
      const stockdata = await apiRead(formData, "office", "searchstock");
      if (stockdata && stockdata.data && stockdata.data.length > 0) {
        setAllStockData(stockdata.data);
      } else {
        setAllStockData([]);
      }
      const rscodedata = await apiRead(formData, "office", "searchrscode");
      if (rscodedata && rscodedata.data && rscodedata.data.length > 0) {
        setRscodeData(rscodedata.data);
      } else {
        setRscodeData([]);
      }
    } catch (error) {
      showNotifications("danger", errormsg);
      console.error(errormsg, error);
    } finally {
      setIsOptimizing(false);
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
        case "RESERVATION":
          switchedData = currentData(reservData, "idreservation");
          log(`id ${slug} data switched:`, switchedData.idreservation);
          setInputData({ status: switchedData.status_reservation, statuspayment: switchedData.status_dp });
          break;
        case "MANAJEMEN USER":
          switchedData = currentData(userData, "idauth");
          log(`id ${slug} data switched:`, switchedData.idauth);
          setInputData({ outlet: switchedData.idoutlet, username: switchedData.username, level: switchedData.level, status: switchedData.apiauth_status });
          break;
        case "PO MASUK":
          switchedData = currentData(inPOData, "PO Stock.idpostock");
          log(`id ${slug} data switched:`, switchedData["PO Stock"].idpostock);
          setInputData({ id: switchedData["PO Stock"].idpostock, status: switchedData["PO Stock"].statusstock });
          break;
        case "PO PUSAT":
          switchedData = currentData(centralPOData, "PO Stock.idpostock");
          log(`id ${slug} data switched:`, switchedData["PO Stock"].idpostock);
          setInputData({ id: switchedData["PO Stock"].idpostock, status: switchedData["PO Stock"].statusstock });
          break;
        case "DENTIST":
          switchedData = currentData(dentistData, "id_dentist");
          log(`id ${slug} data switched:`, switchedData.id_dentist);
          setInputData({ cctr: switchedData.id_branch, name: switchedData.name_dentist, sip: switchedData.sip, phone: switchedData.phone });
          break;
        case "REKAM MEDIS":
          switch (tabId) {
            case "3":
              switch (subTabId) {
                case "3":
                  switchedData = currentData(historyOrderData, "idtransaction");
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
                default:
                  break;
              }
              break;
            default:
              break;
          }
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
        requiredFields = ["name", "phone", "dentist", "order.service", "order.servicetype", "order.price"];
        break;
      case "PO PUSAT":
        if (selectedMode === "update") {
          requiredFields = [];
        } else {
          requiredFields = ["postock.itemname", "postock.sku", "postock.stockin"];
        }
        break;
      case "MANAJEMEN USER":
        requiredFields = ["username", "level", "status"];
        break;
      case "REKAM MEDIS":
        switch (tabId) {
          case "1":
            switch (subTabId) {
              case "1":
                requiredFields = ["name", "phone", "email", "birth", "nik", "address", "gender", "room", "service", "sub_service", "dentist"];
                break;
              default:
                break;
            }
            break;
          case "2":
            switch (subTabId) {
              case "1":
                requiredFields = ["histori_illness", "main_complaint", "additional_complaint", "current_illness", "gravida"];
                break;
              case "2":
                requiredFields = ["occlusi", "palatinus", "mandibularis", "palatum", "diastema", "anomali"];
                break;
              case "3":
                requiredFields = ["desc", "nadi", "tensi", "suhu", "berat_badan", "tinggi_badan", "pernapasan", "mata", "mulut_gigi", "kulit"];
                break;
              case "4":
                requiredFields = [];
                break;
              default:
                break;
            }
            break;
          case "3":
            switch (subTabId) {
              case "3":
                if (selectedMode === "update") {
                  requiredFields = ["name", "phone", "dentist", "order.service", "order.servicetype", "order.price"];
                } else {
                  requiredFields = ["rscode"];
                }
                break;
              case "4":
                requiredFields = ["rscode", "alkesitem.categorystock", "alkesitem.subcategorystock", "alkesitem.itemname", "alkesitem.unit", "alkesitem.qty", "alkesitem.status"];
                break;
              default:
                break;
            }
            break;
          default:
            break;
        }
        break;
      case "DENTIST":
        requiredFields = ["cctr", "name", "sip", "phone"];
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
          submittedData = { secret, region: inputData.region, name: inputData.name, address: inputData.address, phone: inputData.phone, mainregion: inputData.main_region, postcode: inputData.postcode, cctr_group: inputData.cctr_group, cctr: inputData.cctr, coordinate: inputData.coordinate };
          break;
        case "STOCK":
          submittedData = { secret, categorystock: inputData.category, subcategorystock: inputData.sub_category, itemname: inputData.name, unit: inputData.unit, stockin: inputData.count, value: inputData.value };
          break;
        case "RESERVATION":
          if (selectedMode === "update") {
            submittedData = { secret, status_reservation: inputData.status, status_dp: inputData.statuspayment };
          } else {
            submittedData = { secret, idservicetype: inputData.id, name: inputData.name, phone: inputData.phone, email: inputData.email, voucher: inputData.vouchercode, service: inputData.service, typeservice: inputData.sub_service, reservationdate: inputData.date, reservationtime: inputData.time, price: inputData.price, bank_code: inputData.bank_code, note: inputData.note };
          }
          break;
        case "ORDER CUSTOMER":
          submittedData = { secret, name: inputData.name, phone: inputData.phone, bank_code: inputData.bank_code, dentist: inputData.dentist, transactionstatus: inputData.status, layanan: inputData.order };
          break;
        case "PO PUSAT":
          if (selectedMode === "update") {
            submittedData = { secret, idpostock: selectedData, status: inputData.status };
          } else {
            submittedData = { secret, postock: inputData.postock };
          }
          break;
        case "PO MASUK":
          submittedData = { secret, idpostock: selectedData, status: inputData.status };
          break;
        case "MANAJEMEN USER":
          submittedData = { secret, idoutlet: inputData.outlet, username: inputData.username, password: inputData.password, level: inputData.level, status: inputData.status };
          break;
        case "REKAM MEDIS":
          switch (tabId) {
            case "1":
              switch (subTabId) {
                case "1":
                  submittedData = { secret, iduser: selectedCust, name: inputData.name, phone: inputData.phone, email: inputData.email, birthday: inputData.birth, noktp: inputData.nik, address: inputData.address, gender: inputData.gender, room: inputData.room, ageyear: inputData.ageyear, agemonth: inputData.agemonth, ageday: inputData.ageday, service: inputData.service, servicetype: inputData.sub_category, dentist: inputData.dentist };
                  break;
                default:
                  break;
              }
              break;
            case "2":
              switch (subTabId) {
                case "1":
                  submittedData = { secret, iduser: selectedCust, histori_illness: inputData.histori_illness, main_complaint: inputData.main_complaint, additional_complaint: inputData.additional_complaint, current_illness: inputData.current_illness, gravida: inputData.gravida, alergi_gatal: inputData.alergi_gatal, alergi_debu: inputData.alergi_debu, alergi_obat: inputData.alergi_obat, alergi_makanan: inputData.alergi_makanan, alergi_lainnya: inputData.alergi_lainnya };
                  break;
                case "2":
                  submittedData = { secret, iduser: selectedCust, occlusi: inputData.occlusi, palatinus: inputData.palatinus, mandibularis: inputData.mandibularis, palatum: inputData.palatum, diastema: inputData.diastema, anomali: inputData.anomali, other: inputData.other_odontogram };
                  break;
                case "3":
                  submittedData = { secret, iduser: selectedCust, desciption: inputData.desc, pulse: inputData.nadi, tension: inputData.tensi, temperature: inputData.suhu, weight: inputData.berat_badan, height: inputData.tinggi_badan, breath: inputData.pernapasan, eye: inputData.mata, mouth: inputData.mulut_gigi, skin: inputData.kulit };
                  break;
                case "4":
                  submittedData = { secret, iduser: selectedCust };
                  break;
                default:
                  break;
              }
              break;
            case "3":
              switch (subTabId) {
                case "3":
                  const nikno = allCustData.filter((data) => data.idauthuser === selectedCust);
                  const noktp = nikno[0].noktp;
                  if (selectedMode === "update") {
                    submittedData = { secret, name: inputData.name, phone: inputData.phone, bank_code: inputData.bank_code, dentist: inputData.dentist, transactionstatus: inputData.status, layanan: inputData.order };
                  } else {
                    submittedData = { secret, noktp, rscode: inputData.rscode };
                  }
                  break;
                case "4":
                  submittedData = { secret, iduser: selectedCust, rscode: inputData.rscode, stock: inputData.alkesitem };
                  break;
                default:
                  break;
              }
              break;
            default:
              break;
          }
          break;
        case "DENTIST":
          submittedData = { secret, idbranch: inputData.cctr, name_dentist: inputData.name, sip: inputData.sip, phone: inputData.phone };
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
          case "MANAJEMEN USER":
            submittedData = { secret, idoutlet: "", username: "", password: "", level: "", status: "" };
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
  const { searchTerm: stockOutSearch, handleSearch: handleStockOutSearch, filteredData: filteredStockOutData, isDataShown: isStockOutShown } = useSearch(stockOutData, ["categorystock", "subcategorystock", "sku", "itemname", "outletname"]);
  const { searchTerm: inPOSearch, handleSearch: handleInPOSearch, filteredData: filteredInPOData, isDataShown: isInPOShown } = useSearch(inPOData, ["PO Stock.outletname", "PO Stock.postockcode"]);
  const { searchTerm: reservSearch, handleSearch: handleReservSearch, filteredData: filteredReservData, isDataShown: isReservShown } = useSearch(reservData, ["rscode", "name", "phone", "outlet_name"]);
  const { searchTerm: orderSearch, handleSearch: handleOrderSearch, filteredData: filteredOrderData, isDataShown: isOrderShown } = useSearch(orderData, ["transactionname", "noinvoice", "rscode", "dentist", "outlet_name"]);
  const { searchTerm: centralPOSearch, handleSearch: handleCentralPOSearch, filteredData: filteredCentralPOData, isDataShown: isCentralPOShown } = useSearch(centralPOData, ["PO Stock.outletname", "PO Stock.postockcode"]);
  const { searchTerm: userSearch, handleSearch: handleUserSearch, filteredData: filteredUserData, isDataShown: isUserShown } = useSearch(userData, ["username", "cctr", "outlet_name"]);

  const renderContent = () => {
    switch (slug) {
      case "DATA CUSTOMER":
        return (
          <Fragment>
            <DashboardHead title={pagetitle} desc="Daftar Customer yang memiliki riwayat Reservasi. Data ini dibuat otomatis saat proses reservasi dilakukan." />
            <DashboardToolbar>
              <DashboardTool>
                <Input id={`search-data-${pageid}`} radius="full" isLabeled={false} placeholder="Cari data ..." type="text" value={custSearch} onChange={(e) => handleCustSearch(e.target.value)} startContent={<Search />} />
                {level === "admin" && <Input id={`${pageid}-outlet`} isLabeled={false} variant="select" isSearchable radius="full" placeholder="Pilih Cabang" value={selectedBranch} options={allBranchData.map((branch) => ({ value: branch.idoutlet, label: branch.outlet_name.replace("E DENTAL - DOKTER GIGI", "CABANG") }))} onSelect={handleBranchChange} />}
              </DashboardTool>
              <DashboardTool>
                <Input id={`limit-data-${pageid}`} isLabeled={false} variant="select" noEmptyValue radius="full" placeholder="Baris per Halaman" value={limit} options={limitopt} onSelect={handleLimitChange} isReadonly={!isCustShown} />
                <Button id={`export-data-${pageid}`} radius="full" bgColor="var(--color-green)" buttonText="Export" onClick={() => exportToExcel(filteredCustData, "Daftar Customer", `daftar_customer_${getCurrentDate()}`)} isDisabled={!isCustShown} startContent={<Export />} />
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
            {isCustShown > 0 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />}
          </Fragment>
        );
      case "MANAJEMEN USER":
        return (
          <Fragment>
            <DashboardHead title={pagetitle} desc="Data pengguna aplikasi. Klik Tambah Baru untuk membuat data pengguna baru, atau klik ikon di kolom Action untuk memperbarui data." />
            <DashboardToolbar>
              <DashboardTool>
                <Input id={`search-data-${pageid}`} radius="full" isLabeled={false} placeholder="Cari data ..." type="text" value={userSearch} onChange={(e) => handleUserSearch(e.target.value)} startContent={<Search />} />
              </DashboardTool>
              <DashboardTool>
                <Input id={`limit-data-${pageid}`} isLabeled={false} variant="select" noEmptyValue radius="full" placeholder="Baris per Halaman" value={limit} options={limitopt} onSelect={handleLimitChange} isReadonly={!isUserShown} />
                <Button id={`add-new-data-${pageid}`} radius="full" buttonText="Tambah" onClick={openForm} startContent={<Plus />} />
              </DashboardTool>
            </DashboardToolbar>
            <DashboardBody>
              <Table byNumber isEditable isDeletable page={currentPage} limit={limit} isNoData={!isUserShown} isLoading={isFetching}>
                <THead>
                  <TR>
                    <TH isSorted onSort={() => handleSortDate(userData, setUserData, "apiauthcreate")}>
                      Tanggal Dibuat
                    </TH>
                    <TH>Username</TH>
                    <TH>Level</TH>
                    <TH>Status</TH>
                    <TH>Nama Cabang</TH>
                    <TH>Kode Cabang</TH>
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
            {isReservShown && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />}
            {isFormOpen && (
              <SubmitForm size="sm" formTitle={selectedMode === "update" ? "Ubah Data Pengguna" : "Tambah Data Pengguna"} operation={selectedMode} fetching={isFormFetching} onSubmit={(e) => handleSubmit(e, "cuduser")} loading={isSubmitting} onClose={closeForm}>
                <Fieldset>
                  <Input id={`${pageid}-username`} radius="full" labelText="Username" placeholder="cabang.jakarta@edental.id" type="text" name="username" value={inputData.username} onChange={handleInputChange} errorContent={errors.username} isRequired />
                  <Input id={`${pageid}-password`} radius="full" labelText="Password" placeholder="Masukkan password" type="password" name="password" value={inputData.password} onChange={handleInputChange} errorContent={errors.password} isRequired />
                </Fieldset>
                <Fieldset>
                  <Input id={`${pageid}-level`} variant="select" noEmptyValue radius="full" labelText="Level/Akses" placeholder="Pilih level/akses" name="level" value={inputData.level} options={levelopt} onSelect={(selectedValue) => handleInputChange({ target: { name: "level", value: selectedValue } })} errorContent={errors.level} isRequired />
                  <Input id={`${pageid}-status`} variant="select" noEmptyValue radius="full" labelText="Status Pengguna" placeholder="Pilih status" name="status" value={inputData.status} options={usrstatopt} onSelect={(selectedValue) => handleInputChange({ target: { name: "status", value: selectedValue } })} errorContent={errors.status} isRequired />
                  <Input id={`${pageid}-outlet`} variant="select" isSearchable radius="full" labelText="Cabang" placeholder="Pilih cabang" name="outlet" value={inputData.outlet} options={allBranchData.map((branch) => ({ value: branch.idoutlet, label: branch.outlet_name.replace("E DENTAL - DOKTER GIGI", "CABANG") }))} onSelect={(selectedValue) => handleInputChange({ target: { name: "outlet", value: selectedValue } })} errorContent={errors.outlet} isRequired />
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
                <Input id={`search-data-${pageid}`} radius="full" isLabeled={false} placeholder="Cari data ..." type="text" value={serviceSearch} onChange={(e) => handleServiceSearch(e.target.value)} startContent={<Search />} />
              </DashboardTool>
              <DashboardTool>
                <Input id={`limit-data-${pageid}`} isLabeled={false} variant="select" noEmptyValue radius="full" placeholder="Baris per Halaman" value={limit} options={limitopt} onSelect={handleLimitChange} isReadonly={!isServiceShown} />
                <Button id={`add-new-data-${pageid}`} radius="full" buttonText="Tambah" onClick={openForm} startContent={<Plus />} />
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
                            <Fieldset key={idx} type="row" markers={`${idx + 1}.`}>
                              <Input id={`${pageid}-name-${index}-${idx}`} radius="full" labelText="Jenis Layanan" value={subdata.servicetypename} isReadonly />
                              <Input id={`${pageid}-price-${index}-${idx}`} radius="full" labelText="Harga" value={newPrice(subdata.serviceprice)} isReadonly />
                              <Input id={`${pageid}-status-${index}-${idx}`} radius="full" labelText="Status" value={subdata.servicetypestatus} isReadonly />
                            </Fieldset>
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
                <Input id={`${pageid}-name`} radius="full" labelText="Nama Layanan" placeholder="Masukkan nama layanan" type="text" name="service" value={inputData.service} onChange={handleInputChange} errorContent={errors.service} isRequired />
                {inputData.layanan.map((subservice, index) => (
                  <Fieldset key={index} type="row" markers={`${index + 1}.`} endContent={<Button id={`${pageid}-delete-row-${index}`} variant="dashed" subVariant="icon" isTooltip size="sm" radius="full" color={index <= 0 ? "var(--color-red-30)" : "var(--color-red)"} iconContent={<ISTrash />} tooltipText="Hapus" onClick={() => handleRmvRow("layanan", index)} isDisabled={index <= 0} />}>
                    <Input id={`${pageid}-type-name-${index}`} radius="full" labelText="Jenis Layanan" placeholder="e.g. Scaling gigi" type="text" name="servicetype" value={subservice.servicetype} onChange={(e) => handleRowChange("layanan", index, e)} errorContent={errors[`layanan.${index}.servicetype`] ? errors[`layanan.${index}.servicetype`] : ""} isRequired />
                    <Input id={`${pageid}-type-price-${index}`} radius="full" labelText="Atur Harga" placeholder="Masukkan harga" type="number" name="price" value={subservice.price} onChange={(e) => handleRowChange("layanan", index, e)} errorContent={errors[`layanan.${index}.price`] ? errors[`layanan.${index}.price`] : ""} isRequired />
                  </Fieldset>
                ))}
                <Button id={`${pageid}-add-row`} variant="dashed" size="sm" radius="full" color="var(--color-hint)" buttonText="Tambah Jenis Layanan" onClick={() => handleAddRow("layanan")} />
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
                <Input id={`search-data-${pageid}`} radius="full" isLabeled={false} placeholder="Cari data ..." type="text" value={branchSearch} onChange={(e) => handleBranchSearch(e.target.value)} startContent={<Search />} />
              </DashboardTool>
              <DashboardTool>
                <Input id={`limit-data-${pageid}`} isLabeled={false} variant="select" noEmptyValue radius="full" placeholder="Baris per Halaman" value={limit} options={limitopt} onSelect={handleLimitChange} isReadonly={!isBranchShown} />
                <Button id={`add-new-data-${pageid}`} radius="full" buttonText="Tambah" onClick={openForm} startContent={<Plus />} />
                <Button id={`export-data-${pageid}`} radius="full" bgColor="var(--color-green)" buttonText="Export" onClick={() => exportToExcel(filteredBranchData, "Daftar Cabang", `daftar_cabang_${getCurrentDate()}`)} isDisabled={!isBranchShown} startContent={<Export />} />
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
            {isBranchShown && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />}
            {isFormOpen && (
              <SubmitForm formTitle={selectedMode === "update" ? "Perbarui Data Cabang" : "Tambah Data Cabang"} operation={selectedMode} fetching={isFormFetching} onSubmit={(e) => handleSubmit(e, "cudoutlet")} loading={isSubmitting} onClose={closeForm}>
                <Fieldset>
                  <Input id={`${pageid}-name`} radius="full" labelText="Nama Outlet" placeholder="Edental Jakarta Pusat" type="text" name="name" value={inputData.name} onChange={handleInputChange} errorContent={errors.name} isRequired />
                  <Input id={`${pageid}-phone`} radius="full" labelText="Nomor Kontak Cabang" placeholder="0882xxx" type="tel" name="phone" value={inputData.phone} onChange={handleInputChange} errorContent={errors.phone} isRequired />
                  <Input id={`${pageid}-mainregion`} radius="full" labelText="Main Region" placeholder="Jawa" type="text" name="main_region" value={inputData.main_region} onChange={handleInputChange} errorContent={errors.main_region} isRequired />
                </Fieldset>
                <Fieldset>
                  <Input id={`${pageid}-region`} radius="full" labelText="Region" placeholder="DKI Jakarta" type="text" name="region" value={inputData.region} onChange={handleInputChange} errorContent={errors.region} isRequired />
                  <Input id={`${pageid}-address`} radius="full" labelText="Alamat Cabang" placeholder="123 Main Street" type="text" name="address" value={inputData.address} onChange={handleInputChange} errorContent={errors.address} isRequired />
                  <Input id={`${pageid}-postcode`} radius="full" labelText="Kode Pos" placeholder="40282" type="number" name="postcode" value={inputData.postcode} onChange={handleInputChange} errorContent={errors.postcode} isRequired />
                </Fieldset>
                <Fieldset>
                  <Input id={`${pageid}-coords`} radius="full" labelText="Titik Koordinat" placeholder="Masukkan titik koordinat" type="text" name="coordinate" value={inputData.coordinate} onChange={handleInputChange} errorContent={errors.coordinate} isRequired />
                  <Input id={`${pageid}-cctrgroup`} radius="full" labelText="CCTR Group" placeholder="Masukkan CCTR group" type="text" name="cctr_group" value={inputData.cctr_group} onChange={handleInputChange} errorContent={errors.cctr_group} isRequired />
                  <Input id={`${pageid}-cctr`} radius="full" labelText="CCTR" placeholder="Masukkan CCTR" type="text" name="cctr" value={inputData.cctr} onChange={handleInputChange} errorContent={errors.cctr} isRequired />
                </Fieldset>
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
                <Input id={`search-data-${pageid}`} radius="full" isLabeled={false} placeholder="Cari data ..." type="text" value={dentistSearch} onChange={(e) => handleDentistSearch(e.target.value)} startContent={<Search />} />
              </DashboardTool>
              <DashboardTool>
                <Input id={`limit-data-${pageid}`} isLabeled={false} variant="select" noEmptyValue radius="full" placeholder="Baris per Halaman" value={limit} options={limitopt} onSelect={handleLimitChange} isReadonly={!isDentistShown} />
                <Button id={`add-new-data-${pageid}`} radius="full" buttonText="Tambah" onClick={openForm} startContent={<Plus />} />
                <Button id={`export-data-${pageid}`} radius="full" bgColor="var(--color-green)" buttonText="Export" onClick={() => exportToExcel(filteredDentistData, "Daftar Dokter", `daftar_dokter_${getCurrentDate()}`)} isDisabled={!isDentistShown} startContent={<Export />} />
              </DashboardTool>
            </DashboardToolbar>
            <DashboardBody>
              <Table byNumber isEditable page={currentPage} limit={limit} isNoData={!isDentistShown} isLoading={isFetching}>
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
                    <TR key={index} onEdit={() => openEdit(data.id_dentist)}>
                      <TD type="code">{data.id_branch}</TD>
                      <TD>{toTitleCase(data.name_dentist.replace(`${data.id_branch} -`, ""))}</TD>
                      <TD type="code">{data.sip}</TD>
                      <TD type="number">{data.phone}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </DashboardBody>
            {isDentistShown && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />}
            {isFormOpen && (
              <SubmitForm size="md" formTitle={selectedMode === "update" ? "Perbarui Data Dokter" : "Tambah Data Dokter"} operation={selectedMode} fetching={isFormFetching} onSubmit={(e) => handleSubmit(e, "cuddentist")} loading={isSubmitting} onClose={closeForm}>
                <Fieldset>
                  <Input id={`${pageid}-outlet-code`} variant="select" isSearchable radius="full" labelText="Cabang" placeholder="Pilih cabang" name="cctr" value={inputData.cctr} options={allBranchData.map((branch) => ({ value: branch.cctr, label: branch.outlet_name.replace("E DENTAL - DOKTER GIGI", "CABANG") }))} onSelect={(selectedValue) => handleInputChange({ target: { name: "cctr", value: selectedValue } })} errorContent={errors.cctr} isRequired />
                  <Input id={`${pageid}-name`} radius="full" labelText="Nama Dokter" placeholder="Masukkan nama Dokter" type="text" name="name" value={inputData.name} onChange={handleInputChange} errorContent={errors.name} isRequired />
                  <Input id={`${pageid}-sip`} radius="full" labelText="Nomor SIP" placeholder="Masukkan nomor SIP" type="number" name="sip" value={inputData.sip} onChange={handleInputChange} errorContent={errors.sip} isRequired />
                  <Input id={`${pageid}-phone`} radius="full" labelText="Nomor Telepon" placeholder="0882xxx" type="tel" name="phone" value={inputData.phone} onChange={handleInputChange} errorContent={errors.phone} isRequired />
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
                <Input id={`search-data-${pageid}`} radius="full" isLabeled={false} placeholder="Cari data ..." type="text" startContent={<Search />} />
              </DashboardTool>
              <DashboardTool>
                <Input id={`limit-data-${pageid}`} isLabeled={false} variant="select" noEmptyValue radius="full" placeholder="Baris per Halaman" value={limit} options={limitopt} onSelect={handleLimitChange} isReadonly />
              </DashboardTool>
            </DashboardToolbar>
            <DashboardBody>
              <Table isNoData></Table>
            </DashboardBody>
          </Fragment>
        );
      case "STOCK":
        return (
          <Fragment>
            <DashboardHead title={pagetitle} desc="Data Stok berdasarkan kategori. Klik baris data untuk melihat masing-masing detail histori stok." />
            <DashboardToolbar>
              <DashboardTool>
                <Input id={`search-data-${pageid}`} radius="full" isLabeled={false} placeholder="Cari data ..." type="text" value={stockSearch} onChange={(e) => handleStockSearch(e.target.value)} startContent={<Search />} />
                {level === "admin" && <Input id={`${pageid}-outlet`} isLabeled={false} variant="select" isSearchable radius="full" placeholder="Pilih Cabang" value={selectedBranch} options={allBranchData.map((branch) => ({ value: branch.idoutlet, label: branch.outlet_name.replace("E DENTAL - DOKTER GIGI", "CABANG") }))} onSelect={handleBranchChange} />}
              </DashboardTool>
              <DashboardTool>
                <Input id={`limit-data-${pageid}`} isLabeled={false} variant="select" noEmptyValue radius="full" placeholder="Baris per Halaman" value={limit} options={limitopt} onSelect={handleLimitChange} isReadonly={!isStockShown} />
                {level === "admin" && <Button id={`add-new-data-${pageid}`} radius="full" buttonText="Tambah" onClick={openForm} startContent={<Plus />} />}
                <Button id={`export-data-${pageid}`} radius="full" bgColor="var(--color-green)" buttonText="Export" onClick={() => exportToExcel(filteredStockData, "Daftar Stok", `daftar_stok_${getCurrentDate()}`)} isDisabled={!isStockShown} startContent={<Export />} />
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
                    <Fragment>
                      {level === "admin" && (
                        <Fragment>
                          <TH>Harga</TH>
                          <TH>Total Nilai</TH>
                        </Fragment>
                      )}
                    </Fragment>
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
            {isStockShown && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />}
            {isFormOpen && (
              <SubmitForm formTitle={selectedMode === "update" ? "Perbarui Data Stok" : "Tambah Data Stok"} operation={selectedMode} fetching={isFormFetching} onSubmit={(e) => handleSubmit(e, "cudstock")} loading={isSubmitting} onClose={closeForm}>
                <Fieldset>
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
                    isDisabled={!inputData.category}
                  />
                  <Input id={`${pageid}-name`} radius="full" labelText="Nama Item" placeholder="STERILISATOR" type="text" name="name" value={inputData.name} onChange={handleInputChange} errorContent={errors.name} isRequired />
                </Fieldset>
                <Fieldset>
                  <Input id={`${pageid}-unit`} variant="select" radius="full" labelText="Unit/satuan" placeholder="Pilih satuan/unit" name="unit" value={inputData.unit} options={unitopt} onSelect={(selectedValue) => handleInputChange({ target: { name: "unit", value: selectedValue } })} errorContent={errors.unit} isRequired />
                  <Input id={`${pageid}-qty`} radius="full" labelText="Jumlah" placeholder="40" type="number" name="count" value={inputData.count} onChange={handleInputChange} errorContent={errors.count} isRequired />
                  <Input id={`${pageid}-price`} radius="full" labelText="Harga Item Satuan" placeholder="100000" type="number" name="value" value={inputData.value} onChange={handleInputChange} errorContent={errors.value} isRequired />
                </Fieldset>
              </SubmitForm>
            )}
          </Fragment>
        );
      case "STOCK OUT":
        return (
          <Fragment>
            <DashboardHead title={pagetitle} desc="Data Stok Keluar berdasarkan kategori. Klik baris data untuk melihat masing-masing detail histori stok." />
            <DashboardToolbar>
              <DashboardTool>
                <Input id={`search-data-${pageid}`} radius="full" isLabeled={false} placeholder="Cari data ..." type="text" value={stockOutSearch} onChange={(e) => handleStockOutSearch(e.target.value)} startContent={<Search />} />
                {level === "admin" && <Input id={`${pageid}-outlet`} isLabeled={false} variant="select" isSearchable radius="full" placeholder="Pilih Cabang" value={selectedBranch} options={allBranchData.map((branch) => ({ value: branch.idoutlet, label: branch.outlet_name.replace("E DENTAL - DOKTER GIGI", "CABANG") }))} onSelect={handleBranchChange} />}
              </DashboardTool>
              <DashboardTool>
                <Input id={`limit-data-${pageid}`} isLabeled={false} variant="select" noEmptyValue radius="full" placeholder="Baris per Halaman" value={limit} options={limitopt} onSelect={handleLimitChange} isReadonly={!isStockOutShown} />
                {level === "admin" && <Button id={`add-new-data-${pageid}`} radius="full" buttonText="Tambah" onClick={openForm} startContent={<Plus />} />}
                <Button id={`export-data-${pageid}`} radius="full" bgColor="var(--color-green)" buttonText="Export" onClick={() => exportToExcel(filteredStockOutData, "Daftar Stok Keluar", `daftar_stok_keluar_${getCurrentDate()}`)} isDisabled={!isStockOutShown} startContent={<Export />} />
              </DashboardTool>
            </DashboardToolbar>
            <DashboardBody>
              <Table byNumber isClickable page={currentPage} limit={limit} isNoData={!isStockOutShown} isLoading={isFetching}>
                <THead>
                  <TR>
                    <TH isSorted onSort={() => handleSortDate(stockOutData, setStockOutData, "stockoutcreate")}>
                      Tanggal Dibuat
                    </TH>
                    <TH>Kategori</TH>
                    <TH>Sub Kategori</TH>
                    <TH>Kode SKU</TH>
                    <TH>Nama Item</TH>
                    <TH>Unit</TH>
                    <TH>Stok Akhir</TH>
                    <Fragment>
                      {level === "admin" && (
                        <Fragment>
                          <TH>Harga</TH>
                          <TH>Total Nilai</TH>
                        </Fragment>
                      )}
                    </Fragment>
                    <TH>Nama Cabang</TH>
                  </TR>
                </THead>
                <TBody>
                  {filteredStockOutData.map((data, index) => (
                    <TR key={index} onClick={() => openDetail(data.itemname)}>
                      <TD>{newDate(data.stockoutcreate, "id")}</TD>
                      <TD>{toTitleCase(data.categorystock)}</TD>
                      <TD>{toTitleCase(data.subcategorystock)}</TD>
                      <TD type="code">{data.sku}</TD>
                      <TD>{toTitleCase(data.itemname)}</TD>
                      <TD>{data.unit}</TD>
                      <TD type="number">{data.lastqty}</TD>
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
            {isStockOutShown && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />}
          </Fragment>
        );
      case "PO MASUK":
        return (
          <Fragment>
            <DashboardHead title={pagetitle} desc="Daftar permintaan PO item dari semua cabang. Filter status PO melalui tombol tab, atau klik ikon pada kolom Action untuk memperbarui status PO." />
            <DashboardToolbar>
              <DashboardTool>
                <Input id={`search-data-${pageid}`} radius="full" isLabeled={false} placeholder="Cari data ..." type="text" value={inPOSearch} onChange={(e) => handleInPOSearch(e.target.value)} startContent={<Search />} />
              </DashboardTool>
              <DashboardTool>
                <Input id={`limit-data-${pageid}`} isLabeled={false} variant="select" noEmptyValue radius="full" placeholder="Baris per Halaman" value={limit} options={limitopt} onSelect={handleLimitChange} isReadonly={!isInPOShown} />
              </DashboardTool>
            </DashboardToolbar>
            <TabGroup buttons={postatus} />
            <DashboardBody>
              <Table byNumber isExpandable isEditable page={currentPage} limit={limit} isNoData={!isInPOShown} isLoading={isFetching}>
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
                            <Fieldset key={idx} type="row" markers={`${idx + 1}.`}>
                              <Input id={`item-name-${index}-${idx}`} radius="full" labelText="Nama Item" value={subdata.itemname} isReadonly />
                              <Input id={`item-sku-${index}-${idx}`} radius="full" labelText="Kode SKU" value={subdata.sku} isReadonly />
                              <Input id={`item-qty-${index}-${idx}`} radius="full" labelText="Jumlah Item" value={subdata.qty} isReadonly />
                              <Input id={`item-note-${index}-${idx}`} variant="textarea" labelText="Keterangan" rows={4} value={subdata.note} fallbackValue="Tidak ada keterangan." isReadonly />
                            </Fieldset>
                          ))}
                        </Fragment>
                      }
                      onEdit={() => openEdit(data["PO Stock"].idpostock)}
                    >
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
            {isInPOShown && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />}
            {isFormOpen && (
              <SubmitForm size="sm" formTitle="Ubah Status PO" operation="update" fetching={isFormFetching} onSubmit={(e) => handleSubmit(e, "updatepostock")} loading={isSubmitting} onClose={closeForm}>
                <Fieldset>
                  <Input id={`${pageid}-po-status`} variant="select" noEmptyValue radius="full" labelText="Status PO" placeholder="Set status" name="status" value={inputData.status} options={postatopt} onSelect={(selectedValue) => handleInputChange({ target: { name: "status", value: selectedValue } })} />
                </Fieldset>
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
                <Input id={`search-data-${pageid}`} radius="full" isLabeled={false} placeholder="Cari data ..." type="text" startContent={<Search />} />
              </DashboardTool>
              <DashboardTool>
                <Input id={`limit-data-${pageid}`} isLabeled={false} variant="select" noEmptyValue radius="full" placeholder="Baris per Halaman" value={limit} options={limitopt} onSelect={handleLimitChange} isReadonly />
              </DashboardTool>
            </DashboardToolbar>
            <DashboardBody>
              <Table isNoData></Table>
            </DashboardBody>
          </Fragment>
        );
      case "RESERVATION":
        return (
          <Fragment>
            <DashboardHead title={pagetitle} desc="Data Reservasi customer. Klik Tambah Baru untuk membuat data reservasi baru, atau klik ikon di kolom Action untuk memperbarui data." />
            <DashboardToolbar>
              <DashboardTool>
                <Input id={`search-data-${pageid}`} radius="full" isLabeled={false} placeholder="Cari data ..." type="text" value={reservSearch} onChange={(e) => handleReservSearch(e.target.value)} startContent={<Search />} />
                {level === "admin" && <Input id={`${pageid}-outlet`} isLabeled={false} variant="select" isSearchable radius="full" placeholder="Pilih Cabang" value={selectedBranch} options={allBranchData.map((branch) => ({ value: branch.idoutlet, label: branch.outlet_name.replace("E DENTAL - DOKTER GIGI", "CABANG") }))} onSelect={handleBranchChange} />}
              </DashboardTool>
              <DashboardTool>
                <Input id={`limit-data-${pageid}`} isLabeled={false} variant="select" noEmptyValue radius="full" placeholder="Baris per Halaman" value={limit} options={limitopt} onSelect={handleLimitChange} isReadonly={!isReservShown} />
                <Button id={`add-new-data-${pageid}`} radius="full" buttonText="Tambah" onClick={openForm} startContent={<Plus />} />
                <Button id={`export-data-${pageid}`} radius="full" bgColor="var(--color-green)" buttonText="Export" onClick={() => exportToExcel(filteredReservData, "Daftar Reservasi", `daftar_reservasi_${getCurrentDate()}`)} isDisabled={!isReservShown} startContent={<Export />} />
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
                    <TH>Catatan</TH>
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
                      <TD>{reservAlias(data.status_reservation)}</TD>
                      <TD>{paymentAlias(data.status_dp)}</TD>
                      <TD>{toTitleCase(data.service)}</TD>
                      <TD>{toTitleCase(data.typeservice)}</TD>
                      <TD>{newPrice(data.price_reservation)}</TD>
                      <TD type="code">{data.voucher}</TD>
                      <TD>{toTitleCase(data.outlet_name)}</TD>
                      <TD>{data.note}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </DashboardBody>
            {isReservShown && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />}
            {isFormOpen && (
              <SubmitForm size={selectedMode === "update" ? "sm" : "lg"} formTitle={selectedMode === "update" ? "Ubah Status Reservasi" : "Tambah Data Reservasi"} operation={selectedMode} fetching={isFormFetching} onSubmit={(e) => handleSubmit(e, "cudreservation")} loading={isSubmitting} onClose={closeForm}>
                {selectedMode === "update" ? (
                  <Fieldset>
                    <Input id={`${pageid}-reserv-status`} variant="select" noEmptyValue radius="full" labelText="Status Reservasi" placeholder="Set status" name="status" value={inputData.status} options={reservstatopt} onSelect={(selectedValue) => handleInputChange({ target: { name: "status", value: selectedValue } })} />
                    {inputData.statuspayment !== "1" && <Input id={`${pageid}-dp-status`} variant="select" noEmptyValue radius="full" labelText="Status DP" placeholder="Set status" name="statuspayment" value={inputData.statuspayment} options={paymentstatopt} onSelect={(selectedValue) => handleInputChange({ target: { name: "statuspayment", value: selectedValue } })} />}
                  </Fieldset>
                ) : (
                  <Fragment>
                    <Fieldset>
                      <Input id={`${pageid}-phone`} radius="full" labelText="Nomor Telepon" placeholder="0882xxx" type="tel" name="phone" value={inputData.phone} onChange={handleInputChange} infoContent={custExist ? "Customer sudah terdaftar. Nama dan Email otomatis terisi." : ""} errorContent={errors.phone} isRequired />
                      <Input id={`${pageid}-name`} radius="full" labelText="Nama Pelanggan" placeholder="e.g. John Doe" type="text" name="name" value={inputData.name} onChange={handleInputChange} errorContent={errors.name} isRequired isReadonly={custExist} />
                      <Input id={`${pageid}-email`} radius="full" labelText="Email" placeholder="customer@gmail.com" type="email" name="email" value={inputData.email} onChange={handleInputChange} errorContent={errors.email} isRequired isReadonly={custExist} />
                    </Fieldset>
                    <Fieldset>
                      <Input id={`${pageid}-service`} variant="select" isSearchable radius="full" labelText="Nama Layanan" placeholder="Pilih layanan" name="service" value={inputData.service} options={allservicedata.map((service) => ({ value: service["Nama Layanan"].servicename, label: service["Nama Layanan"].servicename }))} onSelect={(selectedValue) => handleInputChange({ target: { name: "service", value: selectedValue } })} errorContent={errors.service} isRequired />
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
                        onSelect={(selectedValue) => handleInputChange({ target: { name: "sub_service", value: selectedValue } })}
                        errorContent={errors.sub_service}
                        isRequired
                        isDisabled={!inputData.service}
                      />
                      <Input id={`${pageid}-voucher`} radius="full" labelText="Kode Voucher" placeholder="e.g 598RE3" type="text" name="vouchercode" value={inputData.vouchercode} onChange={handleInputChange} errorContent={errors.vouchercode} />
                    </Fieldset>
                    <Fieldset>
                      <Input id={`${pageid}-date`} radius="full" labelText="Tanggal Reservasi" placeholder="Atur tanggal" type="date" name="date" min={getCurrentDate()} value={inputData.date} onChange={handleInputChange} errorContent={errors.date} isRequired />
                      <Input id={`${pageid}-time`} variant="select" isSearchable radius="full" labelText="Jam Reservasi" placeholder={inputData.date ? "Pilih jadwal tersedia" : "Mohon pilih tanggal dahulu"} name="time" value={inputData.time} options={availHoursData.map((hour) => ({ value: hour, label: hour }))} onSelect={(selectedValue) => handleInputChange({ target: { name: "time", value: selectedValue } })} errorContent={errors.time} isRequired isDisabled={!inputData.date} />
                    </Fieldset>
                    <Input id={`${pageid}-note`} variant="textarea" labelText="Catatan" placeholder="Masukkan catatan/keterangan ..." name="note" rows={4} value={inputData.note} onChange={handleInputChange} errorContent={errors.note} />
                    {inputData.service === "RESERVATION" && inputData.sub_service === "RESERVATION" && (
                      <Fieldset>
                        <Input id={`${pageid}-price`} radius="full" labelText="Biaya Layanan" placeholder="Masukkan biaya layanan" type="number" name="price" value={inputData.price} onChange={handleInputChange} errorContent={errors.price} />
                        <Input id={`${pageid}-payments`} variant="select" isSearchable radius="full" labelText="Metode Pembayaran" placeholder="Pilih metode pembayaran" name="bank_code" value={inputData.bank_code} options={fvaListData.map((va) => ({ value: va.code, label: va.name }))} onSelect={(selectedValue) => handleInputChange({ target: { name: "bank_code", value: selectedValue } })} errorContent={errors.bank_code} />
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
          const opt = { margin: 0.2, filename: `invoice-${toPathname(selectedOrderData.transactionname)}-${selectedOrderData.rscode}.pdf`, image: { type: "jpeg", quality: 0.99 }, html2canvas: { scale: 2 }, jsPDF: { unit: "in", format: "letter", orientation: "portrait" } };
          html2pdf().from(element).set(opt).save();
        };

        const contactWhatsApp = (number) => {
          const wanumber = getNormalPhoneNumber(number);
          window.open(`https://wa.me/${wanumber}`, "_blank");
        };

        return (
          <Fragment>
            <DashboardHead title={pagetitle} desc="Data order customer ini dibuat otomatis saat proses reservasi dilakukan. Klik baris data untuk melihat masing-masing detail layanan & produk terpakai." />
            <DashboardToolbar>
              <DashboardTool>
                <Input id={`search-data-${pageid}`} radius="full" isLabeled={false} placeholder="Cari data ..." type="text" value={orderSearch} onChange={(e) => handleOrderSearch(e.target.value)} startContent={<Search />} />
                {level === "admin" && <Input id={`${pageid}-outlet`} isLabeled={false} variant="select" isSearchable radius="full" placeholder="Pilih Cabang" value={selectedBranch} options={allBranchData.map((branch) => ({ value: branch.idoutlet, label: branch.outlet_name.replace("E DENTAL - DOKTER GIGI", "CABANG") }))} onSelect={handleBranchChange} />}
              </DashboardTool>
              <DashboardTool>
                <Input id={`limit-data-${pageid}`} isLabeled={false} variant="select" noEmptyValue radius="full" placeholder="Baris per Halaman" value={limit} options={limitopt} onSelect={handleLimitChange} isReadonly={!isOrderShown} />
                <Button id={`export-data-${pageid}`} radius="full" bgColor="var(--color-green)" buttonText="Export" onClick={() => exportToExcel(filteredOrderData, "Daftar Order", `daftar_order_${getCurrentDate()}`)} isDisabled={!isOrderShown} startContent={<Export />} />
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
                      <TD>{orderAlias(data.transactionstatus)}</TD>
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
                <Fieldset>
                  <Input id={`${pageid}-dentist`} variant="select" isSearchable radius="full" labelText="Dokter" placeholder="Pilih Dokter" name="dentist" value={inputData.dentist} options={branchDentistData.map((dentist) => ({ value: dentist.name_dentist, label: dentist.name_dentist.replace(`${dentist.id_branch} -`, "") }))} onSelect={(selectedValue) => handleInputChange({ target: { name: "dentist", value: selectedValue } })} errorContent={errors.dentist} isRequired />
                  <Input id={`${pageid}-type-payments`} variant="select" noEmptyValue radius="full" labelText="Tipe Pembayaran" placeholder="Pilih tipe pembayaran" name="typepayment" value={inputData.typepayment} options={paymenttypeopt} onSelect={(selectedValue) => handleInputChange({ target: { name: "typepayment", value: selectedValue } })} errorContent={errors.typepayment} isRequired />
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
                          onSelect={(selectedValue) => handleInputChange({ target: { name: "bank_code", value: selectedValue } })}
                          errorContent={errors.bank_code}
                          isDisabled={!inputData.typepayment}
                        />
                      ) : (
                        <Input id={`${pageid}-status-payments`} variant="select" noEmptyValue radius="full" labelText="Status Pembayaran" placeholder={inputData.typepayment ? "Set status pembayaran" : "Mohon pilih tipe dahulu"} name="status" value={inputData.status} options={orderstatopt} onSelect={(selectedValue) => handleInputChange({ target: { name: "status", value: selectedValue } })} errorContent={errors.status} isDisabled={!inputData.typepayment} />
                      )}
                    </Fragment>
                  )}
                </Fieldset>
                {inputData.order.map((subservice, index) => (
                  <Fieldset key={index} type="row" markers={`${index + 1}.`} endContent={<Button id={`${pageid}-delete-row-${index}`} variant="dashed" subVariant="icon" isTooltip size="sm" radius="full" color={index <= 0 ? "var(--color-red-30)" : "var(--color-red)"} iconContent={<ISTrash />} tooltipText="Hapus" onClick={() => handleRmvRow("order", index)} isDisabled={index <= 0} />}>
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
                      onSelect={(selectedValue) => handleRowChange("order", index, { target: { name: "service", value: selectedValue } })}
                      errorContent={errors[`order.${index}.service`] ? errors[`order.${index}.service`] : ""}
                      isRequired
                      isReadonly={inputData.order[index].service === "RESERVATION"}
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
                      onSelect={(selectedValue) => handleRowChange("order", index, { target: { name: "servicetype", value: selectedValue } })}
                      errorContent={errors[`order.${index}.servicetype`] ? errors[`order.${index}.servicetype`] : ""}
                      isRequired
                      isDisabled={!inputData.order[index].service}
                      isReadonly={inputData.order[index].service === "RESERVATION"}
                    />
                    <Input id={`${pageid}-type-price-${index}`} radius="full" labelText="Atur Harga" placeholder="Masukkan harga" type="number" name="price" value={subservice.price} onChange={(e) => handleRowChange("order", index, e)} errorContent={errors[`order.${index}.price`] ? errors[`order.${index}.price`] : ""} isRequired isReadonly={inputData.order[index].service === "RESERVATION"} />
                  </Fieldset>
                ))}
                <Button id={`${pageid}-add-row`} variant="dashed" size="sm" radius="full" color="var(--color-hint)" buttonText="Tambah Layanan" onClick={() => handleAddRow("order")} />
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
            <DashboardHead title={pagetitle} desc="Daftar permintaan PO ke Pusat. Klik Tambah untuk membuat permintaan PO baru, atau review status permintaan PO terkini." />
            <DashboardToolbar>
              <DashboardTool>
                <Input id={`search-data-${pageid}`} radius="full" isLabeled={false} placeholder="Cari data ..." type="text" value={centralPOSearch} onChange={(e) => handleCentralPOSearch(e.target.value)} startContent={<Search />} />
              </DashboardTool>
              <DashboardTool>
                <Input id={`limit-data-${pageid}`} isLabeled={false} variant="select" noEmptyValue radius="full" placeholder="Baris per Halaman" value={limit} options={limitopt} onSelect={handleLimitChange} isReadonly={!isCentralPOShown} />
                <Button id={`add-new-data-${pageid}`} radius="full" buttonText="Tambah" onClick={openForm} startContent={<Plus />} />
              </DashboardTool>
            </DashboardToolbar>
            <TabGroup buttons={postatus} />
            <DashboardBody>
              <Table byNumber isExpandable isEditable={status === 2} page={currentPage} limit={limit} isNoData={!isCentralPOShown} isLoading={isFetching}>
                <THead>
                  <TR>
                    <TH isSorted onSort={() => handleSortDate(centralPOData, setCentralPOData, "PO Stock.postockcreate")}>
                      Tanggal Dibuat
                    </TH>
                    <TH>Kode PO</TH>
                    <TH>Nama Admin</TH>
                    <TH>Status PO</TH>
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
                              <Input id={`item-name-${index}-${idx}`} radius="full" labelText="Nama Item" value={subdata.itemname} isReadonly />
                              <Input id={`item-sku-${index}-${idx}`} radius="full" labelText="Kode SKU" value={subdata.sku} isReadonly />
                              <Input id={`item-qty-${index}-${idx}`} radius="full" labelText="Jumlah Item" value={subdata.qty} isReadonly />
                              <Input id={`item-note-${index}-${idx}`} variant="textarea" labelText="Keterangan" rows={4} value={subdata.note} fallbackValue="Tidak ada keterangan." isReadonly />
                            </Fieldset>
                          ))}
                        </Fragment>
                      }
                      onEdit={() => openEdit(data["PO Stock"].idpostock)}
                    >
                      <TD>{newDate(data["PO Stock"].postockcreate, "id")}</TD>
                      <TD type="code">{data["PO Stock"].postockcode}</TD>
                      <TD>{toTitleCase(data["PO Stock"].username)}</TD>
                      <TD>{poAlias(data["PO Stock"].statusstock)}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </DashboardBody>
            {isCentralPOShown && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />}
            {isFormOpen && (
              <Fragment>
                {selectedMode === "update" ? (
                  <SubmitForm size="sm" formTitle="Ubah Status PO Pusat" operation="update" fetching={isFormFetching} onSubmit={(e) => handleSubmit(e, "updatepostock")} loading={isSubmitting} onClose={closeForm}>
                    <Fieldset>
                      <Input id={`${pageid}-po-status`} variant="select" noEmptyValue radius="full" labelText="Status PO" placeholder="Set status" name="status" value={inputData.status} options={pocstatopt} onSelect={(selectedValue) => handleInputChange({ target: { name: "status", value: selectedValue } })} />
                    </Fieldset>
                  </SubmitForm>
                ) : (
                  <SubmitForm formTitle="Tambah Data PO Pusat" operation="add" fetching={isFormFetching} onSubmit={(e) => handleSubmit(e, "postock")} loading={isSubmitting} onClose={closeForm}>
                    {inputData.postock.map((po, index) => (
                      <Fieldset key={index} type="row" markers={`${index + 1}.`} endContent={<Button id={`${pageid}-delete-row-${index}`} variant="dashed" subVariant="icon" isTooltip size="sm" radius="full" color={index <= 0 ? "var(--color-red-30)" : "var(--color-red)"} iconContent={<ISTrash />} tooltipText="Hapus" onClick={() => handleRmvRow("postock", index)} isDisabled={index <= 0} />}>
                        <Input
                          id={`${pageid}-item-name-${index}`}
                          variant="select"
                          isSearchable
                          radius="full"
                          labelText="Nama Item"
                          placeholder="Pilih Item"
                          name="itemname"
                          value={po.itemname}
                          options={allStockData.map((item) => ({ value: item.itemname, label: item.itemname }))}
                          onSelect={(selectedValue) => handleRowChange("postock", index, { target: { name: "itemname", value: selectedValue } })}
                          errorContent={errors[`postock.${index}.itemname`] ? errors[`postock.${index}.itemname`] : ""}
                          isRequired
                        />
                        <Input id={`${pageid}-item-sku-${index}`} radius="full" labelText="SKU Item" placeholder="Masukkan SKU item" type="text" name="sku" value={po.sku} onChange={(e) => handleRowChange("postock", index, e)} errorContent={errors[`postock.${index}.sku`] ? errors[`postock.${index}.sku`] : ""} isRequired />
                        <Input id={`${pageid}-item-qty-${index}`} radius="full" labelText="Jumlah Item" placeholder="50" type="number" name="stockin" value={po.stockin} onChange={(e) => handleRowChange("postock", index, e)} errorContent={errors[`postock.${index}.stockin`] ? errors[`postock.${index}.stockin`] : ""} isRequired />
                        <Input id={`${pageid}-item-note-${index}`} variant="textarea" labelText="Catatan" placeholder="Masukkan catatan" name="note" rows={4} value={po.note} onChange={(e) => handleRowChange("postock", index, e)} errorContent={errors[`postock.${index}.note`] ? errors[`postock.${index}.note`] : ""} />
                      </Fieldset>
                    ))}
                    <Button id={`${pageid}-add-row`} variant="dashed" size="sm" radius="full" color="var(--color-hint)" buttonText="Tambah Item" onClick={() => handleAddRow("postock")} />
                  </SubmitForm>
                )}
              </Fragment>
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
              <DashboardTool>{level === "admin" && <Input id={`${pageid}-outlet`} isLabeled={false} variant="select" isSearchable radius="full" placeholder="Pilih Cabang" value={selectedBranch} options={allBranchData.map((branch) => ({ value: branch.idoutlet, label: branch.outlet_name.replace("E DENTAL - DOKTER GIGI", "CABANG") }))} onSelect={handleBranchChange} />}</DashboardTool>
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
            setInputData({ ...inputData, name: matchedData.username, address: matchedData.address, email: matchedData.useremail, phone: matchedData.userphone, gender: matchedData.gender, nik: matchedData.noktp, image: matchedData.imgktp, birth: matchedData.birthday });
          } else {
            setInputData({ name: "", address: "", email: "", phone: "", gender: "", nik: "", image: null, birth: "" });
          }
        };

        const subTabButton = (id) => {
          if (id === "1") {
            return subTab1Button;
          } else if (id === "2") {
            return subTab2Button;
          } else if (id === "3") {
            return subTab3Button;
          } else {
            return [];
          }
        };

        const handleAddError = () => showNotifications("warning", "Mohon pilih Customer terlebih dahulu.");
        const handleSubTabChange = (id) => setSubTabId(id);
        const handleTabChange = (id) => {
          setTabId(id);
          setSubTabId("1");
          subTabButton(id);
        };

        const tabbutton = [
          { label: "Informasi Pribadi", onClick: () => handleTabChange("1"), active: tabId === "1" },
          { label: "Catatan Klinik", onClick: () => handleTabChange("2"), active: tabId === "2" },
          { label: "Diagnosa & Tindakan", onClick: () => handleTabChange("3"), active: tabId === "3" },
          { label: "Resep", onClick: () => handleTabChange("4"), active: tabId === "4" },
        ];
        const subTab1Button = [
          { label: "Profil", onClick: () => handleSubTabChange("1"), active: subTabId === "1" },
          { label: "Histori Reservasi", onClick: () => handleSubTabChange("2"), active: subTabId === "2" },
          { label: "Histori Order", onClick: () => handleSubTabChange("3"), active: subTabId === "3" },
          { label: "Histori Rekam Medis", onClick: () => handleSubTabChange("4"), active: subTabId === "4" },
        ];
        const subTab2Button = [
          { label: "Anamesa", onClick: () => handleSubTabChange("1"), active: subTabId === "1" },
          { label: "Anamesa Odontogram", onClick: () => handleSubTabChange("2"), active: subTabId === "2" },
          { label: "Pemeriksaan Umum", onClick: () => handleSubTabChange("3"), active: subTabId === "3" },
          { label: "Foto Pasien", onClick: () => handleSubTabChange("4"), active: subTabId === "4" },
        ];
        const subTab3Button = [
          { label: "Kondisi", onClick: () => handleSubTabChange("1"), active: subTabId === "1" },
          { label: "Diagnosa", onClick: () => handleSubTabChange("2"), active: subTabId === "2" },
          { label: "Tindakan Medis", onClick: () => handleSubTabChange("3"), active: subTabId === "3" },
          { label: "Pemakaian Alkes", onClick: () => handleSubTabChange("4"), active: subTabId === "4" },
        ];

        const renderSection = () => {
          switch (tabId) {
            case "1":
              switch (subTabId) {
                case "1":
                  return (
                    <OnpageForm onSubmit={(e) => handleSubmit(e, "edituser")}>
                      <FormHead title="Informasi Pribadi" />
                      <Fieldset>
                        <Input id={`${pageid}-name`} radius="full" labelText="Nama Pelanggan" placeholder="e.g. John Doe" type="text" name="name" value={inputData.name} onChange={handleInputChange} errorContent={errors.name} isRequired />
                        <Input id={`${pageid}-phone`} radius="full" labelText="Nomor Telepon" placeholder="0882xxx" type="tel" name="phone" value={inputData.phone} onChange={handleInputChange} errorContent={errors.phone} isRequired />
                        <Input id={`${pageid}-email`} radius="full" labelText="Email" placeholder="customer@gmail.com" type="email" name="email" value={inputData.email} onChange={handleInputChange} errorContent={errors.email} isRequired />
                      </Fieldset>
                      <Fieldset>
                        <Input id={`${pageid}-address`} radius="full" labelText="Alamat" placeholder="123 Main Street" type="text" name="address" value={inputData.address} onChange={handleInputChange} errorContent={errors.address} isRequired />
                        <Input id={`${pageid}-gender`} variant="select" radius="full" labelText="Jenis Kelamin" placeholder="Pilih jenis kelamin" name="gender" value={inputData.gender} options={genderopt} onSelect={(selectedValue) => handleInputChange({ target: { name: "gender", value: selectedValue } })} errorContent={errors.gender} isRequired />
                        <Input id={`${pageid}-nik`} radius="full" labelText="Nomor KTP" placeholder="3271xxx" type="number" name="nik" value={inputData.nik} onChange={handleInputChange} errorContent={errors.nik} isRequired />
                        <Input id={`${pageid}-scanid`} variant="upload" accept="image/*" isPreview={false} radius="full" labelText="Scan KTP" name="image" initialFile={inputData.image} onSelect={handleImageSelect} />
                      </Fieldset>
                      <Fieldset>
                        <Input id={`${pageid}-birth`} radius="full" labelText="Tanggal Lahir" type="date" name="birth" value={inputData.birth} onChange={handleInputChange} errorContent={errors.birth} isRequired />
                        <Input id={`${pageid}-ageyear`} radius="full" labelText="Umur (tahun)" placeholder="24" fallbackValue="24" type="number" name="ageyear" value={inputData.ageyear} isReadonly />
                        <Input id={`${pageid}-agemonth`} radius="full" labelText="Umur (bulan)" placeholder="5" fallbackValue="5" type="number" name="agemonth" value={inputData.agemonth} isReadonly />
                        <Input id={`${pageid}-ageday`} radius="full" labelText="Umur (hari)" placeholder="10" fallbackValue="10" type="number" name="ageday" value={inputData.ageday} isReadonly />
                      </Fieldset>
                      <FormHead title="Layanan Klinik" />
                      <Fieldset>
                        <Input id={`${pageid}-service`} variant="select" isSearchable radius="full" labelText="Nama Layanan" placeholder="Pilih layanan" name="service" value={inputData.service} options={allservicedata.map((service) => ({ value: service["Nama Layanan"].servicename, label: service["Nama Layanan"].servicename })) || []} onSelect={(selectedValue) => handleInputChange({ target: { name: "service", value: selectedValue } })} errorContent={errors.service} isRequired />
                        <Input
                          id={`${pageid}-subservice`}
                          variant="select"
                          isSearchable
                          radius="full"
                          labelText="Jenis Layanan"
                          placeholder={inputData.service ? "Pilih jenis layanan" : "Mohon pilih layanan dahulu"}
                          name="sub_service"
                          value={inputData.sub_service}
                          options={(inputData.service && allservicedata.find((s) => s["Nama Layanan"].servicename === inputData.service)?.["Jenis Layanan"].map((type) => ({ value: type.servicetypename, label: type.servicetypename }))) || []}
                          onSelect={(selectedValue) => handleInputChange({ target: { name: "sub_service", value: selectedValue } })}
                          errorContent={errors.sub_service}
                          isRequired
                          isDisabled={!inputData.service}
                        />
                        <Input id={`${pageid}-room`} radius="full" labelText="Ruang Pemeriksaan" placeholder="Poli Gigi" type="text" name="room" value={inputData.room} onChange={handleInputChange} errorContent={errors.room} isRequired />
                        <Input id={`${pageid}-dentist`} variant="select" isSearchable radius="full" labelText="Dokter Pemeriksa" placeholder="Pilih Dokter" name="dentist" value={inputData.dentist} options={branchDentistData.map((dentist) => ({ value: dentist.name_dentist, label: dentist.name_dentist.replace(`${dentist.id_branch} -`, "") }))} onSelect={(selectedValue) => handleInputChange({ target: { name: "dentist", value: selectedValue } })} errorContent={errors.dentist} isRequired />
                      </Fieldset>
                      <FormFooter>
                        <Button id={`add-new-data-${pageid}`} type="submit" action="onpage" radius="full" buttonText="Simpan Perubahan" isLoading={isSubmitting} startContent={<Check />} loadingContent={<LoadingContent />} />
                      </FormFooter>
                    </OnpageForm>
                  );
                case "2":
                  return (
                    <Table byNumber isNoData={historyReservData.length > 0 ? false : true || selectedCust === null || selectedCust === ""} isLoading={isFetching}>
                      <THead>
                        <TR>
                          <TH isSorted onSort={() => handleSortDate(historyReservData, setHistoryReservData, "datetimecreate")}>
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
                          <TH isSorted onSort={() => handleSortDate(historyOrderData, setHistoryOrderData, "transactioncreate")}>
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
                  return (
                    <Table byNumber isNoData={medicRcdData.length > 0 ? false : true || selectedCust === null || selectedCust === ""} isLoading={isFetching}>
                      <THead>
                        <TR>
                          <TH>ID Rekam Medis</TH>
                          <TH>Usia Pasien</TH>
                          <TH>Ruang Pemeriksaan</TH>
                          <TH>Layanan</TH>
                          <TH>Jenis Layanan</TH>
                          <TH>Dokter Pemeriksa</TH>
                        </TR>
                      </THead>
                      <TBody>
                        {medicRcdData.map((data, index) => (
                          <TR key={index}>
                            <TD type="number">{data.idmedicalrecords}</TD>
                            <TD>{`${data.ageyear} tahun, ${data.agemonth} bulan, ${data.ageday} hari`}</TD>
                            <TD>{toTitleCase(data.room)}</TD>
                            <TD>{toTitleCase(data.service)}</TD>
                            <TD>{toTitleCase(data.servicetype)}</TD>
                            <TD>{toTitleCase(data.dentist)}</TD>
                          </TR>
                        ))}
                      </TBody>
                    </Table>
                  );
                default:
                  return <Table isNoData={true}></Table>;
              }
            case "2":
              switch (subTabId) {
                case "1":
                  const renderAllergies = (alergi) => {
                    const alergidata = JSON.parse(alergi);
                    return `${alergidata.alergi} - ${alergidata.note}`;
                  };

                  return (
                    <Fragment>
                      <Table byNumber isNoData={anamesaData.length > 0 ? false : true || selectedCust === null || selectedCust === ""} isLoading={isFetching}>
                        <THead>
                          <TR>
                            <TH>ID Rekam Medis</TH>
                            <TH>Riwayat Penyakit</TH>
                            <TH>Keluhan Utama</TH>
                            <TH>Keluhan Tambahan</TH>
                            <TH>Penyakit Saat Ini</TH>
                            <TH>Gravida</TH>
                            <TH>Alergi Gatal</TH>
                            <TH>Alergi Debu</TH>
                            <TH>Alergi Obat</TH>
                            <TH>Alergi Makanan</TH>
                            <TH>Alergi Lainnya</TH>
                          </TR>
                        </THead>
                        <TBody>
                          {anamesaData.map((data, index) => (
                            <TR key={index}>
                              <TD type="number">{data.idmedicalrecords}</TD>
                              <TD>{data.histori_illness}</TD>
                              <TD>{data.main_complaint}</TD>
                              <TD>{data.additional_complaint}</TD>
                              <TD>{data.current_illness}</TD>
                              <TD>{data.gravida}</TD>
                              <TD>{renderAllergies(data.alergi_gatal)}</TD>
                              <TD>{renderAllergies(data.alergi_debu)}</TD>
                              <TD>{renderAllergies(data.alergi_obat)}</TD>
                              <TD>{renderAllergies(data.alergi_makanan)}</TD>
                              <TD>{renderAllergies(data.alergi_lainnya)}</TD>
                            </TR>
                          ))}
                        </TBody>
                      </Table>
                      {isFormOpen && (
                        <SubmitForm formTitle={selectedMode === "update" ? "Perbarui Data Anamesa" : "Tambah Data Anamesa"} operation={selectedMode} fetching={isFormFetching} onSubmit={(e) => handleSubmit(e, "cudanamnesa")} loading={isSubmitting} onClose={closeForm}>
                          <Fieldset>
                            <Input id={`${pageid}-history-illines`} radius="full" labelText="Riwayat Penyakit" placeholder="Tulis riwayat penyakit" type="text" name="histori_illness" value={inputData.histori_illness} onChange={handleInputChange} errorContent={errors.histori_illness} isRequired />
                            <Input id={`${pageid}-current-illines`} radius="full" labelText="Penyakit Saat Ini" placeholder="Tulis penyakit saat ini" type="text" name="current_illness" value={inputData.current_illness} onChange={handleInputChange} errorContent={errors.current_illness} isRequired />
                            <Input id={`${pageid}-gravida`} radius="full" labelText="Gravida" placeholder="Tulis gravida" type="text" name="gravida" value={inputData.gravida} onChange={handleInputChange} errorContent={errors.gravida} isRequired />
                          </Fieldset>
                          <Fieldset>
                            <Input id={`${pageid}-complaint`} variant="textarea" rows={4} labelText="Keluhan Utama" placeholder="Tulis keluhan utama" name="main_complaint" value={inputData.main_complaint} onChange={handleInputChange} errorContent={errors.main_complaint} isRequired />
                            <Input id={`${pageid}-addt-complaint`} variant="textarea" rows={4} labelText="Keluhan Tambahan" placeholder="Tulis keluhan tambahan" name="additional_complaint" value={inputData.additional_complaint} onChange={handleInputChange} errorContent={errors.additional_complaint} isRequired />
                          </Fieldset>
                          <Fieldset>
                            <Input id={`${pageid}-allergi-gatal`} variant="textarea" rows={3} labelText="Alergi Gatal" placeholder="Masukkan catatan alergi" name="alergi_gatal" value={JSON.parse(inputData.alergi_gatal).note} onChange={(e) => setInputData((prevState) => ({ ...prevState, alergi_gatal: JSON.stringify({ alergi: "gatal", note: e.target.value }) }))} />
                            <Input id={`${pageid}-allergi-debu`} variant="textarea" rows={3} labelText="Alergi Debu" placeholder="Masukkan catatan alergi" name="alergi_debu" value={JSON.parse(inputData.alergi_debu).note} onChange={(e) => setInputData((prevState) => ({ ...prevState, alergi_debu: JSON.stringify({ alergi: "debu", note: e.target.value }) }))} />
                          </Fieldset>
                          <Fieldset>
                            <Input id={`${pageid}-allergi-obat`} variant="textarea" rows={3} labelText="Alergi Obat" placeholder="Masukkan catatan alergi" name="alergi_obat" value={JSON.parse(inputData.alergi_obat).note} onChange={(e) => setInputData((prevState) => ({ ...prevState, alergi_obat: JSON.stringify({ alergi: "obat", note: e.target.value }) }))} />
                            <Input id={`${pageid}-allergi-makanan`} variant="textarea" rows={3} labelText="Alergi Makanan" placeholder="Masukkan catatan alergi" name="alergi_makanan" value={JSON.parse(inputData.alergi_makanan).note} onChange={(e) => setInputData((prevState) => ({ ...prevState, alergi_makanan: JSON.stringify({ alergi: "makanan", note: e.target.value }) }))} />
                          </Fieldset>
                          <Input id={`${pageid}-allergi-lainnya`} variant="textarea" rows={3} labelText="Alergi Lainnya" placeholder="Masukkan catatan alergi" name="alergi_lainnya" value={JSON.parse(inputData.alergi_lainnya).note} onChange={(e) => setInputData((prevState) => ({ ...prevState, alergi_lainnya: JSON.stringify({ alergi: "lainnya", note: e.target.value }) }))} />
                        </SubmitForm>
                      )}
                    </Fragment>
                  );
                case "2":
                  return (
                    <Fragment>
                      <Table byNumber isNoData={odontogramData.length > 0 ? false : true || selectedCust === null || selectedCust === ""} isLoading={isFetching}>
                        <THead>
                          <TR>
                            <TH>ID Rekam Medis</TH>
                            <TH>Occlusi</TH>
                            <TH>Torus Platinus</TH>
                            <TH>Torus Mandibularis</TH>
                            <TH>Palatum</TH>
                            <TH>Diastema</TH>
                            <TH>Gigi Anomali</TH>
                            <TH>Lain-lain</TH>
                          </TR>
                        </THead>
                        <TBody>
                          {odontogramData.map((data, index) => (
                            <TR key={index}>
                              <TD type="number">{data.idmedicalrecords}</TD>
                              <TD>{data.occlusi}</TD>
                              <TD>{data.palatinus}</TD>
                              <TD>{data.mandibularis}</TD>
                              <TD>{data.palatum}</TD>
                              <TD>{data.diastema}</TD>
                              <TD>{data.anomali}</TD>
                              <TD>{data.other}</TD>
                            </TR>
                          ))}
                        </TBody>
                      </Table>
                      {isFormOpen && (
                        <SubmitForm formTitle={selectedMode === "update" ? "Perbarui Data Odontogram" : "Tambah Data Odontogram"} operation={selectedMode} fetching={isFormFetching} onSubmit={(e) => handleSubmit(e, "cudodontogram")} loading={isSubmitting} onClose={closeForm}>
                          <Fieldset>
                            <Input id={`${pageid}-occlusi`} radius="full" labelText="Occlusi" placeholder="Masukkan occlusi" type="text" name="occlusi" value={inputData.occlusi} onChange={handleInputChange} errorContent={errors.occlusi} isRequired />
                            <Input id={`${pageid}-palatinus`} radius="full" labelText="Torus Platinus" placeholder="Masukkan torus platinus" type="text" name="palatinus" value={inputData.palatinus} onChange={handleInputChange} errorContent={errors.palatinus} isRequired />
                            <Input id={`${pageid}-mandibularis`} radius="full" labelText="Torus Mandibularis" placeholder="Masukkan torus mandibularis" type="text" name="mandibularis" value={inputData.mandibularis} onChange={handleInputChange} errorContent={errors.mandibularis} isRequired />
                          </Fieldset>
                          <Fieldset>
                            <Input id={`${pageid}-palatum`} radius="full" labelText="Palatum" placeholder="Masukkan palatum" type="text" name="palatum" value={inputData.palatum} onChange={handleInputChange} errorContent={errors.palatum} isRequired />
                            <Input id={`${pageid}-diastema`} radius="full" labelText="Diastema" placeholder="Nasukkan diastema" type="text" name="diastema" value={inputData.diastema} onChange={handleInputChange} errorContent={errors.diastema} isRequired />
                            <Input id={`${pageid}-anomali`} radius="full" labelText="Gigi Anomali" placeholder="Masukkan gigi anomali" type="text" name="anomali" value={inputData.anomali} onChange={handleInputChange} errorContent={errors.anomali} isRequired />
                          </Fieldset>
                          <Input id={`${pageid}-other`} radius="full" labelText="Lain-lain" placeholder="Masukkan odontogram lainnya" type="text" name="other_odontogram" value={inputData.other_odontogram} onChange={handleInputChange} />
                        </SubmitForm>
                      )}
                    </Fragment>
                  );
                case "3":
                  return (
                    <Fragment>
                      <Table byNumber isNoData={inspectData.length > 0 ? false : true || selectedCust === null || selectedCust === ""} isLoading={isFetching}>
                        <THead>
                          <TR>
                            <TH>ID Rekam Medis</TH>
                            <TH>Deskripsi Pemeriksaan</TH>
                            <TH>Nadi</TH>
                            <TH>Tensi Darah</TH>
                            <TH>Suhu Badan</TH>
                            <TH>Berat Badan</TH>
                            <TH>Tinggi Badan</TH>
                            <TH>Pernapasan</TH>
                            <TH>Mata</TH>
                            <TH>Gigi & Mulut</TH>
                            <TH>Kulit</TH>
                          </TR>
                        </THead>
                        <TBody>
                          {inspectData.map((data, index) => (
                            <TR key={index}>
                              <TD type="number">{data.idmedicalrecords}</TD>
                              <TD>{data.desciption}</TD>
                              <TD>{data.pulse}</TD>
                              <TD>{data.tension}</TD>
                              <TD>{data.temperature}</TD>
                              <TD>{data.weight}</TD>
                              <TD>{data.height}</TD>
                              <TD>{data.breath}</TD>
                              <TD>{data.eye}</TD>
                              <TD>{data.mouth}</TD>
                              <TD>{data.skin}</TD>
                            </TR>
                          ))}
                        </TBody>
                      </Table>
                      {isFormOpen && (
                        <SubmitForm formTitle={selectedMode === "update" ? "Perbarui Data Pemeriksaan" : "Tambah Data Pemeriksaan"} operation={selectedMode} fetching={isFormFetching} onSubmit={(e) => handleSubmit(e, "cudinspection")} loading={isSubmitting} onClose={closeForm}>
                          <Input id={`${pageid}-desc`} radius="full" labelText="Deskripsi Pemeriksaan" placeholder="Tulis deskripsi pemeriksaan" type="text" name="desc" value={inputData.desc} onChange={handleInputChange} errorContent={errors.desc} isRequired />
                          <Fieldset>
                            <Input id={`${pageid}-nadi`} radius="full" labelText="Nadi" placeholder="Tulis hasil pemeriksaan nadi" type="text" name="nadi" value={inputData.nadi} onChange={handleInputChange} errorContent={errors.nadi} isRequired />
                            <Input id={`${pageid}-tensi`} radius="full" labelText="Tensi Darah" placeholder="Tulis tensi darah" type="text" name="tensi" value={inputData.tensi} onChange={handleInputChange} errorContent={errors.tensi} isRequired />
                            <Input id={`${pageid}-suhu`} radius="full" labelText="Suhu Badan" placeholder="Tulis suhu badan" type="text" name="suhu" value={inputData.suhu} onChange={handleInputChange} errorContent={errors.suhu} isRequired />
                          </Fieldset>
                          <Fieldset>
                            <Input id={`${pageid}-berat_badan`} radius="full" labelText="Berat Badan (kg)" placeholder="Tulis berat badan" type="number" name="berat_badan" value={inputData.berat_badan} onChange={handleInputChange} errorContent={errors.berat_badan} isRequired />
                            <Input id={`${pageid}-tinggi_badan`} radius="full" labelText="Tinggi Badan (cm)" placeholder="Tulis tinggi badan" type="number" name="tinggi_badan" value={inputData.tinggi_badan} onChange={handleInputChange} errorContent={errors.tinggi_badan} isRequired />
                            <Input id={`${pageid}-pernapasan`} radius="full" labelText="Pernapasan" placeholder="Tulis hasil pemeriksaan pernapasan" type="text" name="pernapasan" value={inputData.pernapasan} onChange={handleInputChange} errorContent={errors.pernapasan} isRequired />
                          </Fieldset>
                          <Fieldset>
                            <Input id={`${pageid}-mata`} radius="full" labelText="Mata" placeholder="Tulis hasil pemeriksaan mata" type="text" name="mata" value={inputData.mata} onChange={handleInputChange} errorContent={errors.mata} isRequired />
                            <Input id={`${pageid}-mulut_gigi`} radius="full" labelText="Mulut & Gigi" placeholder="Tulis hasil pemeriksaan mulut & gigi" type="text" name="mulut_gigi" value={inputData.mulut_gigi} onChange={handleInputChange} errorContent={errors.mulut_gigi} isRequired />
                            <Input id={`${pageid}-kulit`} radius="full" labelText="Kulit" placeholder="Tulis hasil pemeriksaan kulit" type="text" name="kulit" value={inputData.kulit} onChange={handleInputChange} errorContent={errors.kulit} isRequired />
                          </Fieldset>
                        </SubmitForm>
                      )}
                    </Fragment>
                  );
                case "4":
                  return (
                    <Fragment>
                      <Grid>
                        {photoMedic.map((photo) => (
                          <GridItem key={photo.idmedicalrecords} type="img" label={photo.idmedicalrecords} src={photo.photo} />
                        ))}
                      </Grid>
                      {isFormOpen && (
                        <SubmitForm size="sm" formTitle="Tambah Foto Pasien" operation="add" fetching={isFormFetching} onSubmit={(e) => handleSubmit(e, "cudphoto")} loading={isSubmitting} onClose={closeForm}>
                          <Input id={`${pageid}-medic-photo`} variant="upload" isPreview isLabeled={false} onSelect={handleImageSelect} />
                        </SubmitForm>
                      )}
                    </Fragment>
                  );
                default:
                  return <Table isNoData={true}></Table>;
              }
            case "3":
              switch (subTabId) {
                case "3":
                  return (
                    <Fragment>
                      <Table byNumber isEditable isNoData={historyOrderData.length > 0 ? false : true || selectedCust === null || selectedCust === ""} isLoading={isFetching}>
                        <THead>
                          <TR>
                            <TH isSorted onSort={() => handleSortDate(historyOrderData, setHistoryOrderData, "transactioncreate")}>
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
                          </TR>
                        </THead>
                        <TBody>
                          {historyOrderData.map((data, index) => (
                            <TR key={index} onEdit={data.transactionstatus === "1" ? () => {} : () => openEdit(data.idtransaction)}>
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
                      {isFormOpen && (
                        <Fragment>
                          {selectedMode === "update" ? (
                            <SubmitForm formTitle="Perbarui Data Order" operation="update" fetching={isFormFetching} onSubmit={(e) => handleSubmit(e, "cudorder")} loading={isSubmitting} onClose={closeForm}>
                              <Fieldset>
                                <Input id={`${pageid}-name`} radius="full" labelText="Nama Pelanggan" placeholder="e.g. John Doe" type="text" name="name" value={inputData.name} onChange={handleInputChange} errorContent={errors.name} isRequired />
                                <Input id={`${pageid}-phone`} radius="full" labelText="Nomor Telepon" placeholder="0882xxx" type="tel" name="phone" value={inputData.phone} onChange={handleInputChange} errorContent={errors.phone} isRequired />
                              </Fieldset>
                              <Fieldset>
                                <Input id={`${pageid}-dentist`} variant="select" isSearchable radius="full" labelText="Dokter" placeholder="Pilih Dokter" name="dentist" value={inputData.dentist} options={branchDentistData.map((dentist) => ({ value: dentist.name_dentist, label: dentist.name_dentist.replace(`${dentist.id_branch} -`, "") }))} onSelect={(selectedValue) => handleInputChange({ target: { name: "dentist", value: selectedValue } })} errorContent={errors.dentist} isRequired />
                                <Input id={`${pageid}-type-payments`} variant="select" noEmptyValue radius="full" labelText="Tipe Pembayaran" placeholder="Pilih tipe pembayaran" name="typepayment" value={inputData.typepayment} options={paymenttypeopt} onSelect={(selectedValue) => handleInputChange({ target: { name: "typepayment", value: selectedValue } })} errorContent={errors.typepayment} isRequired />
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
                                        onSelect={(selectedValue) => handleInputChange({ target: { name: "bank_code", value: selectedValue } })}
                                        errorContent={errors.bank_code}
                                        isDisabled={!inputData.typepayment}
                                      />
                                    ) : (
                                      <Input id={`${pageid}-status-payments`} variant="select" noEmptyValue radius="full" labelText="Status Pembayaran" placeholder={inputData.typepayment ? "Set status pembayaran" : "Mohon pilih tipe dahulu"} name="status" value={inputData.status} options={orderstatopt} onSelect={(selectedValue) => handleInputChange({ target: { name: "status", value: selectedValue } })} errorContent={errors.status} isDisabled={!inputData.typepayment} />
                                    )}
                                  </Fragment>
                                )}
                              </Fieldset>
                              {inputData.order.map((subservice, index) => (
                                <Fieldset key={index} type="row" markers={`${index + 1}.`} endContent={<Button id={`${pageid}-delete-row-${index}`} variant="dashed" subVariant="icon" isTooltip size="sm" radius="full" color={index <= 0 ? "var(--color-red-30)" : "var(--color-red)"} iconContent={<ISTrash />} tooltipText="Hapus" onClick={() => handleRmvRow("order", index)} isDisabled={index <= 0} />}>
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
                                    onSelect={(selectedValue) => handleRowChange("order", index, { target: { name: "service", value: selectedValue } })}
                                    errorContent={errors[`order.${index}.service`] ? errors[`order.${index}.service`] : ""}
                                    isRequired
                                    isReadonly={inputData.order[index].service === "RESERVATION"}
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
                                    onSelect={(selectedValue) => handleRowChange("order", index, { target: { name: "servicetype", value: selectedValue } })}
                                    errorContent={errors[`order.${index}.servicetype`] ? errors[`order.${index}.servicetype`] : ""}
                                    isRequired
                                    isDisabled={!inputData.order[index].service}
                                    isReadonly={inputData.order[index].service === "RESERVATION"}
                                  />
                                  <Input id={`${pageid}-type-price-${index}`} radius="full" labelText="Atur Harga" placeholder="Masukkan harga" type="number" name="price" value={subservice.price} onChange={(e) => handleRowChange("order", index, e)} errorContent={errors[`order.${index}.price`] ? errors[`order.${index}.price`] : ""} isRequired isReadonly={inputData.order[index].service === "RESERVATION"} />
                                </Fieldset>
                              ))}
                              <Button id={`${pageid}-add-row`} variant="dashed" size="sm" radius="full" color="var(--color-hint)" buttonText="Tambah Layanan" onClick={() => handleAddRow("order")} />
                            </SubmitForm>
                          ) : (
                            <SubmitForm size="sm" formTitle="Tambah Tindakan Medis" operation="add" fetching={isFormFetching} onSubmit={(e) => handleSubmit(e, "addmedis")} loading={isSubmitting} onClose={closeForm}>
                              <Input id={`${pageid}-rscode`} variant="select" isSearchable radius="full" labelText="Kode Reservasi" placeholder="Pilih kode reservasi" name="rscode" value={inputData.rscode} options={rscodeData.map((rscode) => ({ value: rscode.rscode, label: rscode.rscode })) || []} onSelect={(selectedValue) => handleInputChange({ target: { name: "rscode", value: selectedValue } })} errorContent={errors.rscode} isRequired />
                            </SubmitForm>
                          )}
                        </Fragment>
                      )}
                    </Fragment>
                  );
                case "4":
                  return (
                    <Fragment>
                      <Table byNumber isNoData={alkesData.length > 0 ? false : true || selectedCust === null || selectedCust === ""} isLoading={isFetching}>
                        <THead>
                          <TR>
                            <TH isSorted onSort={() => handleSortDate(alkesData, setAlkesData, "stockoutcreate")}>
                              Tanggal Dibuat
                            </TH>
                            <TH>Kategori</TH>
                            <TH>Sub Kategori</TH>
                            <TH>Kode SKU</TH>
                            <TH>Nama Item</TH>
                            <TH>Unit</TH>
                            <TH>Stok Akhir</TH>
                            <Fragment>
                              {level === "admin" && (
                                <Fragment>
                                  <TH>Harga</TH>
                                  <TH>Total Nilai</TH>
                                </Fragment>
                              )}
                            </Fragment>
                            <TH>Nama Cabang</TH>
                          </TR>
                        </THead>
                        <TBody>
                          {alkesData.map((data, index) => (
                            <TR key={index}>
                              <TD>{newDate(data.stockoutcreate, "id")}</TD>
                              <TD>{toTitleCase(data.categorystock)}</TD>
                              <TD>{toTitleCase(data.subcategorystock)}</TD>
                              <TD type="code">{data.sku}</TD>
                              <TD>{toTitleCase(data.itemname)}</TD>
                              <TD>{data.unit}</TD>
                              <TD type="number">{data.lastqty}</TD>
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
                      {isFormOpen && (
                        <SubmitForm formTitle="Tambah Data Pemakaian Alkes" operation="add" fetching={isFormFetching} onSubmit={(e) => handleSubmit(e, "addstockout")} loading={isSubmitting} onClose={closeForm}>
                          <Input id={`${pageid}-rscode`} variant="select" isSearchable radius="full" labelText="Kode Reservasi" placeholder="Pilih kode reservasi" name="rscode" value={inputData.rscode} options={rscodeData.map((rscode) => ({ value: rscode.rscode, label: rscode.rscode })) || []} onSelect={(selectedValue) => handleInputChange({ target: { name: "rscode", value: selectedValue } })} errorContent={errors.rscode} isRequired />
                          {inputData.alkesitem.map((alkes, index) => (
                            <Fieldset key={index} type="row" markers={`${index + 1}.`} endContent={<Button id={`${pageid}-delete-row-${index}`} variant="dashed" subVariant="icon" isTooltip size="sm" radius="full" color={index <= 0 ? "var(--color-red-30)" : "var(--color-red)"} iconContent={<ISTrash />} tooltipText="Hapus" onClick={() => handleRmvRow("alkesitem", index)} isDisabled={index <= 0} />}>
                              <Input
                                id={`${pageid}-categorystock-${index}`}
                                variant="select"
                                isSearchable
                                radius="full"
                                labelText="Kategori"
                                placeholder={inputData.rscode ? "Pilih kategori" : "Mohon isi kode reservasi dahulu"}
                                name="categorystock"
                                value={alkes.categorystock}
                                options={categoryStockData.map((cat) => ({ value: cat["category_stok"].categorystockname, label: cat["category_stok"].categorystockname }))}
                                onSelect={(selectedValue) => handleRowChange("alkesitem", index, { target: { name: "categorystock", value: selectedValue } })}
                                errorContent={errors[`alkesitem.${index}.categorystock`] ? errors[`alkesitem.${index}.categorystock`] : ""}
                                isRequired
                                isDisabled={!inputData.rscode}
                              />
                              <Input
                                id={`${pageid}-subcategorystock-${index}`}
                                variant="select"
                                isSearchable
                                radius="full"
                                labelText="Sub Kategori"
                                placeholder={alkes.categorystock ? "Pilih sub kategori" : "Mohon pilih kategori dahulu"}
                                name="subcategorystock"
                                value={alkes.subcategorystock}
                                options={alkes.categorystock && categoryStockData.find((cat) => cat["category_stok"].categorystockname === alkes.categorystock)?.["subcategory_stok"].map((sub) => ({ value: sub.subcategorystock, label: sub.subcategorystock }))}
                                onSelect={(selectedValue) => handleRowChange("alkesitem", index, { target: { name: "subcategorystock", value: selectedValue } })}
                                errorContent={errors[`alkesitem.${index}.subcategorystock`] ? errors[`alkesitem.${index}.subcategorystock`] : ""}
                                isRequired
                                isDisabled={!alkes.categorystock}
                              />
                              <Input
                                id={`${pageid}-item-name-${index}`}
                                variant="select"
                                isSearchable
                                radius="full"
                                labelText="Nama Item"
                                placeholder="Pilih Item"
                                name="itemname"
                                value={alkes.itemname}
                                options={alkes.subcategorystock && allStockData.filter((sub) => sub.subcategorystock === alkes.subcategorystock).map((item) => ({ value: item.itemname, label: item.itemname }))}
                                onSelect={(selectedValue) => handleRowChange("alkesitem", index, { target: { name: "itemname", value: selectedValue } })}
                                errorContent={errors[`alkesitem.${index}.itemname`] ? errors[`alkesitem.${index}.itemname`] : ""}
                                isRequired
                                isDisabled={!alkes.subcategorystock}
                              />
                              <Input id={`${pageid}-item-unit-${index}`} radius="full" labelText="Unit Item" placeholder="PCS" type="text" name="unit" value={alkes.unit} onChange={(e) => handleRowChange("alkesitem", index, e)} errorContent={errors[`alkesitem.${index}.unit`] ? errors[`alkesitem.${index}.unit`] : ""} isRequired isDisabled={!alkes.itemname} />
                              <Input id={`${pageid}-item-qty-${index}`} radius="full" labelText="Jumlah Item" placeholder="50" type="number" name="qty" value={alkes.qty} onChange={(e) => handleRowChange("alkesitem", index, e)} errorContent={errors[`alkesitem.${index}.qty`] ? errors[`alkesitem.${index}.qty`] : ""} isRequired isDisabled={!alkes.itemname} />
                              <Input id={`${pageid}-item-status-${index}`} radius="full" labelText="Status Item" placeholder="Barang habis pakai" type="text" name="status" value={alkes.status} onChange={(e) => handleRowChange("alkesitem", index, e)} errorContent={errors[`alkesitem.${index}.status`] ? errors[`alkesitem.${index}.status`] : ""} isRequired isDisabled={!alkes.itemname} />
                            </Fieldset>
                          ))}
                          <Button id={`${pageid}-add-row`} variant="dashed" size="sm" radius="full" color="var(--color-hint)" buttonText="Tambah Item" onClick={() => handleAddRow("alkesitem")} />
                        </SubmitForm>
                      )}
                    </Fragment>
                  );
                default:
                  return <Table isNoData={true}></Table>;
              }
            default:
              return <Table isNoData={true}></Table>;
          }
        };

        const addtCustData = [{ idauthuser: "", username: "Tambah Baru" }];
        const mergedCustData = [...addtCustData, ...allCustData];

        const disableButton = () => {
          if (tabId === "3") {
            if (subTabId === "3" || subTabId === "4") {
              return false;
            } else {
              return true;
            }
          } else if (tabId === "4") {
            return true;
          } else {
            return false;
          }
        };

        return (
          <Fragment>
            <DashboardHead title={pagetitle} desc="Panel untuk memperbarui profil data dan menambah histori catatan medis pasien." />
            <DashboardToolbar>
              <DashboardTool>
                <Input id={`cust-select-${pageid}`} isLabeled={false} variant="select" isSearchable radius="full" placeholder="Pilih Customer" name="id" options={mergedCustData.map((cust) => ({ value: cust.idauthuser, label: toTitleCase(cust.username) }))} onSelect={handleCustChange} />
              </DashboardTool>
              {tabId !== "1" && (
                <DashboardTool>
                  <Button id={`add-new-data-${pageid}`} radius="full" buttonText="Tambah" onClick={selectedCust ? openForm : handleAddError} startContent={<Plus />} isDisabled={disableButton()} />
                </DashboardTool>
              )}
            </DashboardToolbar>
            <TabSwitch buttons={tabbutton} />
            {tabId !== "4" && <TabGroup buttons={subTabButton(tabId)} />}
            <DashboardBody>{renderSection()}</DashboardBody>
          </Fragment>
        );
      default:
        return <DashboardHead title={`Halaman Dashboard ${pagetitle} akan segera hadir.`} />;
    }
  };

  useEffect(() => {
    if (inputData.birth) {
      const birthDate = moment(inputData.birth).tz("Asia/Jakarta");
      const today = moment().tz("Asia/Jakarta");
      const years = today.diff(birthDate, "years", true);
      const months = today.diff(birthDate, "months") % 12;
      const days = today.diff(birthDate, "days") % 30;
      setInputData({ ...inputData, ageyear: Math.floor(years), agemonth: months, ageday: days });
    } else {
      setInputData({ ...inputData, ageyear: "", agemonth: "", ageday: "" });
    }
  }, [inputData.birth]);

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
    if (slug !== "REKAM MEDIS") {
      setInputData({ ...inputSchema });
      setErrors({ ...errorSchema });
    }
    setSelectedData(null);
    setSelectedImage(null);
    fetchData();
  }, [slug, currentPage, limit, status, selectedBranch, selectedCust, tabId, subTabId]);

  useEffect(() => {
    fetchAdditionalData();
  }, []);

  useEffect(() => {
    setLimit(5);
    setCurrentPage(1);
    setSelectedMode("add");
    setSortOrder("asc");
    setSelectedBranch(idoutlet);
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
