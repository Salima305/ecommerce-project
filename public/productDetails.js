document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");
  getProductDetails(productId);
});
const getProductDetails = (productId) => {
  fetch(`/getproductDetails?id=${productId}`)
    .then((response) => response.json())
    .then((productData) => {
      if (!productData.status) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Product data not found",
        });
      } else {
        const product = productData.data.product;

        document.getElementById("productTitle").innerText = product.name;
        document.getElementById("productPrice").innerText = `₹${product.price}`;
        document.getElementById("productDescription").innerText =
          product.description;
        document.getElementById("productImage").src =
          `/uploads/${product.image[0]}`;
        const thumbnailContainer =
          document.getElementById("thumbnailContainer");
        thumbnailContainer.innerHTML = "";
        product.image.forEach((img, index) => {
          thumbnailContainer.innerHTML += `
      <img src="/uploads/${img}" class="thumbnail ${index === 0 ? "active" : ""}" onclick="changeImage(this)">`;
        });
        document.getElementById("sealImage").src = "/sampleseal.jpeg";
      }
    })
    .catch((error) => {
      console.log(error);
    });
};

function changeImage(element) {
  document.getElementById("productImage").src = element.src;
  const thumbnails = document.querySelectorAll(".thumbnail");
  thumbnails.forEach((thumb) => {
    thumb.classList.remove("active");
  });

  element.classList.add("active");
}

const image = document.getElementById("productImage");
image.addEventListener("mousemove", (e) => {
  const x = (e.offsetX / image.offsetWidth) * 100;
  const y = (e.offsetY / image.offsetHeight) * 100;
  image.style.transformOrigin = `${x}% ${y}%`;
  image.style.transform = "scale(3)";
});
image.addEventListener("mouseleave", () => {
  image.style.transform = "scale(1)";
});

window.addToCart = async () => {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");
  const btn = document.getElementById("addToCartBtn");

  btn.textContent = "ADDING...";
  btn.disabled = true;

  try {
    const response = await fetch("/addToCart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });

    const result = await response.json();
    console.log(result);
    if (result.status) {
      btn.textContent = "ADDED TO BAG ✓";
      btn.style.background = "#4a7a4a";
      setTimeout(() => {
        window.location.href = "/cart";
      }, 800);
    } else {
      btn.textContent = "ADD TO BAG";
      btn.disabled = false;
      if(result.message==="Please login first"){
       window.location.href = `/login?redirect=${window.location.pathname + window.location.search}`;
      }else{
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: result.message,
      });
    }
  }
  } catch (error) {
    console.log(error);
    btn.textContent = "ADD TO BAG";
    btn.disabled = false;
  }
};
