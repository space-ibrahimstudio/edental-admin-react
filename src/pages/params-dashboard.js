import React, { Fragment, useState, useEffect } from "react";
import { useNavigate, Navigate, useParams } from "react-router-dom";
import { useFormat, useContent } from "@ibrahimstudio/react";
import { Button } from "@ibrahimstudio/button";
import { Input } from "@ibrahimstudio/input";
import { useAuth } from "../libs/securities/auth";
import { useApi } from "../libs/apis/office";
import { useNotifications } from "../components/feedbacks/context/notifications-context";
import { getNestedValue, exportToExcel } from "../libs/plugins/controller";
import Pages from "../components/frames/pages";
import { DashboardContainer, DashboardHead, DashboardToolbar, DashboardTool, DashboardBody } from "./overview-dashboard";
import Table, { THead, TBody, TR, TH, TD } from "../components/contents/table";

const DashboardParamsPage = ({ parent, slug }) => {
  const { params } = useParams();
  const navigate = useNavigate();
  const { toPathname, toTitleCase } = useContent();
  const { newDate, newPrice } = useFormat();
  const { isLoggedin, secret } = useAuth();
  const { apiRead } = useApi();
  const { showNotifications } = useNotifications();

  const pageid = parent && slug && params ? `params-${toPathname(parent)}-${toPathname(slug)}-${toPathname(params)}` : "params-dashboard";
  const pagepath = parent && slug && params ? `/${toPathname(parent)}/${toPathname(slug)}/${toPathname(params)}` : "/";

  const [pageTitle, setPageTitle] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [isDataShown, setIsDataShown] = useState(true);
  const [sortOrder, setSortOrder] = useState("asc");
  const [startDate, setStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)));
  const [endDate, setEndDate] = useState(new Date());

  const [stockHistoryData, setStockHistoryData] = useState([]);
  const [orderDetailData, setOrderDetailData] = useState([]);

  const goBack = () => navigate(-1);

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
    let data;
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
          formData.append("data", JSON.stringify({ secret, stockname: params }));
          data = await apiRead(formData, "office", "logstock");
          if (data && data.data && data.data.length > 0) {
            setStockHistoryData(data.data);
            setPageTitle(`Histori Stok ${toTitleCase(params)}`);
            setIsDataShown(true);
          } else {
            setStockHistoryData([]);
            setPageTitle("");
            setIsDataShown(false);
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
                <Button id={`${pageid}-back-previous-page`} buttonText="Kembali" radius="full" onClick={goBack} />
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
            <DashboardHead
              title={isFetching ? "Memuat data ..." : pageTitle}
              // prettier-ignore
              desc={isFetching ? "Memuat detail ..." : isDataShown
                ? `Menampilkan histori stok ${newDate(formatDate(startDate), "id")} hingga ${newDate(formatDate(endDate), "id")}.`
                : `Histori stok ${newDate(formatDate(startDate), "id")} hingga ${newDate(formatDate(endDate), "id")} tidak ditemukan.`
              }
            />
            <DashboardToolbar>
              <DashboardTool>
                <Button id={`${pageid}-back-previous-page`} buttonText="Kembali" radius="full" onClick={goBack} />
                <Button
                  id={`export-data-${pageid}`}
                  buttonText="Export ke Excel"
                  radius="full"
                  bgColor="var(--color-green)"
                  onClick={() => exportToExcel(filterData(), pageTitle, `${toPathname(pageTitle)}`)}
                />
              </DashboardTool>
              <DashboardTool>
                <Input
                  id={`${pageid}-filter-startdate`}
                  radius="full"
                  labelText="Filter dari:"
                  type="datetime-local"
                  value={formatDate(startDate)}
                  onChange={(e) => setStartDate(new Date(e.target.value))}
                />
                <Input
                  id={`${pageid}-filter-enddate`}
                  radius="full"
                  labelText="Hingga:"
                  type="datetime-local"
                  value={formatDate(endDate)}
                  onChange={(e) => setEndDate(new Date(e.target.value))}
                />
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
                    <TH>Harga Satuan</TH>
                    <TH>Jumlah</TH>
                    <TH>Total Harga</TH>
                    <TH>Cabang</TH>
                  </TR>
                </THead>
                <TBody>
                  {filterData().map((data, index) => (
                    <TR key={index}>
                      <TD>{newDate(data.logstockcreate, "id")}</TD>
                      <TD>{data.status}</TD>
                      <TD>{newPrice(data.value)}</TD>
                      <TD type="number">{data.qty}</TD>
                      <TD>{newPrice(data.totalvalue)}</TD>
                      <TD>{toTitleCase(data.outletname)}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </DashboardBody>
          </Fragment>
        );
      default:
        return;
    }
  };

  useEffect(() => {
    fetchData();
  }, [slug, params, slug === "STOCK" ? startDate : null, slug === "STOCK" ? endDate : null]);

  useEffect(() => {
    if (slug === "STOCK") {
      setIsDataShown(filterData().length > 0);
    }
  }, [slug === "STOCK" ? stockHistoryData : null, slug === "STOCK" ? startDate : null, slug === "STOCK" ? endDate : null]);

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
