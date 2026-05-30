document.addEventListener("DOMContentLoaded", () => {
  window.addCoupon = async function () {
    const code = document.getElementById("code").value;
    const discount = document.getElementById("discount").value;
    const minAmount = document.getElementById("minAmount").value;
    const maxAmount = document.getElementById("maxAmount").value;
    const expiryDate = document.getElementById("expiry").value;

    if (!code || !discount || !minAmount || !maxAmount || !expiryDate) {
      return Swal.fire("Error", "Fill all fields", "error");
    }

    const res = await fetch("/admin/coupons/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        discount,
        minAmount,
        maxAmount,
        expiryDate,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      Swal.fire({
        icon: "success",
        title: "Coupon Added!",
        timer: 1500,
        showConfirmButton: false,
      }).then(() => location.reload());
    } else {
      Swal.fire("Error", data.message, "error");
    }
  };

  window.editCoupon = function (
    id,
    code,
    discount,
    minAmount,
    maxAmount,
    expiryDate,
  ) {
    document.getElementById("editCouponId").value = id;
    document.getElementById("code").value = code;
    document.getElementById("discount").value = discount;
    document.getElementById("minAmount").value = minAmount;
    document.getElementById("maxAmount").value = maxAmount;
    document.getElementById("expiry").value = new Date(expiryDate)
      .toISOString()
      .split("T")[0];

    document.querySelector("[onclick='addCoupon()']").classList.add("d-none");
    document.getElementById("updateCouponBtn").classList.remove("d-none");
  };

  window.toggleCoupon = async function (id) {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Change coupon status?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
    });

    if (!result.isConfirmed) return;

    const res = await fetch(`/admin/coupons/toggle/${id}`, { method: "PUT" });

    if (res.ok) {
      Swal.fire({
        icon: "success",
        title: "Updated!",
        timer: 1500,
        showConfirmButton: false,
      }).then(() => location.reload());
    }
  };
});

window.updateCoupon = async function () {
  const id = document.getElementById("editCouponId").value;
  const code = document.getElementById("code").value;
  const discount = document.getElementById("discount").value;
  const minAmount = document.getElementById("minAmount").value;
  const maxAmount = document.getElementById("maxAmount").value;
  const expiryDate = document.getElementById("expiry").value;

  if (!code || !discount || !minAmount || !maxAmount || !expiryDate) {
    return Swal.fire("Error", "Fill all fields", "error");
  }

  const res = await fetch(`/admin/coupons/edit/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, discount, minAmount, maxAmount, expiryDate }),
  });

  const data = await res.json();

  if (res.ok) {
    Swal.fire({
      icon: "success",
      title: "Coupon Updated!",
      timer: 1500,
      showConfirmButton: false,
    }).then(() => location.reload());
  } else {
    Swal.fire("Error", data.message, "error");
  }
};
