const sidebarLinks = document.querySelectorAll(".sidebar-nav a[data-tab]");
const tabPanels = document.querySelectorAll(".tab-panel");
sidebarLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const target = link.dataset.tab;
    sidebarLinks.forEach((link) => {
      link.classList.remove("active");
    });
    tabPanels.forEach((panel) => {
      panel.classList.remove("active");
    });
    link.classList.add("active");
    const matchingPanel = document.getElementById(`tab-${target}`);
    matchingPanel.classList.add("active");
  });
});

document.addEventListener("DOMContentLoaded", () => {
  getprofileData();
  getAddress();
  getMyOrders();
});
const toastBox = document.getElementById("toastBox");
console.log(toastBox);
const successMsg = "Profile saved successfully";

function showToast(msg) {
  console.log(msg);
  const toast = document.createElement("div");

  toast.classList.add("custom-toast");
  toast.innerHTML = msg;

  toastBox.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

const getprofileData = async () => {
  const response = await fetch("/profileData");
  const result = await response.json();
  const user = result.data;
  document.getElementById("firstName").value = result.data.firstName||""
  document.getElementById("lastName").value = result.data.lastName||""
  document.getElementById("email").value = result.data.email;
  document.getElementById("phoneNumber").value = result.data.phone||""
  document.getElementById("dob").value = result.data.dob?result.data.dob.slice(0, 10):""

  const firstLetter = user.firstName?user.firstName.charAt(0).toUpperCase():user.name.charAt(0).toUpperCase()
  document.querySelector(".avatar-placeholder").innerText = firstLetter;
  document.getElementById("sidebar-name").innerText =user.firstName?
    `${user.firstName} ${user.lastName}`:user.name
};

document.getElementById("save-profile").addEventListener("click", () => {
  updateProfile();
});
const updateProfile = async () => {
  console.log("update running");
  const firstName = document.getElementById("firstName").value;
  const lastName = document.getElementById("lastName").value;
  const email = document.getElementById("email").value;
  const phone = document.getElementById("phoneNumber").value;
  const dob = document.getElementById("dob").value;
  const response = await fetch("/updateProfile", {
    headers: {
      "Content-Type": "application/json",
    },
    method: "PATCH",
    body: JSON.stringify({
      firstName,
      lastName,
      phone,
      email,
      dob,
    }),
  });
  const result = await response.json();
  if (result.status) {
    showToast("Profile updated");
  } else {
    showToast("Update failed");
  }
};

const addAddress = async () => {
  const fullName = document.getElementById("fullName").value;
  const phone = document.getElementById("phone").value;
  const house = document.getElementById("house").value;
  const area = document.getElementById("area").value;
  const landmark = document.getElementById("landmark").value;
  const city = document.getElementById("city").value;
  const state = document.getElementById("state").value;
  const pincode = document.getElementById("pincode").value;

  const response = await fetch("/addAddress", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      fullName,
      phone,
      house,
      area,
      landmark,
      city,
      state,
      pincode,
    }),
  });
  const result = await response.json();
  console.log(result);
  if (result.status) {
    showToast("Address saved successfully");
    getAddress();
  } else {
    showToast(result.message);
  }
};

const getAddress = async () => {
  const response = await fetch("/getAddress");
  const result = await response.json();
  console.log(result);
  const container = document.getElementById("addressContainer");
  container.innerHTML = "";
  result.addresses.forEach((address) => {
    container.innerHTML += `
      <div class="address-card">
     <div class="address-name">
      ${address.fullName}
     </div>
 <div class="address-lines">
      ${address.house}<br>
      ${address.area}<br>
      ${address.city}<br>
${address.state} </br>
 ${address.pincode}<br>
${address.phone}
        <button class="delete-address" data-id="${address._id}">Delete</button>
         <button class="edit-address" data-id="${address._id}"
         data-fullname="${address.fullName}"
         data-phone="${address.phone}"
         data-house="${address.house}"
         data-area="${address.area}"
         data-state="${address.state}"
         data-city="${address.city}"
         data-pincode="${address.pincode}"
         data-landmark="${address.landmark}"
          >Edit</button>

        </div>
         </div>`;
  });
};

document
  .getElementById("addressContainer")
  .addEventListener("click", async (e) => {
    if (e.target.classList.contains("delete-address")) {
      const id = e.target.dataset.id;
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "This address will be deleted",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it",
      });
      if (result.isConfirmed) {
        await fetch(`/address/${id}`, {
          method: "DELETE",
        });
        getAddress();
        showToast("Address deleted");
      }
    }

    if (e.target.classList.contains("edit-address")) {
      const btn = e.target;
      document.getElementById("edit-id").value = btn.dataset.id;
      document.getElementById("edit-fullName").value = btn.dataset.fullname;
      document.getElementById("edit-phone").value = btn.dataset.phone;
      document.getElementById("edit-area").value = btn.dataset.area;
      document.getElementById("edit-landmark").value = btn.dataset.landmark;
      document.getElementById("edit-house").value = btn.dataset.house;
      document.getElementById("edit-city").value = btn.dataset.city;
      document.getElementById("edit-pincode").value = btn.dataset.pincode;
      document.getElementById("edit-state").value = btn.dataset.state;

      const modal = new bootstrap.Modal(
        document.getElementById("editAddressModal"),
      );
      modal.show();
    }
  });

const saveEditAddress = async () => {
  const id = document.getElementById("edit-id").value;
  const response = await fetch(`/address/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fullName: document.getElementById("edit-fullName").value,
      phone: document.getElementById("edit-phone").value,
      house: document.getElementById("edit-house").value,
      area: document.getElementById("edit-area").value,
      landmark: document.getElementById("edit-landmark").value,
      city: document.getElementById("edit-city").value,
      state: document.getElementById("edit-state").value,
      pincode: document.getElementById("edit-pincode").value,
    }),
  });

  const result = await response.json();
  if (result.status) {
    showToast("Address updated");
    getAddress();
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("editAddressModal"),
    );
    modal.hide();
  } else {
    showToast("Update failed");
  }
};

const getMyOrders = async () => {
  const response = await fetch("/myOrders");
  const result = await response.json();
  const container = document.getElementById("tab-orders");
  container.innerHTML = 
  '<p class="section-title">Order History</p>';

  if (!result.order || result.order.length === 0) {
    container.innerHTML += 
    `<p style="color:var(--muted)">No orders yet.</p>`;
    return;
  }

  result.order.forEach((order) => {
    const firstItem = order.items[0];
    const image =
      firstItem.image && firstItem.image[0]
        ? firstItem.image[0]
        : "placeholder.jpeg";
    const date = new Date(order.createdAt).toLocaleDateString("en-IN");
    const statusClass =
      {
        pending: "status-processing",
        paid: "status-shipped",
        delivered: "status-delivered",
      }[order.status] || "status-processing";

    container.innerHTML += `
        <div class="order-item" 
             onclick="window.location.href='/orders/${order._id}'">
            <img src="/uploads/${image}" class="order-thumb">
            <div>
                <div class="order-name">${firstItem.name}</div>
                <div class="order-meta">
                    Order #${order._id.toString().slice(-8).toUpperCase()} 
                    &nbsp;·&nbsp; ${date}
                </div>
                ${
                  order.items.length > 1
                    ? `<div class="order-meta">+${order.items.length - 1} more item(s)</div>`
                    : ""
                }
            </div>
            <div class="order-right">
                <span class="order-status ${statusClass}">
                    ${order.status.toUpperCase()}
                </span>
                <span class="order-price">
                    ₹${order.pricing.total.toLocaleString("en-IN")}
                </span>
            </div>
        </div>`;
  });
};
