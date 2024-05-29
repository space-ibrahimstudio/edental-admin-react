import React, { Fragment, useState, useEffect } from "react";
import { useContent, useFormat, useDevmode } from "@ibrahimstudio/react";
import { ISTrash } from "@ibrahimstudio/icons";
import { useAuth } from "../libs/securities/auth";
import { useApi } from "../libs/apis/office";
import { useNotifications } from "../components/feedbacks/context/notifications-context";
import { Input } from "@ibrahimstudio/input";
import { Button } from "@ibrahimstudio/button";
import Pages from "../components/frames/pages";
import { DashboardContainer, DashboardHead, DashboardToolbar, DashboardTool, DashboardBody } from "./overview-dashboard";
import Table, { THead, TBody, TR, TH, TD } from "../components/contents/table";
import { SubmitForm } from "../components/input-controls/forms";
import { exportToExcel, getNestedValue } from "../libs/plugins/controller";
import { SearchInput, InputWrap } from "../components/input-controls/inputs";
import Pagination from "../components/navigations/pagination";

const DashboardSlugPage = ({ parent, slug }) => {
  const { newDate } = useFormat();
  const { log } = useDevmode();
  const { toTitleCase, toPathname } = useContent();
  const { secret } = useAuth();
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

  const [custData, setCustData] = useState([]);
  const [allServiceData, setAllServiceData] = useState([]);
  const [serviceData, setServiceData] = useState([]);
  const [branchData, setBranchData] = useState([]);

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
    layanan: [{ servicetype: "", price: "" }],
  };

  const [inputData, setInputData] = useState({ ...inputSchema });
  const [errors, setErrors] = useState({ ...inputSchema });

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

  const restoreInputState = () => {
    setInputData({ ...inputSchema });
    setErrors({ ...inputSchema });
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
      const offset = (currentPage - 1) * limit;
      formData.append("data", JSON.stringify({ secret, limit, hal: offset }));
      let data;
      let alldata;
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
          const addFormData = new FormData();
          addFormData.append("data", JSON.stringify({ secret }));
          alldata = await apiRead(addFormData, "office", "searchservice");
          if (alldata && alldata.data && alldata.data.length > 0) {
            setAllServiceData(alldata.data);
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
      default:
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
            <DashboardHead title={pagetitle} desc="Daftar Customer yang memiliki riwayat Reservasi." />
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
                      <TD isCopy>{data.useremail}</TD>
                      <TD type="code">{data.userphone}</TD>
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
                              <Input id={`service-type-name-${index}-${idx}`} labelText="Jenis Layanan" value={subdata.servicetypename} isReadonly />
                              <Input id={`service-type-price-${index}-${idx}`} labelText="Harga" value={subdata.serviceprice} isReadonly />
                              <Input id={`service-type-status-${index}-${idx}`} labelText="Status" value={subdata.servicetypestatus} isReadonly />
                            </InputWrap>
                          ))}
                        </Fragment>
                      }
                      onEdit={() => openEdit(data["Nama Layanan"].idservice)}
                      onDelete={() => handleDelete(data["Nama Layanan"].idservice, "cudservice")}
                    >
                      <TD>{newDate(data["Nama Layanan"].servicecreate, "en-gb")}</TD>
                      <TD>{data["Nama Layanan"].servicename}</TD>
                      <TD type="code">{data["Nama Layanan"].idservice}</TD>
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
                  id="service-name"
                  labelText="Nama Layanan"
                  placeholder="Masukkan nama layanan"
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
                      id={`service-type-name-${index}`}
                      labelText="Jenis Layanan"
                      placeholder="e.g. Scaling gigi"
                      type="text"
                      name="servicetype"
                      value={subservice.servicetype}
                      onChange={(e) => handleServiceRowChange(index, e)}
                      errorContent={errors.layanan[index].servicetype}
                      isRequired
                    />
                    <Input
                      id={`service-type-price-${index}`}
                      labelText="Atur Harga"
                      placeholder="Masukkan harga"
                      type="number"
                      name="price"
                      value={subservice.price}
                      onChange={(e) => handleServiceRowChange(index, e)}
                      errorContent={errors.layanan[index].price}
                      isRequired
                    />
                    <Button
                      id={`delete-row-${index}`}
                      variant="dashed"
                      subVariant="icon"
                      size="sm"
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
                  id="add-new-row"
                  variant="hollow"
                  size="sm"
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
                  id="edit-service-name"
                  labelText="Nama Layanan"
                  placeholder="Masukkan nama layanan"
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
                      id={`edit-service-type-name-${index}`}
                      labelText="Jenis Layanan"
                      placeholder="e.g. Scaling gigi"
                      type="text"
                      name="servicetype"
                      value={subservice.servicetype}
                      onChange={(e) => handleServiceRowChange(index, e)}
                      errorContent={errors.layanan[index] ? errors.layanan[index].servicetype : ""}
                      isRequired
                    />
                    <Input
                      id={`edit-service-type-price-${index}`}
                      labelText="Atur Harga"
                      placeholder="Masukkan harga"
                      type="number"
                      name="price"
                      value={subservice.price}
                      onChange={(e) => handleServiceRowChange(index, e)}
                      errorContent={errors.layanan[index] ? errors.layanan[index].price : ""}
                      isRequired
                    />
                    <Button
                      id={`edit-delete-row-${index}`}
                      variant="dashed"
                      subVariant="icon"
                      size="sm"
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
                  id="edit-add-new-row"
                  variant="hollow"
                  size="sm"
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
            <DashboardHead title={pagetitle} />
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
                <Button
                  id={`export-data-${pageid}`}
                  buttonText="Export ke Excel"
                  radius="full"
                  bgColor="var(--color-green)"
                  onClick={() => exportToExcel(branchData, "Daftar Customer", "daftar_customer")}
                />
                <Button id={`add-new-data-${pageid}`} buttonText="Tambah Baru" radius="full" onClick={openForm} />
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
                      <TD>{data.mainregion}</TD>
                      <TD>{data.outlet_region}</TD>
                      <TD type="code">{data.cctr_group}</TD>
                      <TD type="code">{data.cctr}</TD>
                      <TD type="code">{data.outlet_phone}</TD>
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
                    id="outlet-name"
                    labelText="Nama Outlet"
                    placeholder="Edental Jakarta Pusat"
                    type="text"
                    name="name"
                    value={inputData.name}
                    onChange={handleInputChange}
                    errorContent={errors.name}
                    isRequired
                  />
                  <Input
                    id="outlet-phone"
                    labelText="Nomor Kontak Cabang"
                    placeholder="0882xxx"
                    type="tel"
                    name="phone"
                    value={inputData.phone}
                    onChange={handleInputChange}
                    errorContent={errors.phone}
                    isRequired
                  />
                  <Input
                    id="outlet-mainregion"
                    labelText="Main Region"
                    placeholder="Jawa"
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
                    id="outlet-region"
                    labelText="Region"
                    placeholder="DKI Jakarta"
                    type="text"
                    name="region"
                    value={inputData.region}
                    onChange={handleInputChange}
                    errorContent={errors.region}
                    isRequired
                  />
                  <Input
                    id="outlet-address"
                    labelText="Alamat Cabang"
                    placeholder="123 Main Street"
                    type="text"
                    name="address"
                    value={inputData.address}
                    onChange={handleInputChange}
                    errorContent={errors.address}
                    isRequired
                  />
                  <Input
                    id="outlet-postcode"
                    labelText="Kode Pos"
                    placeholder="40282"
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
                    id="outlet-coordinate"
                    labelText="Titik Koordinat"
                    placeholder="Masukkan titik koordinat"
                    type="text"
                    name="coordinate"
                    value={inputData.coordinate}
                    onChange={handleInputChange}
                    errorContent={errors.coordinate}
                    isRequired
                  />
                  <Input
                    id="outlet-cctrgroup"
                    labelText="CCTR Group"
                    placeholder="Masukkan CCTR group"
                    type="text"
                    name="cctr_group"
                    value={inputData.cctr_group}
                    onChange={handleInputChange}
                    errorContent={errors.cctr_group}
                    isRequired
                  />
                  <Input
                    id="outlet-cctr"
                    labelText="CCTR"
                    placeholder="Masukkan CCTR"
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
                    id="outlet-name"
                    labelText="Nama Outlet"
                    placeholder="Edental Jakarta Pusat"
                    type="text"
                    name="name"
                    value={inputData.name}
                    onChange={handleInputChange}
                    errorContent={errors.name}
                    isRequired
                  />
                  <Input
                    id="outlet-phone"
                    labelText="Nomor Kontak Cabang"
                    placeholder="0882xxx"
                    type="tel"
                    name="phone"
                    value={inputData.phone}
                    onChange={handleInputChange}
                    errorContent={errors.phone}
                    isRequired
                  />
                  <Input
                    id="outlet-mainregion"
                    labelText="Main Region"
                    placeholder="Jawa"
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
                    id="outlet-region"
                    labelText="Region"
                    placeholder="DKI Jakarta"
                    type="text"
                    name="region"
                    value={inputData.region}
                    onChange={handleInputChange}
                    errorContent={errors.region}
                    isRequired
                  />
                  <Input
                    id="outlet-address"
                    labelText="Alamat Cabang"
                    placeholder="123 Main Street"
                    type="text"
                    name="address"
                    value={inputData.address}
                    onChange={handleInputChange}
                    errorContent={errors.address}
                    isRequired
                  />
                  <Input
                    id="outlet-postcode"
                    labelText="Kode Pos"
                    placeholder="40282"
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
                    id="outlet-coordinate"
                    labelText="Titik Koordinat"
                    placeholder="Masukkan titik koordinat"
                    type="text"
                    name="coordinate"
                    value={inputData.coordinate}
                    onChange={handleInputChange}
                    errorContent={errors.coordinate}
                    isRequired
                  />
                  <Input
                    id="outlet-cctrgroup"
                    labelText="CCTR Group"
                    placeholder="Masukkan CCTR group"
                    type="text"
                    name="cctr_group"
                    value={inputData.cctr_group}
                    onChange={handleInputChange}
                    errorContent={errors.cctr_group}
                    isRequired
                  />
                  <Input
                    id="outlet-cctr"
                    labelText="CCTR"
                    placeholder="Masukkan CCTR"
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
      default:
        return <DashboardHead title={`Halaman Dashboard ${pagetitle} akan segera hadir.`} />;
    }
  };

  useEffect(() => {
    setIsDataShown(filteredData.length > 0);
  }, [filteredData]);

  useEffect(() => {
    fetchData();
  }, [slug, currentPage, limit]);

  return (
    <Pages title={`${pagetitle} - Dashboard`}>
      <DashboardContainer>{renderContent()}</DashboardContainer>
    </Pages>
  );
};

export default DashboardSlugPage;
