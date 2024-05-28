import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

export function getCurrentDate() {
  const today = new Date();
  const year = today.getFullYear();
  let month = today.getMonth() + 1;
  let day = today.getDate();

  month = month < 10 ? "0" + month : month;
  day = day < 10 ? "0" + day : day;

  return `${year}-${month}-${day}`;
}

export function exportToExcel(jsonData, sheetName, fileName) {
  const worksheet = XLSX.utils.json_to_sheet(jsonData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), `${fileName}.xlsx`);
}

export function inputValidator(inputData, requiredFields) {
  const errors = {};
  requiredFields.forEach((field) => {
    if (!inputData[field]) {
      errors[field] = "This field is required";
    }
  });
  return errors;
}
