const updateCartCount = async () => {
  try {
    const response = await fetch("/cartData");
    const result = await response.json();
    const badge = document.getElementById("cart-count");
    if (!badge) return;

    if (result.status && result.data && result.data.items) {
      const totalItems = result.data.items.reduce(
        (total, item) => total + item.quantity,
        0,
      );
      badge.textContent = totalItems;
    } else {
      badge.textContent = 0;
    }
  } catch (error) {
    console.log("Cart count error:", error);
  }
};

document.addEventListener("DOMContentLoaded", updateCartCount);
