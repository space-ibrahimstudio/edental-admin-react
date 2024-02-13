import axios from "axios";

export async function fetchReserveCUD(showNotifications) {
  try {
    const userSecret = sessionStorage.getItem("secret");

    if (!userSecret) {
      showNotifications(
        "danger",
        "User credentials not found in sessionStorage"
      );
    }

    const formData = new FormData();
    formData.append(
      "data",
      JSON.stringify({
        secret: userSecret,
        idservice: "1",
        idservicetype: "1",
        idbranch: "2",
        name: "name",
        phone: "081386118382",
        email: "email@email.com",
        service: "reservation",
        typeservice: "reservation",
        reservationdate: "2020-02-03",
        reservationtime: "10.00",
      })
    );
    formData.append("idedit", "");
    formData.append("iddelete", "");

    const response = await axios.post(
      "https://ankabuttech.com/edental_api/office/cudreservation",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log(response.data);

    return response.data.data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    showNotifications("danger", "Error fetching data.");
    throw error;
  }
}
