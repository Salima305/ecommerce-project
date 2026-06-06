document.addEventListener("DOMContentLoaded", () => {
  getcartData();
});

const getcartData = () => {
  fetch("/cartData")
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      if (!data.status) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Cart data not found",
        });
        return;
      }

      const cart = data.data;
      const cartContainer = document.getElementById("cart-items");
      cartContainer.innerHTML = "";

      if (!cart.items || cart.items.length === 0) {
        document.getElementById("cart-count").textContent = 0;
        cartContainer.innerHTML = `
            <p style="font-family:'Cormorant Garamond',serif;
            font-style:italic;
            color:#4b2e2e;
            font-size:38px;
            padding:40px 0;">
            Your cart is empty 🛒
            </p>`;

        document.getElementById("subtotal").textContent = "₹0";
        document.getElementById("total").textContent = "₹0";
        document.getElementById("shipping").textContent = "₹0";
        return;
      }

      const totalItems = cart.items.reduce(
        (total, item) => total + item.quantity,
        0,
      );

      document.getElementById("cart-count").textContent = totalItems;

      let subtotal = 0;
      cart.items.forEach((item) => {
        const product = item.product;
        if (!product) return;
        const qty = item.quantity;
        const itemTotal = product.price * qty;
        subtotal += itemTotal;

        const image =
          product.image && product.image[0]
            ? product.image[0]
            : "/uploads/placeholder.jpeg";

        cartContainer.innerHTML += `
            <div class="cart-item">
                <img src="/uploads/${image}">
                    <div class="cart-item-info">
                    <h5>${product.name}</h5>
                    <span class="ref">
                        ${product.category?.name || ""}
                    </span>
                <span style="color:red">${product.stock===0?"Out of stock":qty>product.stock? `only ${product.stock} left in stock` :""}</span>
                </div>
                <div class="qty-control">
                    <button onclick="updateQty('${product._id}', -1)">−</button>
                    <span id="qty-${product._id}">
                        ${qty}
                    </span>
                    <button onclick="updateQty('${product._id}', 1)">+</button>
                </div>
                <span class="item-price">
                    ₹${itemTotal.toLocaleString()}
                </span>
                <button class="remove-btn"
                    onclick="removeItem('${product._id}')">
                    ✕
                </button>
                </div>`;
      });
    const shipping = subtotal > 0 ? 50 : 0;
    document.getElementById("subtotal").textContent =
        `₹${subtotal.toLocaleString()}`;
    document.getElementById("shipping").textContent = `₹${shipping}`;
    document.getElementById("total").textContent =
        `₹${(subtotal + shipping).toLocaleString()}`;
    });
};

const updateQty = async (productId, change) => {
  const response = await fetch("/cart/updateQty", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      productId,
      change,
    }),
  });

  const result = await response.json();
  if (result.status) {
    getcartData();
    updateCartCount();
  }
};

window.updateQty = updateQty;

const removeItem = async (productId) => {
  const result = await Swal.fire({
    title: "Are you sure?",
    text: "This address will be deleted",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it",
  });
  if (result.isConfirmed) {
    const response = await fetch("/removeFromCart", {
      method: "POST",
     headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({ productId }),
    });

    const result = await response.json();

    if (result.status) {
      getcartData();
      updateCartCount();
    }
  }
};
window.removeItem = removeItem;

document.getElementById("apply-coupon").addEventListener("click", async () => {
  const code = document.getElementById("coupon-input").value.trim();

  const msg = document.getElementById("coupon-msg");

  const response = await fetch("/applyCoupon", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code }),
  });

  const result = await response.json();

  if (result.status) {
    const shipping = 50;
    const correctTotal = result.finalTotal + shipping;
    document.getElementById("total").textContent =
      `₹${correctTotal.toLocaleString()}`;
    msg.textContent = `Coupon applied — ₹${Math.round(result.discountAmount)} off`;
    document.getElementById("discount").textContent =
      `-₹${Math.round(result.discountAmount).toLocaleString()}`;
    msg.className = "coupon-msg success";
    localStorage.setItem(
      "appliedCoupon",
      JSON.stringify({
        code: code,
        discountAmount: result.discountAmount,
        finalTotal: result.finalTotal,
      }),
    );
  } else {
    localStorage.removeItem("appliedCoupon");
    msg.textContent = result.message;
    msg.className = "coupon-msg error";
  }
});
document.getElementById("checkout-btn").addEventListener("click", () => {
  window.location.href = "/checkout";
});
