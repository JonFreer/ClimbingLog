export async function checkAuth() {
  const response = await fetch("/api/users/me", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!response.ok) {
    // throw new Error('Failed to fetch user data');
    return false;
  }

  const userData = await response.json();
  return userData;
}
