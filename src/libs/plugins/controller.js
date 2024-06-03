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

export function inputValidator(formData, requiredFields) {
  const errors = {};
  const checkRequired = (value, field, path) => {
    if (!value) {
      errors[path.join(".")] = `The ${field} field is required`;
    }
  };
  const validateField = (data, field, path = []) => {
    if (Array.isArray(data[field])) {
      data[field].forEach((item, index) => {
        Object.keys(item).forEach((key) => {
          if (requiredFields.includes(`${field}.${key}`)) {
            checkRequired(item[key], key, [...path, field, index, key]);
          }
        });
      });
    } else {
      checkRequired(data[field], field, [...path, field]);
    }
  };
  requiredFields.forEach((field) => {
    const [mainField, ...nestedField] = field.split(".");
    if (nestedField.length > 0) {
      validateField(formData, mainField);
    } else {
      checkRequired(formData[mainField], mainField, [mainField]);
    }
  });
  return errors;
}

export function getNestedValue(obj, path) {
  return path.split(".").reduce((acc, part) => acc && acc[part], obj);
}

export function getNormalPhoneNumber(number) {
  let normalizedNumber = number.replace(/[\s-]/g, "");
  if (normalizedNumber.startsWith("+")) {
    normalizedNumber = normalizedNumber.slice(1);
  }
  if (!normalizedNumber.startsWith("62")) {
    normalizedNumber = `62${normalizedNumber}`;
  }
  return normalizedNumber;
}
