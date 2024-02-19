import axios from "axios";

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

    console.log("Login Response:", response.data);

    const responseData = response.data;

    if (!responseData.error) {
      const userData = responseData.data[0];
      const { secret, level } = userData;

      sessionStorage.setItem("isLoggedIn", "true");
      sessionStorage.setItem("username", username);
      sessionStorage.setItem("secret", secret);
      sessionStorage.setItem("level", level);
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

export const handleLogout = () => {
  try {
    sessionStorage.removeItem("isLoggedIn");
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("secret");
    sessionStorage.removeItem("level");

    console.log("Successfully logged out.");
  } catch (error) {
    console.error("Error during logout:", error);
  }
};

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

export async function handleLoginLog(ipAddress) {
  try {
    const username = sessionStorage.getItem("username");
    const userLevel = sessionStorage.getItem("level");

    const formData = new FormData();
    formData.append(
      "data",
      JSON.stringify({
        username,
        level: userLevel,
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

    console.log("Login Log Response:", response.data);
  } catch (error) {
    console.error("Error during login log:", error);
  }
}

export async function handleAddReserve(
  name,
  phone,
  email,
  service,
  typeservice,
  reservationdate,
  reservationtime
) {
  try {
    const userSecret = sessionStorage.getItem("secret");

    const formData = new FormData();
    formData.append(
      "data",
      JSON.stringify({
        secret: userSecret,
        idservice: "1",
        idservicetype: "1",
        idbranch: "2",
        name,
        phone,
        email,
        service,
        typeservice,
        reservationdate,
        reservationtime,
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

    console.log("Reservation CUD Response:", response.data);
  } catch (error) {
    console.error("Error fetching reservation data:", error);
  }
}
