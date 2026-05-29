window.onload = function () {
  const search =
    new URLSearchParams(window.location.search).get("search") || "";
  const category =
    new URLSearchParams(window.location.search).get("category") || "";
  getProductData(search, category);
};
const getProductData = (search = "", category = "") => {
  fetch(`/getProductsData?search=${search}&category=${category}`)
    .then((response) => response.json())
    .then((productData) => {
      console.log(productData);
      if (!productData.status) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Product data not found",
        });
      } else {
        const categories = productData.data.categories;
        const products = productData.data.products;
        const categoryContainer = document.getElementById("categoryList");

        categoryContainer.innerHTML = `<a onclick="getProductData('','')" class="category-name">All</a>`;
        categories.forEach((category) => {
          categoryContainer.innerHTML += `
        <a onclick="getProductData('','${category._id}')">
           <span class="category-name"> ${category.name}</span>
          </a>
        </div>
      `;
        });
        const productContainer = document.getElementById("productList");
        productContainer.innerHTML = "";
        products.forEach((product) => {
          let stockButton = "";

          if (product.stock <= 0) {
            stockButton = `
            <button class="out-stock-btn" disabled>OUT OF STOCK</button>
        `;
        } else {
            stockButton = `<button class="add-cart-btn" onclick="addToCart('${product._id}')">
            ADD TO CART</button>
`;
          }
          productContainer.innerHTML += `
         <div class="product-card">
         <a href="/productDetails?id=${product._id}" >
        <div class="product-image-wrap">
          <img src="/uploads/${product.image[0]}" alt="Product">
        </div>
          </a>
        <div class="product-info">
          <span class="product-name">${product.name}</span>
          <span class="product-price">₹ ${product.price}</span>
          ${stockButton}
        </div>
      </div>
        `;
        });
      }
    })
    .catch((error) => {
      console.log(error);
    });
};

async function addToCart(productId) {
  try {
    const response = await fetch("/addToCart", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({ productId }),
    });

    const result = await response.json();

    console.log(result);

    if (result.status) {
      Swal.fire({
        icon: "success",

        title: "Added to Cart",

        timer: 1200,

        showConfirmButton: false,
      });

      setTimeout(() => {
        window.location.href = "/cart";
      }, 800);
    } else {
      Swal.fire({
        icon: "error",

        title: "Oops...",

        text: result.message,
      });
    }
  } catch (error) {
    console.log(error);
  }
}
