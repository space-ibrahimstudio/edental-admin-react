import React, { Fragment, useState, useEffect } from "react";
import { useNavigate, Navigate, useParams } from "react-router-dom";
import { useFormat, useContent, useDevmode } from "@ibrahimstudio/react";
import { Button } from "@ibrahimstudio/button";
import { useAuth } from "../libs/securities/auth";
import { useApi } from "../libs/apis/office";
import { useNotifications } from "../components/feedbacks/context/notifications-context";
import { getCurrentDate, getNestedValue, exportToExcel } from "../libs/plugins/controller";
import Pages from "../components/frames/pages";
import { DashboardContainer, DashboardHead, DashboardToolbar, DashboardTool, DashboardBody } from "./overview-dashboard";
import Table, { THead, TBody, TR, TH, TD } from "../components/contents/table";

const DashboardParamsPage = ({ parent, slug }) => {
  const { params } = useParams();
  const navigate = useNavigate();
  const { toPathname, toTitleCase } = useContent();
  const { log } = useDevmode();
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
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [stockHistoryData, setStockHistoryData] = useState([]);
  const [orderDetailData, setOrderDetailData] = useState([]);

  const goBack = () => navigate(-1);

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
        return (
          <Fragment>
            <DashboardHead title={isFetching ? "Memuat data ..." : isDataShown ? pageTitle : "Tidak ada data."} />
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
                      <TD>{newDate(data.transactiondetailcreate, "en-gb")}</TD>
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
