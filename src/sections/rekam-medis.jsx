import React, { useState, useEffect, Fragment } from "react";
import { useFormat } from "@ibrahimstudio/react";
import { Input } from "@ibrahimstudio/input";
import { Button } from "@ibrahimstudio/button";
import { fetchAllDataList, fetchDataList } from "../libs/sources/data";
import { useNotifications } from "../components/feedbacks/context/notifications-context";
import { ButtonGroup } from "../components/input-controls/buttons";
import { OnpageForm, FormHead, FormTitle, FormTitleWrap, FormBody, FormFooter } from "../components/input-controls/onpage-form";
import { PlusIcon, CheckIcon } from "../components/layouts/icons";
import { TableData, TableRow, TableHeadValue, TableBodyValue } from "../components/layouts/tables";
import { InputWrap } from "../components/input-controls/inputs";
import styles from "./styles/tabel-section.module.css";

export const MedicRecord = ({ sectionId }) => {
  const { newDate } = useFormat();
  const { showNotifications } = useNotifications();
  const [custList, setCustList] = useState([]);
  const [tabId, setTabId] = useState("1");
  const [subTabId, setSubTabId] = useState("1");
  const [subTab, setSubTab] = useState([]);
  const [reserveData, setReserveData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isDataShown, setIsDataShown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [inputData, setInputData] = useState({
    idauthuser: "",
    name: "",
    address: "",
    email: "",
    phone: "",
  });
  const [errors, setErrors] = useState({
    idauthuser: "",
    name: "",
    address: "",
    email: "",
    phone: "",
  });
  // start data paging
  const handleTabChange = (id) => {
    setTabId(id);
    subTabButton(id);
  };
  const handleSubTabChange = (id) => {
    setSubTabId(id);
  };

  const tabButton = [
    { id: "1", label: "Informasi Pribadi" },
    { id: "2", label: "Catatan Klinik" },
    { id: "3", label: "Diagnosa & Tindakan" },
    { id: "4", label: "Resep" },
  ];

  const subTab1Button = [
    { id: "1", label: "Anamesa" },
    { id: "2", label: "Anamesa Odontogram" },
    { id: "3", label: "Pemeriksaan Umum" },
    { id: "4", label: "Foto Pasien" },
  ];

  const subTab2Button = [
    { id: "1", label: "Kondisi" },
    { id: "2", label: "Diagnosa" },
    { id: "3", label: "Tindakan Medis" },
    { id: "4", label: "Pemakaian Alkes" },
  ];

  const subTab3Button = [
    { id: "1", label: "Profil" },
    { id: "2", label: "Histori Reservasi" },
    { id: "3", label: "Histori Order" },
  ];

  const subTabButton = (id) => {
    if (id === "1") {
      setSubTab(subTab3Button);
    } else if (id === "2") {
      setSubTab(subTab1Button);
    } else if (id === "3") {
      setSubTab(subTab2Button);
    } else {
      setSubTab([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputData((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    setErrors({
      ...errors,
      [name]: "",
    });

    if (name === "idauthuser") {
      let custFind = false;
      let matchedData = null;

      custList.forEach((item) => {
        if (item.idauthuser === value) {
          custFind = true;
          matchedData = item;
        }
      });

      if (custFind) {
        setIsDataShown(true);
        setInputData((prevState) => ({
          ...prevState,
          name: matchedData.username,
          address: matchedData.address,
          email: matchedData.useremail,
          phone: matchedData.userphone,
        }));
      }
    }
  };

  const tableHeadData = (
    <TableRow type="heading">
      <TableHeadValue value="NO" type="num" />
      <TableHeadValue value="Tanggal Dibuat" />
      <TableHeadValue value="Tanggal Reservasi" />
      <TableHeadValue value="Jam Reservasi" />
      <TableHeadValue value="Kode Reservasi" />
      <TableHeadValue value="Nama Pengguna" />
      <TableHeadValue value="Telepon" />
      <TableHeadValue value="Email" />
      <TableHeadValue value="Layanan" />
      <TableHeadValue value="Jenis Layanan" />
      <TableHeadValue value="Kode Voucher" />
      <TableHeadValue value="Cabang" position="end" />
    </TableRow>
  );

  const renderOnpageForm = () => {
    switch (tabId) {
      case "1":
        switch (subTabId) {
          case "1":
            return (
              <Fragment>
                {subTab.length > 0 && (
                  <FormHead>
                    <ButtonGroup>
                      {subTab.map((button, index) => (
                        <Button
                          key={index}
                          id={button.id}
                          size="sm"
                          color={subTabId === button.id ? "var(--color-foreground)" : "var(--color-secondary)"}
                          variant={subTabId === button.id ? "fill" : "hollow"}
                          buttonText={button.label}
                          onClick={() => handleSubTabChange(button.id)}
                        />
                      ))}
                    </ButtonGroup>
                  </FormHead>
                )}
                <OnpageForm>
                  <FormHead>
                    <FormTitle text="Update Informasi Pribadi" />
                  </FormHead>
                  <FormBody>
                    <InputWrap>
                      <Input
                        id="reservation-user-name"
                        labelText="Nama Pelanggan"
                        placeholder="e.g. John Doe"
                        type="text"
                        name="name"
                        value={inputData.name}
                        onChange={handleInputChange}
                        errorContent={errors.name}
                        isRequired
                      />
                      <Input
                        id="reservation-user-phone"
                        labelText="Nomor Telepon"
                        placeholder="0882xxx"
                        type="tel"
                        name="phone"
                        value={inputData.phone}
                        onChange={handleInputChange}
                        errorContent={errors.phone}
                      />
                      <Input
                        id="reservation-user-email"
                        labelText="Email"
                        placeholder="customer@gmail.com"
                        type="email"
                        name="email"
                        value={inputData.email}
                        onChange={handleInputChange}
                        errorContent={errors.email}
                      />
                    </InputWrap>
                    <InputWrap>
                      <Input
                        id="reservation-user-address"
                        labelText="Alamat"
                        placeholder="123 Main Street"
                        type="text"
                        name="address"
                        value={inputData.address}
                        onChange={handleInputChange}
                        errorContent={errors.address}
                      />
                    </InputWrap>
                  </FormBody>
                  <FormFooter>
                    <Button
                      id="handle-form-submit"
                      radius="full"
                      type="submit"
                      buttonText="Simpan Perubahan"
                      startContent={<CheckIcon width="12px" height="100%" />}
                    />
                  </FormFooter>
                </OnpageForm>
              </Fragment>
            );
        }
      case "2":
        switch (subTabId) {
          case "1":
            return (
              <Fragment>
                {subTab.length > 0 && (
                  <FormHead>
                    <ButtonGroup>
                      {subTab.map((button, index) => (
                        <Button
                          key={index}
                          id={button.id}
                          size="sm"
                          color={subTabId === button.id ? "var(--color-foreground)" : "var(--color-secondary)"}
                          variant={subTabId === button.id ? "fill" : "hollow"}
                          buttonText={button.label}
                          onClick={() => handleSubTabChange(button.id)}
                        />
                      ))}
                    </ButtonGroup>
                  </FormHead>
                )}
                <TableData headerData={tableHeadData} dataShown={isDataShown} loading={isFetching}>
                  {filteredData.map((reserve, index) => (
                    <TableRow key={index} isEven={index % 2 === 0}>
                      <TableBodyValue type="num" value={(currentPage - 1) * limit + index + 1} />
                      <TableBodyValue value={newDate(reserve.datetimecreate, "en-gb")} />
                      <TableBodyValue value={reserve.reservationdate} />
                      <TableBodyValue value={reserve.reservationtime} />
                      <TableBodyValue value={reserve.rscode} />
                      <TableBodyValue value={reserve.name} />
                      <TableBodyValue value={reserve.phone} />
                      <TableBodyValue value={reserve.email} />
                      <TableBodyValue value={reserve.service} />
                      <TableBodyValue value={reserve.typeservice} />
                      <TableBodyValue value={reserve.voucher} />
                      <TableBodyValue value={reserve.outlet_name} position="end" />
                    </TableRow>
                  ))}
                </TableData>
              </Fragment>
            );
          // case "2":
          //   return (
          //     <Fragment>
          //       <FormBody></FormBody>
          //     </Fragment>
          //   );
          // case "3":
          //   return (
          //     <Fragment>
          //       <FormBody></FormBody>
          //     </Fragment>
          //   );
          // case "4":
          //   return (
          //     <Fragment>
          //       <FormBody></FormBody>
          //     </Fragment>
          //   );
          default:
            return (
              <Fragment>
                {subTab.length > 0 && (
                  <FormHead>
                    <ButtonGroup>
                      {subTab.map((button, index) => (
                        <Button
                          key={index}
                          id={button.id}
                          size="sm"
                          color={subTabId === button.id ? "var(--color-foreground)" : "var(--color-secondary)"}
                          variant={subTabId === button.id ? "fill" : "hollow"}
                          buttonText={button.label}
                          onClick={() => handleSubTabChange(button.id)}
                        />
                      ))}
                    </ButtonGroup>
                  </FormHead>
                )}
                <TableData headerData={tableHeadData} dataShown={isDataShown} loading={isFetching}>
                  {filteredData.map((reserve, index) => (
                    <TableRow key={index} isEven={index % 2 === 0}>
                      <TableBodyValue type="num" value={(currentPage - 1) * limit + index + 1} />
                      <TableBodyValue value={newDate(reserve.datetimecreate, "en-gb")} />
                      <TableBodyValue value={reserve.reservationdate} />
                      <TableBodyValue value={reserve.reservationtime} />
                      <TableBodyValue value={reserve.rscode} />
                      <TableBodyValue value={reserve.name} />
                      <TableBodyValue value={reserve.phone} />
                      <TableBodyValue value={reserve.email} />
                      <TableBodyValue value={reserve.service} />
                      <TableBodyValue value={reserve.typeservice} />
                      <TableBodyValue value={reserve.voucher} />
                      <TableBodyValue value={reserve.outlet_name} position="end" />
                    </TableRow>
                  ))}
                </TableData>
              </Fragment>
            );
        }
      case "3":
        switch (subTabId) {
          // case "1":
          //   return (
          //     <Fragment>
          //       <FormBody></FormBody>
          //     </Fragment>
          //   );
          // case "2":
          //   return (
          //     <Fragment>
          //       <FormBody></FormBody>
          //     </Fragment>
          //   );
          // case "3":
          //   return (
          //     <Fragment>
          //       <FormBody></FormBody>
          //     </Fragment>
          //   );
          // case "4":
          //   return (
          //     <Fragment>
          //       <FormBody></FormBody>
          //     </Fragment>
          //   );
          default:
            return (
              <Fragment>
                {subTab.length > 0 && (
                  <FormHead>
                    <ButtonGroup>
                      {subTab.map((button, index) => (
                        <Button
                          key={index}
                          id={button.id}
                          size="sm"
                          color={subTabId === button.id ? "var(--color-foreground)" : "var(--color-secondary)"}
                          variant={subTabId === button.id ? "fill" : "hollow"}
                          buttonText={button.label}
                          onClick={() => handleSubTabChange(button.id)}
                        />
                      ))}
                    </ButtonGroup>
                  </FormHead>
                )}
                <TableData headerData={tableHeadData} dataShown={isDataShown} loading={isFetching}>
                  {filteredData.map((reserve, index) => (
                    <TableRow key={index} isEven={index % 2 === 0}>
                      <TableBodyValue type="num" value={(currentPage - 1) * limit + index + 1} />
                      <TableBodyValue value={newDate(reserve.datetimecreate, "en-gb")} />
                      <TableBodyValue value={reserve.reservationdate} />
                      <TableBodyValue value={reserve.reservationtime} />
                      <TableBodyValue value={reserve.rscode} />
                      <TableBodyValue value={reserve.name} />
                      <TableBodyValue value={reserve.phone} />
                      <TableBodyValue value={reserve.email} />
                      <TableBodyValue value={reserve.service} />
                      <TableBodyValue value={reserve.typeservice} />
                      <TableBodyValue value={reserve.voucher} />
                      <TableBodyValue value={reserve.outlet_name} position="end" />
                    </TableRow>
                  ))}
                </TableData>
              </Fragment>
            );
        }
      case "4":
        return (
          <Fragment>
            {subTab.length > 0 && (
              <FormHead>
                <ButtonGroup>
                  {subTab.map((button, index) => (
                    <Button
                      key={index}
                      id={button.id}
                      size="sm"
                      color={subTabId === button.id ? "var(--color-foreground)" : "var(--color-secondary)"}
                      variant={subTabId === button.id ? "fill" : "hollow"}
                      buttonText={button.label}
                      onClick={() => handleSubTabChange(button.id)}
                    />
                  ))}
                </ButtonGroup>
              </FormHead>
            )}
            <TableData headerData={tableHeadData} dataShown={isDataShown} loading={isFetching}>
              {filteredData.map((reserve, index) => (
                <TableRow key={index} isEven={index % 2 === 0}>
                  <TableBodyValue type="num" value={(currentPage - 1) * limit + index + 1} />
                  <TableBodyValue value={newDate(reserve.datetimecreate, "en-gb")} />
                  <TableBodyValue value={reserve.reservationdate} />
                  <TableBodyValue value={reserve.reservationtime} />
                  <TableBodyValue value={reserve.rscode} />
                  <TableBodyValue value={reserve.name} />
                  <TableBodyValue value={reserve.phone} />
                  <TableBodyValue value={reserve.email} />
                  <TableBodyValue value={reserve.service} />
                  <TableBodyValue value={reserve.typeservice} />
                  <TableBodyValue value={reserve.voucher} />
                  <TableBodyValue value={reserve.outlet_name} position="end" />
                </TableRow>
              ))}
            </TableData>
          </Fragment>
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchAllDataList("searchcustomer");
        setCustList(data);
      } catch (error) {
        console.error("Error fetching all customer data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async (page, limit) => {
      try {
        setIsFetching(true);
        const offset = (page - 1) * limit;
        const data = await fetchDataList(offset, limit, "viewreservation");

        if (data && data.data && data.data.length > 0) {
          setReserveData(data.data);
          setFilteredData(data.data);
          setIsDataShown(true);
        } else {
          setReserveData([]);
          setFilteredData([]);
          setIsDataShown(false);
        }
      } catch (error) {
        console.error("Error fetching reservation data:", error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchData(currentPage, limit);
  }, [currentPage, limit]);

  useEffect(() => {
    setIsDataShown(filteredData.length > 0);
  }, [filteredData]);

  return (
    <section id={sectionId} className={styles.tabelSection}>
      <b className={styles.tabelSectionTitle}>Data Rekam Medis</b>
      <div className={styles.tabelSectionNav}>
        <InputWrap>
          <Input
            id="search-customer"
            variant="select"
            isLabeled={false}
            name="idauthuser"
            radius="full"
            placeholder="Pilih Customer"
            options={custList.map((cust) => ({
              value: cust.idauthuser,
              label: cust.username,
            }))}
            value={inputData.idauthuser}
            onSelect={(selectedValue) =>
              handleInputChange({
                target: { name: "idauthuser", value: selectedValue },
              })
            }
            errorContent={errors.idauthuser}
            isRequired
            isSearchable
          />
        </InputWrap>
        <InputWrap>
          <ButtonGroup>
            {tabButton.map((button, index) => (
              <Button
                key={index}
                id={button.id}
                size="sm"
                color={tabId === button.id ? "var(--color-foreground)" : "var(--color-secondary)"}
                variant={tabId === button.id ? "fill" : "hollow"}
                buttonText={button.label}
                onClick={() => handleTabChange(button.id)}
              />
            ))}
          </ButtonGroup>
          {tabId !== "1" && (
            <Button id="add-new-data" radius="full" buttonText="Tambah Baru" startContent={<PlusIcon width="17px" height="100%" />} />
          )}
        </InputWrap>
      </div>
      {renderOnpageForm()}
      {/* <TableData
        headerData={renderTabHead(tabId, subTabId)}
        dataShown={isDataShown}
        loading={isFetching}
      >
        {filteredData.map((cust, index) => (
          <TableRow key={index} isEven={index % 2 === 0}>
            <TableBodyValue
              type="num"
              value={(currentPage - 1) * limit + index + 1}
            />
            <TableBodyValue value={cust.username} />
            <TableBodyValue value={cust.address} />
            <TableBodyValue value={cust.useremail} />
            <TableBodyValue value={cust.userphone} />
            <TableBodyValue
              value={newDate(cust.usercreate, "en-gb")}
              position="end"
            />
          </TableRow>
        ))}
      </TableData> */}
    </section>
  );
};
