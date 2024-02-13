import React, { useState } from "react";
import axios from "axios";

const SubmitReservation = () => {
  const [formData, setFormData] = useState({
    secret: "fb6da2c12b5ff63398304d1e8298f767f8c46c0a1cfac6fe8afddf77f7a89b05",
    idservice: "1",
    idservicetype: "1",
    idbranch: "2",
    name: "",
    phone: "",
    email: "",
    service: "reservation",
    typeservice: "reservation",
    reservationdate: "",
    reservationtime: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "https://ankabuttech.com/edental_api/office/cudreservation",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log(JSON.stringify(response.data));
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="name"
        placeholder="Name"
        value={formData.name}
        onChange={handleChange}
      />
      <input
        type="text"
        name="phone"
        placeholder="Phone"
        value={formData.phone}
        onChange={handleChange}
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
      />
      <input
        type="date"
        name="reservationdate"
        value={formData.reservationdate}
        onChange={handleChange}
      />
      <input
        type="time"
        name="reservationtime"
        value={formData.reservationtime}
        onChange={handleChange}
      />
      <button type="submit">Add Reservation</button>
    </form>
  );
};

export default SubmitReservation;
