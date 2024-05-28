import axios from "axios";

const baseUrl = process.env.REACT_APP_API_URL;

export async function fetchTabMenus() {
  try {
    const userSecret = sessionStorage.getItem("secret");
    const userLevel = sessionStorage.getItem("level");

    const formData = new FormData();
    formData.append("data", JSON.stringify({ secret: userSecret, level: userLevel }));

    const response = await axios.post(`${baseUrl}/office/viewmenu`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

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

    const response = await axios.post(`${baseUrl}/office/viewuser`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

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

    const response = await axios.post(`${baseUrl}/office/logstock`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log(`${stockName} stock log history data:`, response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching stock log history:", error);
    throw error;
  }
}

export async function fetchDataList(page, limit, apiEndpoint) {
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

    const response = await axios.post(`${baseUrl}/office/${apiEndpoint}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log(`${apiEndpoint} list:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${apiEndpoint} list:`, error);
    throw error;
  }
}

export async function fetchStockPO(page, limit, status, apiEndpoint) {
  try {
    const userSecret = sessionStorage.getItem("secret");

    const formData = new FormData();
    formData.append(
      "data",
      JSON.stringify({
        secret: userSecret,
        limit: limit.toString(),
        hal: page.toString(),
        status:
          status === "open" ? 0 : status === "pending" ? 1 : status === "sending" ? 2 : status === "complete" ? 3 : status === "rejected" ? 4 : 0,
      })
    );

    const response = await axios.post(`${baseUrl}/office/${apiEndpoint}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log(`${apiEndpoint} list:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${apiEndpoint} list:`, error);
    throw error;
  }
}

export async function fetchAllDataList(apiEndpoint) {
  try {
    const userSecret = sessionStorage.getItem("secret");

    const formData = new FormData();
    formData.append(
      "data",
      JSON.stringify({
        secret: userSecret,
      })
    );

    const response = await axios.post(`${baseUrl}/office/${apiEndpoint}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log(`All ${apiEndpoint} list:`, response.data);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching all ${apiEndpoint} list:`, error);
    throw error;
  }
}

export async function fetchDentistList(apiEndpoint, outletCode) {
  try {
    const userSecret = sessionStorage.getItem("secret");
    const formData = new FormData();
    formData.append(
      "data",
      JSON.stringify({
        secret: userSecret,
        kodeoutlet: outletCode,
      })
    );

    const response = await axios.post(`${baseUrl}/office/${apiEndpoint}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log(`All ${apiEndpoint} list:`, response.data);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching all ${apiEndpoint} list:`, error);
    throw error;
  }
}

export async function fetchSearchData(apiEndpoint, query) {
  try {
    const userSecret = sessionStorage.getItem("secret");

    const formData = new FormData();
    formData.append(
      "data",
      JSON.stringify({
        secret: userSecret,
        item: query,
      })
    );

    const response = await axios.post(`${baseUrl}/office/${apiEndpoint}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log(`All ${apiEndpoint} list:`, response.data);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching all ${apiEndpoint} list:`, error);
    throw error;
  }
}

export async function fetchAvailableTimes(apiEndpoint, date) {
  try {
    const formData = new FormData();
    formData.append("tgl", date);

    const response = await axios.post(`${baseUrl}/main/main`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log(`All ${apiEndpoint} list:`, response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching available times:", error);
    throw error;
  }
}
