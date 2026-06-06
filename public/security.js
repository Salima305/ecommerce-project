const changePassword = async () => {
  const currentPassword = document.getElementById("currPass").value;
  const newPassword = document.getElementById("newPass").value;
  const confirmPassword = document.getElementById("confPass").value;

if (!currentPassword || !newPassword || !confirmPassword) {
  showToast("All fields are required");
  return;
}

  if (newPassword !== confirmPassword) {
    showToast("Passwords do not match");
    return;
  }

  if (newPassword.length < 8) {
    showToast("Password must be at least 8 characters");
    return;
  }
  

  const response = await fetch("/changepassword", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      currentPassword,
      newPassword,
      confirmPassword,
    }),
  });

  const result = await response.json();
  if (result.status) {
    showToast("Password updated");
    document.getElementById("currPass").value = "";
    document.getElementById("newPass").value = "";
    document.getElementById("confPass").value = "";
  } else {
    showToast(result.message);
  }
};
document
  .getElementById("change-pass-btn")
  .addEventListener("click", changePassword);
