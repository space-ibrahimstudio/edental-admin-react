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

export async function fetchUserData() {
  try {
    const userSecret = sessionStorage.getItem("secret");

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

    console.log("User Data:", response.data);

    return response.data.data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
}

export async function fetchUserBooking(limit, hal) {
  try {
    const userSecret = sessionStorage.getItem("secret");

    const formData = new FormData();
    formData.append(
      "data",
      JSON.stringify({
        secret: userSecret,
        limit: limit.toString(),
        hal: hal.toString(),
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

    console.log("User Booking Data:", response.data);

    return response.data.data;
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    throw error;
  }
}

export async function fetchCustData(limit, hal) {
  try {
    const userSecret = sessionStorage.getItem("secret");

    const formData = new FormData();
    formData.append(
      "data",
      JSON.stringify({
        secret: userSecret,
        limit: limit.toString(),
        hal: hal.toString(),
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

    console.log("Customer Data:", response.data);

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

export async function fetchOrderData() {
  try {
    const userSecret = sessionStorage.getItem("secret");

    const formData = new FormData();
    formData.append("data", JSON.stringify({ secret: userSecret }));

    const response = await axios.post(
      `${baseUrl}/edental_api/office/vieworder`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log("Order Data:", response.data);
  } catch (error) {
    console.error("Error fetching order data:", error);
    throw error;
  }
}
