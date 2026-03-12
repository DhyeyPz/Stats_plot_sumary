export async function signin(email, password) {
  try {
    // FIX: Changed process.env to import.meta.env
    const response = await fetch(
      `${import.meta.env.VITE_AUTH_SERVER_URL}/api/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Signin failed");
    }

    return data;
  } catch (error) {
    console.error("Signin error:", error);
    throw error;
  }
}

export async function verifyToken(token) {
  try {
    // FIX: Changed process.env to import.meta.env
    const response = await fetch(
      `${import.meta.env.VITE_AUTH_SERVER_URL}/api/auth/verify`,
      {
        method: "POST", // Keeping your POST logic
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Auth Server rejected token:", errorText);
      return false;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Network error during verification:", error.message);
    return false;
  }
}

export async function logout() {
  try {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    localStorage.removeItem("accessible_tenants");
  } catch (error) {
    console.error("Logout error:", error);
  }
}

export function getStoredToken() {
  try {
    return localStorage.getItem("auth_token");
  } catch {
    return null;
  }
}

export function getStoredUser() {
  try {
    const user = localStorage.getItem("auth_user");
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}

export function getAccessibleTenants() {
  try {
    const tenants = localStorage.getItem("accessible_tenants");
    return tenants ? JSON.parse(tenants) : [];
  } catch {
    return [];
  }
}