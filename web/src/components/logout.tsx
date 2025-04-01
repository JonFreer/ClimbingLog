import React from "react";

const LogoutButton: React.FC = () => {
  // const handleLogout = () => {
  //     localStorage.removeItem('token');
  //     window.location.href = '/login';
  // };
  const handleLogout = async () => {
    await fetch("/api/auth/jwt/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    localStorage.removeItem("token");
    window.location.href = "/";
  };
  return <button onClick={handleLogout}>Logout</button>;
};

export default LogoutButton;
