import axios from "axios";

const baseUrl = process.env.REACT_APP_BASE_URL;

export async function fetchTabMenus() {
  try {
    const userSecret = sessionStorage.getItem("secret");
    const userLevel = sessionStorage.getItem("level");

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

    if (!response.data.error) {
      console.log("Tab Menus Data:", response.data);

      return response.data.data;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching tab menus:", error);
    throw error;
  }
}

export async function fetchUserData(currentPage, limit, setTotalPages) {
  try {
    const userSecret = sessionStorage.getItem("secret");

    const formData = new FormData();
    formData.append(
      "data",
      JSON.stringify({
        secret: userSecret,
        limit: limit.toString(),
        hal: currentPage - 1,
      })
    );

    const response = await axios.post(
      `${baseUrl}/edental_api/office/viewuser`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    const { TTLPage } = response.data;
    setTotalPages(TTLPage);
    console.log("User Data:", response.data);

    return response.data.data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
}

export async function fetchUserBooking(currentPage, limit, setTotalPages) {
  try {
    const userSecret = sessionStorage.getItem("secret");

    const formData = new FormData();
    formData.append(
      "data",
      JSON.stringify({
        secret: userSecret,
        limit: limit.toString(),
        hal: currentPage - 1,
      })
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

    const { TTLPage } = response.data;
    setTotalPages(TTLPage);
    console.log("User Booking Data:", response.data);

    return response.data.data;
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    throw error;
  }
}

export async function fetchCustData(currentPage, limit, setTotalPages) {
  try {
    const userSecret = sessionStorage.getItem("secret");

    const formData = new FormData();
    formData.append(
      "data",
      JSON.stringify({
        secret: userSecret,
        limit: limit.toString(),
        hal: currentPage - 1,
      })
    );

    const response = await axios.post(
      `${baseUrl}/edental_api/office/viewcustomer`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    const { TTLPage } = response.data;
    setTotalPages(TTLPage);
    console.log("Customer Data:", response.data);

    return response.data.data;
  } catch (error) {
    console.error("Error fetching customer data:", error);
    throw error;
  }
}

export async function checkExistingData() {
  try {
    const userSecret = sessionStorage.getItem("secret");

    const formData = new FormData();
    formData.append(
      "data",
      JSON.stringify({
        secret: userSecret,
        limit: "10000",
        hal: "1",
      })
    );

    const response = await axios.post(
      `${baseUrl}/edental_api/office/viewcustomer`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data.data;
  } catch (error) {
    console.error("Error fetching customer data:", error);
    throw error;
  }
}

export const getIPAddress = async () => {
  try {
    const response = await axios.get("https://api.ipify.org?format=json");
    const ipAddress = response.data.ip;

    sessionStorage.setItem("ipAddress", ipAddress);

    return ipAddress;
  } catch (error) {
    console.error("Error obtaining IP address:", error);
    return "0.0.0.0";
  }
};

export async function fetchOrderData(currentPage, limit, setTotalPages) {
  try {
    const userSecret = sessionStorage.getItem("secret");

    const formData = new FormData();
    formData.append(
      "data",
      JSON.stringify({
        secret: userSecret,
        limit: limit.toString(),
        hal: currentPage - 1,
      })
    );

    const response = await axios.post(
      `${baseUrl}/edental_api/office/vieworder`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    const { TTLPage } = response.data;
    setTotalPages(TTLPage);
    console.log("Order Data:", response.data);

    return response.data.data;
  } catch (error) {
    console.error("Error fetching order data:", error);
    throw error;
  }
}
