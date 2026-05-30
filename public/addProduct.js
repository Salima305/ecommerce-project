document.getElementById("addProductBtn").addEventListener("click", async (e) => {
  e.preventDefault();
const formData = new FormData();
formData.append("name", document.getElementById("name").value);
formData.append("price", document.getElementById("price").value);
formData.append("stock", document.getElementById("stock").value);
const category = document.getElementById("category").value;
if (!category) {
  alert("Please select category");
  return;
}
formData.append("category", category);
console.log("CATEGORY VALUE:", category);
formData.append("description", document.getElementById("description").value);

const files = document.getElementById("image").files;

for (let i = 0; i < files.length; i++) {
  formData.append("images", files[i]);
}

const res = await fetch("/admin/products/add", {
  method: "POST",
  body: formData
});

  const result = await res.json();
  
if (res.ok){
  Swal.fire({
    icon: "success",
    title: "Product Added!",
    text: result.message,
    timer:1500,
   showConfirmButton:false
  }).then(() => {
    location.reload();
  });
}else{
  Swal.fire("Error",result.message)
}
});

async function toggleProduct(productId) {

  const result = await Swal.fire({
    title: "Are you sure?",
    text: "You want to change product status",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, continue"
  });

  if (!result.isConfirmed) return;

  const res = await fetch(`/admin/products/toggle/${productId}`, {
    method: "PUT"
  });

  const data = await res.json();

  if (data.success) {

    const row = document.getElementById(`product-${productId}`);
    const statusCell = row.querySelector(".status span"); 
    const button = row.querySelector(".toggle-btn");

    const isBlocked = data.isBlocked;
    button.innerText = isBlocked ? "Unblock" : "Block";

    button.classList.toggle("btn-danger");
    button.classList.toggle("btn-success");

    Swal.fire("Updated!", "Product status changed", "success")
      .then(() => window.location.reload());

  } else {
    Swal.fire("Error", "Something went wrong", "error");
  }
}