import React, { Fragment, useState, useEffect } from "react";
import { useNavigate, Navigate, useParams } from "react-router-dom";
import { useFormat, useContent } from "@ibrahimstudio/react";
import { Button } from "@ibrahimstudio/button";
import { Input } from "@ibrahimstudio/input";
import { useAuth } from "../libs/securities/auth";
import { useApi } from "../libs/apis/office";
import { useNotifications } from "../components/feedbacks/context/notifications-context";
import { getNestedValue } from "../libs/plugins/controller";
import { useOptions } from "../libs/plugins/helper";
import Pages from "../components/frames/pages";
import { DashboardContainer, DashboardHead, DashboardToolbar, DashboardTool, DashboardBody } from "./overview-dashboard";
import Table, { THead, TBody, TR, TH, TD } from "../components/contents/table";
import { Arrow } from "../components/contents/icons";
import Pagination from "../components/navigations/pagination";

const DashboardParamsPage = ({ parent, slug }) => {
  const { params } = useParams();
  const navigate = useNavigate();
  const { toPathname, toTitleCase } = useContent();
  const { newDate, newPrice } = useFormat();
  const { isLoggedin, secret, idoutlet, level } = useAuth();
  const { apiRead } = useApi();
  const { showNotifications } = useNotifications();
  const { limitopt } = useOptions();

  const pageid = parent && slug && params ? `params-${toPathname(parent)}-${toPathname(slug)}-${toPathname(params)}` : "params-dashboard";

  const [pageTitle, setPageTitle] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [isDataShown, setIsDataShown] = useState(true);
  const [sortOrder, setSortOrder] = useState("asc");
  const [startDate, setStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)));
  const [endDate, setEndDate] = useState(new Date());
  const [limit, setLimit] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedBranch, setSelectedBranch] = useState(idoutlet);

  const [stockHistoryData, setStockHistoryData] = useState([]);
  const [allBranchData, setAllBranchData] = useState([]);
  const [orderDetailData, setOrderDetailData] = useState([]);

  const goBack = () => navigate(-1);
  const handlePageChange = (page) => setCurrentPage(page);
  const handleBranchChange = (value) => setSelectedBranch(value);
  const handleLimitChange = (value) => {
    setLimit(value);
    setCurrentPage(1);
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
    const errormsg = `Terjadi kesalahan saat memuat halaman ${toTitleCase(slug)} ${toTitleCase(params)}. Mohon periksa koneksi internet anda dan coba lagi.`;
    setIsFetching(true);
    const formData = new FormData();
    const addtFormData = new FormData();
    let data;
    let addtdata;
    try {
      switch (slug) {
        case "ORDER CUSTOMER":
          formData.append("data", JSON.stringify({ secret, idtransaction: params }));
          data = await apiRead(formData, "office", "viewdetailorder");
          if (data && data.data && data.data.length > 0) {
            setOrderDetailData(data.data);
            setPageTitle(`Detail Order #${params}`);
            setIsDataShown(true);
          } else {
            setOrderDetailData([]);
            setPageTitle("");
            setIsDataShown(false);
          }
          break;
        case "STOCK":
          const offset = (currentPage - 1) * limit;
          formData.append("data", JSON.stringify({ secret, stockname: params, limit, hal: offset, idoutlet: selectedBranch }));
          data = await apiRead(formData, "office", "logstock");
          if (data && data.data && data.data.length > 0) {
            setStockHistoryData(data.data);
            setTotalPages(data.TTLPage);
            setPageTitle(`Histori Stok ${toTitleCase(params)}`);
            setIsDataShown(true);
          } else {
            setStockHistoryData([]);
            setTotalPages(0);
            setPageTitle("Histori Stok Tidak Ditemukan");
            setIsDataShown(false);
          }
          addtFormData.append("data", JSON.stringify({ secret }));
          addtdata = await apiRead(addtFormData, "office", "viewoutletall");
          if (addtdata && addtdata.data && addtdata.data.length > 0) {
            setAllBranchData(addtdata.data);
          } else {
            setAllBranchData([]);
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

  const filterData = () => {
    return stockHistoryData.filter((item) => {
      const itemDate = new Date(item.logstockcreate);
      return itemDate >= startDate && itemDate <= endDate;
    });
  };

  const formatDate = (date) => {
    return date.toISOString().slice(0, 16);
  };

  const renderContent = () => {
    switch (slug) {
      case "ORDER CUSTOMER":
        return (
          <Fragment>
            <DashboardHead title={isFetching ? "Memuat data ..." : isDataShown ? pageTitle : "Tidak ada data."} />
            <DashboardToolbar>
              <DashboardTool>
                <Button id={`${pageid}-back-previous-page`} buttonText="Kembali" radius="full" onClick={goBack} startContent={<Arrow direction="left" />} />
              </DashboardTool>
            </DashboardToolbar>
            <DashboardBody>
              <Table byNumber isNoData={!isDataShown} isLoading={isFetching}>
                <THead>
                  <TR>
                    <TH isSorted onSort={() => handleSortDate(orderDetailData, setOrderDetailData, "usercreate")}>
                      Tanggal Dibuat
                    </TH>
                    <TH>Layanan</TH>
                    <TH>Jenis Layanan</TH>
                    <TH>Harga</TH>
                  </TR>
                </THead>
                <TBody>
                  {orderDetailData.map((data, index) => (
                    <TR key={index} isWarning={data.transactionstatus === "0"}>
                      <TD>{newDate(data.transactiondetailcreate, "id")}</TD>
                      <TD>{toTitleCase(data.service)}</TD>
                      <TD>{toTitleCase(data.servicetype)}</TD>
                      <TD>{newPrice(data.price)}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </DashboardBody>
          </Fragment>
        );
      case "STOCK":
        return (
          <Fragment>
            <DashboardHead title={isFetching ? "Memuat data ..." : pageTitle} desc={isFetching ? "Memuat detail ..." : isDataShown ? `Menampilkan histori stok ${newDate(formatDate(startDate), "id")} hingga ${newDate(formatDate(endDate), "id")}.` : `Histori stok ${newDate(formatDate(startDate), "id")} hingga ${newDate(formatDate(endDate), "id")} tidak ditemukan.`} />
            <DashboardToolbar>
              <DashboardTool>
                <Button id={`${pageid}-back-previous-page`} buttonText="Kembali" radius="full" onClick={goBack} startContent={<Arrow direction="left" />} />
                {/* <Button id={`export-data-${pageid}`} buttonText="Export" radius="full" bgColor="var(--color-green)" onClick={() => exportToExcel(filterData(), pageTitle, `${toPathname(pageTitle)}`)} startContent={<Export />} isDisabled={!isDataShown} /> */}
                {level === "admin" && <Input id={`${pageid}-outlet`} isLabeled={false} variant="select" isSearchable radius="full" placeholder="Pilih Cabang" value={selectedBranch} options={allBranchData.map((branch) => ({ value: branch.idoutlet, label: branch.outlet_name.replace("E DENTAL - DOKTER GIGI", "CABANG") }))} onSelect={handleBranchChange} />}
                <Input id={`limit-data-${pageid}`} isLabeled={false} variant="select" noEmptyValue radius="full" placeholder="Baris per Halaman" value={limit} options={limitopt} onSelect={handleLimitChange} isReadonly={!isDataShown} />
              </DashboardTool>
              <DashboardTool>
                <Input id={`${pageid}-filter-startdate`} radius="full" labelText="Filter dari:" type="datetime-local" value={formatDate(startDate)} onChange={(e) => setStartDate(new Date(e.target.value))} />
                <Input id={`${pageid}-filter-enddate`} radius="full" labelText="Hingga:" type="datetime-local" value={formatDate(endDate)} onChange={(e) => setEndDate(new Date(e.target.value))} />
              </DashboardTool>
            </DashboardToolbar>
            <DashboardBody>
              <Table byNumber isNoData={!isDataShown} isLoading={isFetching}>
                <THead>
                  <TR>
                    <TH isSorted onSort={() => handleSortDate(stockHistoryData, setStockHistoryData, "logstockcreate")}>
                      Tanggal Dibuat
                    </TH>
                    <TH>Status</TH>
                    <Fragment>{level === "admin" && <TH>Harga Satuan</TH>}</Fragment>
                    <TH>Jumlah</TH>
                    <Fragment>{level === "admin" && <TH>Total Harga</TH>}</Fragment>
                    <TH>Cabang</TH>
                  </TR>
                </THead>
                <TBody>
                  {filterData().map((data, index) => (
                    <TR key={index}>
                      <TD>{newDate(data.logstockcreate, "id")}</TD>
                      <TD>{data.status}</TD>
                      <Fragment>{level === "admin" && <TD>{newPrice(data.value)}</TD>}</Fragment>
                      <TD type="number">{data.qty}</TD>
                      <Fragment>{level === "admin" && <TD>{newPrice(data.totalvalue)}</TD>}</Fragment>
                      <TD>{toTitleCase(data.outletname)}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </DashboardBody>
            {isDataShown && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />}
          </Fragment>
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    fetchData();
  }, [slug, params, startDate, endDate, limit, selectedBranch]);

  useEffect(() => {
    if (slug === "STOCK") {
      setIsDataShown(filterData().length > 0);
    }
  }, [slug, stockHistoryData, startDate, endDate]);

  useEffect(() => {
    setSortOrder("asc");
    if (slug === "STOCK") {
      setStartDate(new Date(new Date().setMonth(new Date().getMonth() - 1)));
      setEndDate(new Date());
    }
  }, [slug]);

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
