export const useOptions = () => {
  const limitopt = [
    { value: 5, label: "Baris per Halaman: 5" },
    { value: 10, label: "Baris per Halaman: 10" },
    { value: 20, label: "Baris per Halaman: 20" },
    { value: 50, label: "Baris per Halaman: 50" },
    { value: 100, label: "Baris per Halaman: 100" },
  ];
  const genderopt = [
    { value: "male", label: "Laki-laki" },
    { value: "female", label: "Perempuan" },
  ];
  const levelopt = [
    { value: "admin", label: "Admin Pusat" },
    { value: "cabang", label: "Admin Cabang" },
  ];
  const usrstatopt = [
    { value: "0", label: "Aktif" },
    { value: "1", label: "Pending" },
  ];
  const unitopt = [
    { value: "PCS", label: "pcs" },
    { value: "PACK", label: "pack" },
    { value: "BOTTLE", label: "bottle" },
    { value: "TUBE", label: "tube" },
    { value: "BOX", label: "box" },
    { value: "SET", label: "set" },
  ];
  const houropt = ["10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00"];
  const postatopt = [
    { value: "0", label: "Open" },
    { value: "2", label: "Sent" },
    { value: "3", label: "Done" },
    { value: "4", label: "Rejected" },
  ];
  const pocstatopt = [{ value: "3", label: "Done" }];
  const reservstatopt = [
    { value: "0", label: "Pending" },
    { value: "2", label: "Reschedule" },
    { value: "3", label: "Batal" },
  ];
  const paymentstatopt = [
    { value: "0", label: "Pending" },
    { value: "3", label: "Batal" },
  ];
  const paymenttypeopt = [
    { value: "cash", label: "Cash in Store" },
    { value: "cashless", label: "Cashless (via Xendit)" },
  ];
  const orderstatopt = [
    { value: "0", label: "Pending" },
    { value: "1", label: "Paid" },
    { value: "2", label: "Canceled" },
  ];
  const stockoutstatopt = [
    { value: "Barang Habis Pakai", label: "Barang Habis Pakai" },
    { value: "Barang Tidak Habis Pakai", label: "Barang Tidak Habis Pakai" },
  ];
  const diagnoseopt = [
    { value: "Diagnosa Utama", label: "Diagnosa Utama" },
    { value: "Diagnosa Sekunder", label: "Diagnosa Sekunder" },
    { value: "Diagnosa Komplikasi", label: "Diagnosa Komplikasi" },
  ];
  return { limitopt, genderopt, levelopt, usrstatopt, unitopt, houropt, postatopt, pocstatopt, reservstatopt, paymentstatopt, paymenttypeopt, orderstatopt, stockoutstatopt, diagnoseopt };
};

export const useAlias = () => {
  const paymentAlias = (status) => {
    return status === "1" ? "Exist" : status === "2" ? "Paid" : status === "3" ? "Canceled" : "Pending";
  };
  const orderAlias = (status) => {
    return status === "1" ? "Paid" : status === "2" ? "Canceled" : "Open";
  };
  const invoiceAlias = (status) => {
    return status === "1" ? "Lunas" : status === "2" ? "Dibatalkan" : "Belum Lunas";
  };
  const poAlias = (status) => {
    return status === "1" ? "Pending" : status === "2" ? "Sent" : status === "3" ? "Done" : status === "4" ? "Rejected" : "Open";
  };
  const usrstatAlias = (status) => {
    return status === "0" ? "Aktif" : "Pending";
  };
  const reservAlias = (status) => {
    return status === "1" ? "Completed" : status === "2" ? "Reschedule" : status === "3" ? "Canceled" : "Pending";
  };
  return { paymentAlias, orderAlias, invoiceAlias, poAlias, usrstatAlias, reservAlias };
};
