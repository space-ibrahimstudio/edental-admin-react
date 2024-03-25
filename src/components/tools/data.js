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
      console.log("Tab menus data:", response.data);

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
    formData.append(
      "data",
      JSON.stringify({
        secret: userSecret,
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

    console.log("User data:", response.data);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
}

export async function fetchHoursList() {
  const availableHours = [
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
    "18:00",
    "18:30",
    "19:00",
  ];

  return availableHours;
}

export async function fetchReserveList(page, limit) {
  try {
    const userSecret = sessionStorage.getItem("secret");

    const formData = new FormData();
    formData.append(
      "data",
      JSON.stringify({
        secret: userSecret,
        limit: limit.toString(),
        hal: page.toString(),
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

    console.log("Reservation list:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching reservation list:", error);
    throw error;
  }
}

export async function fetchCustList(page, limit) {
  try {
    const userSecret = sessionStorage.getItem("secret");

    const formData = new FormData();
    formData.append(
      "data",
      JSON.stringify({
        secret: userSecret,
        limit: limit.toString(),
        hal: page.toString(),
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

    console.log("Customer list:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching customer list:", error);
    throw error;
  }
}

export async function fetchAllCustList() {
  try {
    const userSecret = sessionStorage.getItem("secret");

    const formData = new FormData();
    formData.append(
      "data",
      JSON.stringify({
        secret: userSecret,
      })
    );

    const response = await axios.post(
      `${baseUrl}/edental_api/office/searchcustomer`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log("All customer list:", response.data);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching all customer list:", error);
    throw error;
  }
}

export async function fetchIPAddress() {
  try {
    const response = await axios.get("https://api.ipify.org?format=json");
    const ipAddress = response.data.ip;

    sessionStorage.setItem("ipAddress", ipAddress);
    console.log("User IP address:", ipAddress);
    return ipAddress;
  } catch (error) {
    console.error("Error obtaining IP address:", error);
    return "0.0.0.0";
  }
}

export async function fetchOrderList(page, limit) {
  try {
    const userSecret = sessionStorage.getItem("secret");

    const formData = new FormData();
    formData.append(
      "data",
      JSON.stringify({
        secret: userSecret,
        limit: limit.toString(),
        hal: page.toString(),
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

    console.log("Order list:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching order list:", error);
    throw error;
  }
}

export async function fetchServiceList(page, limit) {
  try {
    const userSecret = sessionStorage.getItem("secret");

    const formData = new FormData();
    formData.append(
      "data",
      JSON.stringify({
        secret: userSecret,
        limit: limit.toString(),
        hal: page.toString(),
      })
    );

    const response = await axios.post(
      `${baseUrl}/edental_api/office/viewservice`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log("Service list:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching service list:", error);
    throw error;
  }
}

export async function fetchAllServiceList() {
  try {
    const userSecret = sessionStorage.getItem("secret");

    const formData = new FormData();
    formData.append(
      "data",
      JSON.stringify({
        secret: userSecret,
      })
    );

    const response = await axios.post(
      `${baseUrl}/edental_api/office/searchservice`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log("All service list:", response.data);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching all service list:", error);
    throw error;
  }
}

export async function fetchAllSubServiceList() {
  try {
    const userSecret = sessionStorage.getItem("secret");

    const formData = new FormData();
    formData.append(
      "data",
      JSON.stringify({
        secret: userSecret,
        idservice: "7",
      })
    );

    const response = await axios.post(
      `${baseUrl}/edental_api/office/viewservicetype`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log("All sub service list:", response.data);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching all sub service list:", error);
    throw error;
  }
}

export async function fetchOutletList(page, limit) {
  try {
    const userSecret = sessionStorage.getItem("secret");

    const formData = new FormData();
    formData.append(
      "data",
      JSON.stringify({
        secret: userSecret,
        limit: limit.toString(),
        hal: page.toString(),
      })
    );

    const response = await axios.post(
      `${baseUrl}/edental_api/office/viewoutlet`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log("Branch list:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching branch list:", error);
    throw error;
  }
}

export async function fetchStockList(page, limit) {
  try {
    const userSecret = sessionStorage.getItem("secret");

    const formData = new FormData();
    formData.append(
      "data",
      JSON.stringify({
        secret: userSecret,
        limit: limit.toString(),
        hal: page.toString(),
      })
    );

    const response = await axios.post(
      `${baseUrl}/edental_api/office/viewstock`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log("Stock list:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching stock list:", error);
    throw error;
  }
}

export async function fetchAllCatList() {
  try {
    const userSecret = sessionStorage.getItem("secret");

    const formData = new FormData();
    formData.append(
      "data",
      JSON.stringify({
        secret: userSecret,
      })
    );

    const response = await axios.post(
      `${baseUrl}/edental_api/office/searchcategorystock`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log("All category list:", response.data);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching all category list:", error);
    throw error;
  }
}

export async function fetchLogStock(stockName) {
  try {
    const userSecret = sessionStorage.getItem("secret");

    const formData = new FormData();
    formData.append(
      "data",
      JSON.stringify({
        secret: userSecret,
        stockname: stockName,
      })
    );

    const response = await axios.post(
      `${baseUrl}/edental_api/office/logstock`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log(`${stockName} stock log history data:`, response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching stock log history:", error);
    throw error;
  }
}

export async function fetchCentralPOList(page, limit) {
  try {
    const userSecret = sessionStorage.getItem("secret");

    const formData = new FormData();
    formData.append(
      "data",
      JSON.stringify({
        secret: userSecret,
        limit: limit.toString(),
        hal: page.toString(),
      })
    );

    const response = await axios.post(
      `${baseUrl}/edental_api/office/viewpostock`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log("Central PO list:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching central PO list:", error);
    throw error;
  }
}
