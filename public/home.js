window.onload = function () {
  loadHomeProducts();
};

const loadHomeProducts = () => {
  fetch("/getProductsData")
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
        const products = productData.data.products;

        const row1 = document.getElementById("featuredrow1");
        const row2 = document.getElementById("featuredrow2");
        const row3 = document.getElementById("featuredrow3");
        const bottomGallery = document.getElementById("bottomgallery");

        row1.innerHTML = `
    <div class="featured-item" style="height:480px;">
    <img src="/uploads/coverphoto.jpeg" alt="${products[0].name}">
    <div class="caption-card">
        Golden dreams, crystal gleam. Some things are simply meant to be worn close to the heart.
     </div>
 </div>

 
    `;

        row2.innerHTML = `
    <div class="featured-item" style="height:360px;">
     <img src="/uploads/${products[2].image[0]}" alt="${products[2].name}">
     </div>

     <div class="featured-item" style="height: 360px;">
        <img src="/uploads/${products[3].image[0]}" alt="${products[3].name}">
    </div>
    `;

        row3.innerHTML = `
        <div class="featured-item" style="height: 420px;">
         <img src="/uploads/${products[4].image[0]}" alt="${products[4].name}">
        </div>

    `;
        bottomGallery.innerHTML = `
        <div class="gallery-item">
            <img src="/uploads/store.jpeg" alt="${products[5].name}">
        </div>

       <div class="gallery-item">
            <img src="/uploads/workshop.jpeg" alt="${products[6].name}">
        </div>
      `;
      }
    })
    .catch((error) => {
      console.log(error);
      Swal.fire({
        icon: "error",
        title: "Server Error",
        text: "Something went wrong",
      });
    });
};
