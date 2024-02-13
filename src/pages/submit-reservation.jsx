import React, { useState } from "react";
import { handleAddReserve } from "../components/tools/handler";

const SubmitReservation = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [service, setService] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await handleAddReserve(
        name,
        phone,
        email,
        service,
        serviceType,
        date,
        time
      );
    } catch (error) {
      console.error("Error occurred during submit reservation:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="name"
        placeholder="Nama Customer"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="text"
        name="phone"
        placeholder="No. Telp"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="text"
        name="service"
        placeholder="Nama Layanan"
        value={service}
        onChange={(e) => setService(e.target.value)}
      />
      <input
        type="text"
        name="serviceType"
        placeholder="Tipe Layanan"
        value={serviceType}
        onChange={(e) => setServiceType(e.target.value)}
      />
      <input
        type="text"
        name="date"
        placeholder="Tanggal Reservasi"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      <input
        type="text"
        name="time"
        placeholder="Jam Reservasi"
        value={time}
        onChange={(e) => setTime(e.target.value)}
      />
      <button type="submit">Add Reservation</button>
    </form>
  );
};

export default SubmitReservation;
