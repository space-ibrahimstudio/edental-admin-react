import axios from "axios";

const baseUrl = process.env.REACT_APP_BASE_URL;

export async function fetchTabMenus(showNotifications) {
  try {
    const userSecret = sessionStorage.getItem("secret");
    const userLevel = sessionStorage.getItem("level");

    if (!userSecret || !userLevel) {
      showNotifications(
        "danger",
        "User credentials not found in sessionStorage"
      );
    }

    const formData = new FormData();
    formData.append(
      "data",
      JSON.stringify({ secret: userSecret, level: userLevel })
    );

    const response = await axios.post(
      `${baseUrl}/edental_api/office/viewmenu`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (response.data.error === false) {
      console.log(response.data);

      return response.data.data;
    } else {
      showNotifications("danger", "Error fetching data.");
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    showNotifications("danger", "Error fetching data.");
    throw error;
  }
}

export async function fetchUserData(showNotifications) {
  try {
    const userSecret = sessionStorage.getItem("secret");

    if (!userSecret) {
      showNotifications(
        "danger",
        "User credentials not found in sessionStorage"
      );
    }

    const formData = new FormData();
    formData.append("data", JSON.stringify({ secret: userSecret }));

    const response = await axios.post(
      `${baseUrl}/edental_api/office/viewuser`,
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

export async function fetchUserBooking(showNotifications) {
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
      JSON.stringify({ secret: userSecret, limit: "10", hal: "0" })
    );

    const response = await axios.post(
      `${baseUrl}/edental_api/office/viewreservation`,
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
      `${baseUrl}/edental_api/office/cudreservation`,
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
