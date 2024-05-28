import React, { Fragment, useState, useEffect } from "react";
import { useContent, useFormat } from "@ibrahimstudio/react";
import { useAuth } from "../libs/securities/auth";
import { useApi } from "../libs/apis/office";
import { Input } from "@ibrahimstudio/input";
import { Button } from "@ibrahimstudio/button";
import Pages from "../components/frames/pages";
import { DashboardContainer, DashboardHead, DashboardToolbar, DashboardTool, DashboardBody } from "./overview-dashboard";
import Table, { THead, TBody, TR, TH, TD } from "../components/contents/table";
import { exportToExcel } from "../libs/plugins/controller";
import { SearchInput } from "../components/input-controls/inputs";
import Pagination from "../components/navigations/pagination";

const DashboardSlugPage = ({ parent, slug }) => {
  const { newDate } = useFormat();
  const { toTitleCase, toPathname } = useContent();
  const { secret } = useAuth();
  const { apiRead } = useApi();

  const pageid = parent && slug ? `slug-${toPathname(parent)}-${toPathname(slug)}` : "slug-dashboard";
  const pagetitle = slug ? `${toTitleCase(slug)}` : "Slug Dashboard";
  const pagepath = parent && slug ? `/${toPathname(parent)}/${toPathname(slug)}` : "/";

  const [limit, setLimit] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isFetching, setIsFetching] = useState(true);
  const [filteredData, setFilteredData] = useState([]);
  const [isDataShown, setIsDataShown] = useState(true);
  const [sortOrder, setSortOrder] = useState("asc");

  const [custData, setCustData] = useState([]);

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

  const handleSortDate = (data, setData, params) => {
    const newData = [...data];
    if (!sortOrder || sortOrder === "desc") {
      newData.sort((a, b) => new Date(a[params]) - new Date(b[params]));
      setSortOrder("asc");
    } else {
      newData.sort((a, b) => new Date(b[params]) - new Date(a[params]));
      setSortOrder("desc");
    }
    setData(newData);
  };

  const fetchData = async () => {
    try {
      const formData = new FormData();
      const offset = (currentPage - 1) * limit;
      formData.append("data", JSON.stringify({ secret, limit, hal: offset }));
      let data;
      switch (slug) {
        case "DATA CUSTOMER":
          data = await apiRead(formData, "office", "viewcustomer");
          if (data && data.data.length > 0) {
            setCustData(data.data);
            setFilteredData(data.data);
            setTotalPages(data.TTLPage);
            setIsDataShown(true);
          } else {
            setCustData([]);
            setFilteredData([]);
            setTotalPages(0);
            setIsDataShown(false);
          }
          break;
        default:
          setIsDataShown(false);
          break;
      }
    } catch (error) {
      console.error(`error fetching ${slug} data:`, error);
    } finally {
      setIsFetching(false);
    }
  };

  const renderContent = () => {
    switch (slug) {
      case "DATA CUSTOMER":
        return (
          <Fragment>
            <DashboardHead title={isFetching ? "Memuat data ..." : pagetitle} desc="Daftar Customer yang memiliki riwayat Reservasi." />
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
                  onClick={() => exportToExcel(filteredData, "Daftar Customer", "daftar_customer")}
                />
              </DashboardTool>
            </DashboardToolbar>
            <DashboardBody>
              <Table byNumber={true} page={currentPage} limit={limit} isNoData={!isDataShown} isLoading={isFetching}>
                <THead>
                  <TR>
                    <TH isSorted={true} onSort={() => handleSortDate(filteredData, setFilteredData, "usercreate")}>
                      Tanggal Bergabung
                    </TH>
                    <TH>Nama Pengguna</TH>
                    <TH>Alamat Email</TH>
                    <TH>Nomor Telepon</TH>
                    <TH>Alamat</TH>
                  </TR>
                </THead>
                <TBody>
                  {filteredData.map((data, index) => (
                    <TR key={index}>
                      <TD>{newDate(data.usercreate, "en-gb")}</TD>
                      <TD>{toTitleCase(data.username)}</TD>
                      <TD isCopy={true}>{data.useremail}</TD>
                      <TD isCopy={true}>{data.userphone}</TD>
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
            <DashboardHead title={`Halaman Dashboard ${pagetitle} akan segera hadir.`} />
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
              </DashboardTool>
            </DashboardToolbar>
            <DashboardBody>
              <Table isNoData={true}></Table>
            </DashboardBody>
          </Fragment>
        );
      default:
        return <DashboardHead title={`Halaman Dashboard ${pagetitle} akan segera hadir.`} />;
    }
  };

  useEffect(() => {
    fetchData();
  }, [slug, currentPage, limit]);

  useEffect(() => {
    setIsDataShown(filteredData.length > 0);
  }, [filteredData]);

  return (
    <Pages title={`${pagetitle} - Dashboard`}>
      <DashboardContainer>{renderContent()}</DashboardContainer>
    </Pages>
  );
};

export default DashboardSlugPage;
