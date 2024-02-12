import axios from "axios";

const baseUrl = process.env.REACT_APP_BASE_URL;

export async function handleLogin(username, password, showNotifications) {
  try {
    const formData = new FormData();
    formData.append("data", JSON.stringify({ username, password }));

    const response = await axios.post(
      "https://ankabuttech.com/edental_api/authapi/login",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log(response.data);

    const responseData = response.data;

    if (responseData.error === false) {
      const userData = responseData.data[0];
      const { secret, level } = userData;

      sessionStorage.setItem("isLoggedIn", "true");
      sessionStorage.setItem("username", username);
      sessionStorage.setItem("secret", secret);
      sessionStorage.setItem("level", level);

      showNotifications(
        "success",
        `Kamu berhasil login. Selamat datang ${username}!`
      );
    } else if (response.data.status === false) {
      showNotifications(
        "danger",
        "Invalid username or password. Please try again."
      );
    } else {
      showNotifications(
        "danger",
        "Terjadi kesalahan saat login. Mohon periksa koneksi internet kamu dan coba lagi"
      );
    }
  } catch (error) {
    console.error("Error during login:", error);
    showNotifications(
      "danger",
      "Terjadi kesalahan saat login. Mohon periksa koneksi internet kamu dan coba lagi"
    );
  }
}

export const handleLogout = (showNotifications) => {
  try {
    sessionStorage.removeItem("isLoggedIn");
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("secret");
    sessionStorage.removeItem("level");
    console.log("Successfully logged out.");
    showNotifications("success", "Successfully logged out.");
  } catch (error) {
    console.error("Error during logout:", error);
    showNotifications("danger", "Error during logout.");
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
        console.log(`User is logged in. Welcome back ${userName}!`);
        return true;
      } else {
        console.log("User is not logged in or session expired.");
        return false;
      }
    } else {
      console.log("User is not logged in.");
    }
  } catch (error) {
    console.error("Error checking login status:", error);
  }
}
