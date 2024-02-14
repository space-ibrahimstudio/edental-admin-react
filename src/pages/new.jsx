import React from "react";
import {
  TableData,
  TableRow,
  TableHeadValue,
  TableBodyValue,
} from "../components/layout/tables";
import { PageScreen } from "../components/layout/page-screen";
import "./styles/new.css";

const New = () => {
  const headingData = (
    <TableRow type="heading">
      <TableHeadValue value="Nama" />
      <TableHeadValue value="Email" />
      <TableHeadValue value="Phone" />
      <TableHeadValue position="end" value="Address" />
    </TableRow>
  );

  return (
    <PageScreen pageId="new-test">
      <section className="tabel-section">
        <b className="tabel-section-title">Daftar Pengguna</b>
        <div className="tabel-section-nav">
          <button className="replace-this8" />
          <div className="tabel-section-option">
            <button className="replace-this8" />
            <button className="replace-this8" />
          </div>
        </div>
        <TableData headerData={headingData}>
          <TableRow>
            <TableBodyValue value="Maulana Malik Ibrahim" />
            <TableBodyValue value="ibrahimcpersonal@gmail.com" />
            <TableBodyValue value="0881022384778" />
            <TableBodyValue position="end" value="123 Main Street" />
          </TableRow>
        </TableData>
        <div className="replace-this11" />
      </section>
    </PageScreen>
  );
};

export default New;
