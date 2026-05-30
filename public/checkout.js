const getCheckoutData = async () => {
  const response = await fetch("/getCheckoutData");
  const result = await response.json();
  console.log(result);
  if (result.status) {
    renderCheckoutItems(result.cart.items);
  }
};

const renderCheckoutItems = (items) => {
  const container = document.getElementById("summary-items");
  container.innerHTML = "";
  let subtotal = 0;
  items.forEach((item) => {
    const product = item.product;
    const qty = item.quantity;
    const itemTotal = product.price * qty;
    subtotal += itemTotal;

    const image =
      product.image && product.image[0]
        ? product.image[0]
        : "/uploads/placeholder.jpeg";
    container.innerHTML += `
    <div class="summary-item">
         <img 
            class="summary-item-img" 
            src="/uploads/${image}" 
         >

         <div class="summary-item-info">

            <div class="name">
               ${product.name}
            </div>

            <div class="qty">
              QTY  ${qty}
            </div>

         </div>

         <div class="summary-item-price">
            ₹ ${(product.price * qty).toLocaleString()}
         </div>

      </div>  `;
  });
  const shipping = subtotal > 0 ? 50 : 0;
  document.getElementById("subtotal").textContent =
    `₹${subtotal.toLocaleString()}`;
  document.getElementById("shipping").textContent = `₹${shipping}`;
  document.getElementById("total").textContent =
    `₹${(subtotal + shipping).toLocaleString()}`;

  const savedCoupon = localStorage.getItem("appliedCoupon");
  if (savedCoupon) {
    const coupon = JSON.parse(savedCoupon);
    const correctTotal = coupon.finalTotal + shipping;
    document.getElementById("discount").textContent =
      `-₹${Math.round(coupon.discountAmount).toLocaleString(0)}`;
    document.getElementById("total").textContent =
      `₹${Math.round(correctTotal).toLocaleString()}`;
  }
};

const getAddress = async () => {
  const response = await fetch("/getAddress");
  const result = await response.json();

  console.log(result);
  const container = document.getElementById("addressContainer");
  result.addresses.forEach((address) => {
    container.innerHTML += `

<div class="address-card">

   <label class="address-option">

      <input
         type="radio"
         value="${address._id}"
         name="shippingAddress"
      >

      <div class="address-content">

         <h3>${address.fullName}</h3>

         <p>${address.phone}</p>

         <p>
            ${address.house},
            ${address.landmark},
            ${address.area},
            ${address.city},
            ${address.state}
         </p>

         <p>${address.pincode}</p>

      </div>

   </label>

</div>
`;
  });
  const firstRadio = document.querySelector('input[name="shippingAddress"]');

  if (firstRadio) {
    firstRadio.checked = true;
  }
};

const placeOrderBtn = document.getElementById("place-order-btn");

placeOrderBtn.addEventListener("click", async (e) => {
  e.preventDefault();

  const selectedAddress = document.querySelector(
    'input[name="shippingAddress"]:checked',
  );
  if (!selectedAddress) {
    Swal.fire({
      icon: "warning",
      title: "Select Address",
      text: "Please select a delivery address.",
    });
    return;
  }

  const selectedDelivery = document.querySelector(
    'input[name="deliveryMethod"]:checked',
  );

  const selectedPayment = document.querySelector(
    'input[name="paymentMethod"]:checked',
  );
  if (!selectedPayment) {
    Swal.fire({
      icon: "warning",
      title: "Select Payment Method",
      text: "Please select a payment method.",
    });
    return;
  }
  const savedCoupon = localStorage.getItem("appliedCoupon");
  const discountAmount = savedCoupon
    ? JSON.parse(savedCoupon).discountAmount
    : 0;
  const couponCode = savedCoupon ? JSON.parse(savedCoupon).code : null;

  if (selectedPayment.value === "cod") {
    const response = await fetch("/placeOrder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        addressId: selectedAddress.value,
        paymentMethod: "cod",
        discountAmount,
        couponCode,
      }),
    });
    const result = await response.json();

    if (result.status) {
      localStorage.removeItem("appliedCoupon");
      window.location.href = `/order-confirmation/${result.orderId}`;
    } else {
      if (!result.status) {
        Swal.fire({
          icon: "error",
          title: "Order Failed",
          text: result.message,
        });
      }
      return;
    }
  }
  if (selectedPayment.value === "razorpay") {
    const savedCoupon = localStorage.getItem("appliedCoupon");

    const discountAmount = savedCoupon
      ? JSON.parse(savedCoupon).discountAmount
      : 0;

    const couponCode = savedCoupon ? JSON.parse(savedCoupon).code : null;

    const response = await fetch("/placeOrder", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        addressId: selectedAddress.value,
        paymentMethod: selectedPayment.value,
      }),
    });

    const result = await response.json();

    if (result.status) {
      const finalDiscount = discountAmount;
      const finalCoupon = couponCode;

      const options = {
        modal: {
          ondismiss: function () {
            Swal.fire({
              icon: "info",
              title: "Payment Cancelled",
              text: result.message,
            });
          },
        },

        key: "rzp_test_SsCPy8lpMDLqe7",
        amount: result.razorpayOrder.amount,
        currency: result.razorpayOrder.currency,
        order_id: result.razorpayOrder.id,
        name: "Emprtz",
        description: "Order Payment",

        handler: async function (response) {
          if (
            !response.razorpay_payment_id ||
            !response.razorpay_order_id ||
            !response.razorpay_signature
          ) {
            Swal.fire({
              icon: "error",
              title: "Payment Failed",
            });

            return;
          }

          try {
            const verifyRes = await fetch("/checkout/verify-payment", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },

              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                addressId: selectedAddress.value,
                discountAmount: finalDiscount,
                couponCode: finalCoupon,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              localStorage.removeItem("appliedCoupon");
              window.location.href = `/order-confirmation/${verifyData.orderId}`;
            } else {
              if (!verifyData.success) {
                Swal.fire({
                  icon: "error",
                  title: "Order Error",
                  text:
                    verifyData.message ||
                    "Order could not be saved. Refund initiated.",
                });
              }

              placeOrderBtn.disabled = false;
              placeOrderBtn.textContent = "PLACE ORDER";
            }
          } catch (err) {
            console.log(err);

            Swal.fire({
              icon: "error",
              title: "Connection Lost",
              text: "Please contact support.",
            });

            placeOrderBtn.disabled = false;
            placeOrderBtn.textContent = "PLACE ORDER";
          }
        },
      };

      const rzp = new Razorpay(options);

      rzp.open();
    }
  }
});

function switchTab(tab) {
  document.querySelectorAll(".payment-tab").forEach((btn) => {
    btn.classList.remove("active");
  });

  document.querySelectorAll(".payment-panel").forEach((panel) => {
    panel.classList.remove("active");
  });

  const activeBtn = document.getElementById(`tab-${tab}`);
  activeBtn.classList.add("active");
  const radio = activeBtn.querySelector("input");
  radio.checked = true;
  document.getElementById(`panel-${tab}`).classList.add("active");
}

document.addEventListener("DOMContentLoaded", () => {
  getCheckoutData();
  getAddress();
});
