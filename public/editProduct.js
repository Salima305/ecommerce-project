document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".editBtn");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      document.getElementById("editId").value = btn.dataset.id;
      document.getElementById("editName").value = btn.dataset.name;
      document.getElementById("editPrice").value = btn.dataset.price;
      document.getElementById("editStock").value = btn.dataset.stock;
      document.getElementById("editCategory").value = btn.dataset.category;
      console.log(
        "category set to:",
        document.getElementById("editCategory").value,
      );
      document.getElementById("editDescription").value =
        btn.dataset.description;

      const images = JSON.parse(btn.dataset.images || "[]");
      const container = document.getElementById("currentImages");
      container.innerHTML = "";
      images.forEach((img) => {
        container.innerHTML += `
    <div style="position:relative; display:inline-block;">
      <img src="/uploads/${img}" width="60" style="border-radius:4px; margin:2px;">
      <button type="button" onclick="deleteImage('${img}')" 
        style="position:absolute; top:-5px; right:-5px; background:red; color:white; border:none; border-radius:50%; width:18px; height:18px; font-size:10px; cursor:pointer;">
        ✕
      </button>
    </div>
  `;
      });
      const modal = new bootstrap.Modal(document.getElementById("editModal"));
      modal.show();
    });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const updateBtn = document.getElementById("updateBtn");
  if (!updateBtn) return;
  if (updateBtn) {
    updateBtn.addEventListener("click", async () => {
      const confirm = await Swal.fire({
        title: "Are you sure?",
        text: "Do you want to update this product?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, update it",
      });

      if (!confirm.isConfirmed) return;

      const id = document.getElementById("editId").value;
      const formData = new FormData();

      formData.append("name", document.getElementById("editName").value);
      formData.append("price", document.getElementById("editPrice").value);
      formData.append("stock", document.getElementById("editStock").value);
      formData.append(
        "category",
        document.getElementById("editCategory").value,
      );
      formData.append(
        "description",
        document.getElementById("editDescription").value,
      );

      const files = document.getElementById("editImage").files;
      for (let i = 0; i < files.length; i++) {
        formData.append("images", files[i]);
      }
      bootstrap.Modal.getInstance(document.getElementById("editModal")).hide();

      Swal.fire({
        title: "Updating...",
        text: "Please wait",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      try {
        const res = await fetch(`/admin/products/edit/${id}`, {
          method: "PUT",
          body: formData,
        });

        const result = await res.json();

        if (res.ok) {
          Swal.fire({
            icon: "success",
            title: "Updated!",
            text: result.message,
            timer: 1500,
            showConfirmButton: false,
          }).then(() => location.reload());
        } else {
          Swal.fire("Error", "Update failed", "error");
        }
      } catch (err) {
        Swal.fire("error", "something went wrong", "error");
      }
    });
  }
});

async function deleteImage(filename) {
  const id = document.getElementById("editId").value;

  const confirmed = await Swal.fire({
    title: "Delete Image?",
    text: "This cannot be undone!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it",
    confirmButtonColor: "#d33",
  });

  if (!confirmed.isConfirmed) return;
  const res = await fetch(`/admin/products/${id}/image`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: filename }),
  });
  const result = await res.json();
  if (result.success) {
    const confirmed = await Swal.fire({
      icon: "success",
      title: "Deleted!",
      text: "Image deleted successfully",
      timer: 1500,
      showConfirmButton: false,
    });
    location.reload();
  }
}
