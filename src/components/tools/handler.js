import axios from "axios";
import { fetchIPAddress } from "./data";

const baseUrl = process.env.REACT_APP_BASE_URL;

export async function handleLogin(username, password) {
  try {
    const formData = new FormData();
    formData.append("data", JSON.stringify({ username, password }));

    const response = await axios.post(
      `${baseUrl}/edental_api/authapi/login`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log("Login response:", response.data);

    const responseData = response.data;

    if (!responseData.error) {
      const userData = responseData.data[0];
      const { secret, level, idoutlet, outlet_name } = userData;

      sessionStorage.setItem("isLoggedIn", "true");
      sessionStorage.setItem("username", username);
      sessionStorage.setItem("secret", secret);
      sessionStorage.setItem("level", level);
      sessionStorage.setItem("outlet", idoutlet);
      sessionStorage.setItem("outletName", outlet_name);
    } else if (!response.data.status) {
      console.log("Invalid username or password. Please try again.");
    } else {
      console.log(
        "An error occurred during login. Please check your internet connection and try again."
      );
    }
  } catch (error) {
    console.error("Error during login:", error);
  }
}

export async function handleLoginLog(ipAddress) {
  try {
    const username = sessionStorage.getItem("username");
    const level = sessionStorage.getItem("level");

    const formData = new FormData();
    formData.append(
      "data",
      JSON.stringify({
        username,
        level,
        activity: "login",
        ip: ipAddress,
      })
    );

    const response = await axios.post(
      `${baseUrl}/edental_api/authapi/loginlog`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log("Login log response:", response.data);
  } catch (error) {
    console.error("Error during login log:", error);
  }
}

export function handleLogout() {
  try {
    sessionStorage.removeItem("isLoggedIn");
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("secret");
    sessionStorage.removeItem("level");
    sessionStorage.removeItem("ipAddress");
    sessionStorage.removeItem("outletName");

    console.log("Successfully logged out.");
    window.location.href = "/";
  } catch (error) {
    console.error("Error during logout:", error);
  }
}

export async function handleAuth(showNotifications) {
  const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true";

  if (!isLoggedIn) {
    console.log("User is not logged in.");
    return false;
  }

  const userName = sessionStorage.getItem("username");
  const userSecret = sessionStorage.getItem("secrets");
  const userLevel = sessionStorage.getItem("level");
  const userIP = sessionStorage.getItem("ipAddress");
  const userBranch = sessionStorage.getItem("outletName");

  const currentIPAddress = await fetchIPAddress();

  if (
    currentIPAddress === userIP &&
    userName === sessionStorage.getItem("username") &&
    userSecret === sessionStorage.getItem("secrets") &&
    userLevel === sessionStorage.getItem("level") &&
    userBranch === sessionStorage.getItem("outletName")
  ) {
    console.log("User data and IP Address validation successful.");
    return true;
  } else {
    console.log("User data or IP Address mismatch. Logging out ...");
    handleLogout();
    showNotifications(
      "danger",
      "User data or IP Address mismatch. Logging out ..."
    );
    return false;
  }
}

export async function checkLoginStatus() {
  try {
    const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true";

    if (isLoggedIn) {
      const userName = sessionStorage.getItem("username");
      const userSecret = sessionStorage.getItem("secret");
      const userLevel = sessionStorage.getItem("level");

      if (userName && userSecret && userLevel) {
        console.log(`User is logged in. Welcome back, ${userName}!`);
        return true;
      } else {
        console.log("User is not logged in or session expired.");
        return false;
      }
    } else {
      console.log("User is not logged in.");
      return false;
    }
  } catch (error) {
    console.error("Error checking login status:", error);
    return false;
  }
}

export async function handleCUDReserve(inputData, operation, id) {
  try {
    const userSecret = sessionStorage.getItem("secret");
    const idBranch = sessionStorage.getItem("outlet");

    const formData = new FormData();
    formData.append(
      "data",
      JSON.stringify({
        secret: userSecret,
        idservice: "1",
        idservicetype: "1",
        idbranch: idBranch,
        name: inputData.name,
        phone: inputData.phone,
        email: inputData.email,
        service: inputData.service,
        typeservice: inputData.typeservice,
        reservationdate: inputData.reservationdate,
        reservationtime: inputData.reservationtime,
      })
    );

    if (operation === "edit") {
      formData.append("idedit", id);
    } else if (operation === "delete") {
      formData.append("iddelete", id);
    }

    const response = await axios.post(
      `${baseUrl}/edental_api/office/cudreservation`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log("Reservation CUD response:", response.data);
  } catch (error) {
    console.error("Error during reservation CUD:", error);
  }
}

export async function handleCUDService(inputData, operation, id) {
  try {
    const userSecret = sessionStorage.getItem("secret");

    const formData = new FormData();
    formData.append(
      "data",
      JSON.stringify({
        secret: userSecret,
        service: inputData.service,
        layanan: inputData.subService,
      })
    );

    if (operation === "edit") {
      formData.append("idedit", id);
    } else if (operation === "delete") {
      formData.append("iddelete", id);
    }

    const response = await axios.post(
      `${baseUrl}/edental_api/office/cudservice`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log("Service CUD response:", response.data);
  } catch (error) {
    console.error("Error during service CUD:", error);
  }
}

export async function handleCUDBranch(inputData, operation, id) {
  try {
    const userSecret = sessionStorage.getItem("secret");
    const formData = new FormData();
    formData.append(
      "data",
      JSON.stringify({
        secret: userSecret,
        region: inputData.region,
        name: inputData.name,
        address: inputData.address,
        phone: inputData.phone,
        mainregion: inputData.mainregion,
        postcode: inputData.postcode,
        cctr_group: inputData.cctrGroup,
        cctr: inputData.cctr,
        coordinate: inputData.coordinate,
      })
    );

    if (operation === "edit") {
      formData.append("idedit", id);
    } else if (operation === "delete") {
      formData.append("iddelete", id);
    }

    const response = await axios.post(
      `${baseUrl}/edental_api/office/cudoutlet`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log("Branch CUD response:", response.data);
  } catch (error) {
    console.error("Error during branch CUD:", error);
  }
}

export async function handleCUDOrder(inputData, operation, id) {
  try {
    const userSecret = sessionStorage.getItem("secret");

    const formData = new FormData();
    formData.append(
      "data",
      JSON.stringify({
        secret: userSecret,
        layanan: inputData.layanan,
      })
    );

    if (operation === "edit") {
      formData.append("idedit", id);
    } else if (operation === "delete") {
      formData.append("iddelete", id);
    }

    const response = await axios.post(
      `${baseUrl}/edental_api/office/cudorder`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log("Order CUD response:", response.data);
  } catch (error) {
    console.error("Error during order CUD:", error);
  }
}

export async function handleCUDStock(inputData, operation, id) {
  try {
    const userSecret = sessionStorage.getItem("secret");

    const formData = new FormData();
    formData.append(
      "data",
      JSON.stringify({
        secret: userSecret,
        categorystock: inputData.cat,
        subcategorystock: inputData.subCat,
        itemname: inputData.item,
        unit: inputData.satuan,
        stockin: inputData.jumlah,
        value: inputData.nilai,
      })
    );

    if (operation === "edit") {
      formData.append("idedit", id);
    } else if (operation === "delete") {
      formData.append("iddelete", id);
    }

    const response = await axios.post(
      `${baseUrl}/edental_api/office/cudstock`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log("Stock CUD response:", response.data);
  } catch (error) {
    console.error("Error during stock CUD:", error);
  }
}

export async function handleCUDCentralPO(inputData, operation, id) {
  try {
    const userSecret = sessionStorage.getItem("secret");

    const formData = new FormData();
    formData.append(
      "data",
      JSON.stringify({
        secret: userSecret,
        postock: inputData.item,
      })
    );

    if (operation === "edit") {
      formData.append("idedit", id);
    } else if (operation === "delete") {
      formData.append("iddelete", id);
    }

    const response = await axios.post(
      `${baseUrl}/edental_api/office/postock`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log("Central PO CUD response:", response.data);
  } catch (error) {
    console.error("Error during Central PO CUD:", error);
  }
}
