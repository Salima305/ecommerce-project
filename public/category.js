document.addEventListener("DOMContentLoaded", () => {
  console.log("Category JS Loaded");

  const addBtn = document.getElementById("addCategoryBtn");

  if (addBtn) {
    addBtn.addEventListener("click", async () => {
      console.log("button clicked");
      const name = document.getElementById("categoryName").value.trim();

      if (!name) {
        return Swal.fire("Error", "Category name is required", "error");
      }

      const confirm = await Swal.fire({
        title: "Add Category?",
        text: `Create "${name}"`,
        icon: "question",
        showCancelButton: true,
      });

      if (!confirm.isConfirmed) return;

      try {
        const res = await fetch("/admin/categories/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        });

        const data = await res.json();

        if (res.ok) {
          Swal.fire("Success", data.message, "success").then(() =>
            location.reload(),
          );
        } else {
          Swal.fire("Error", data.message, "error");
        }
      } catch {
        Swal.fire("Error", "Something went wrong", "error");
      }
    });
  }

  document.querySelectorAll(".editCategoryBtn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      const oldName = btn.dataset.name;

      const { value: newName } = await Swal.fire({
        title: "Edit Category",
        input: "text",
        inputValue: oldName,
        showCancelButton: true,
      });

      if (!newName) return;

      const res = await fetch(`/admin/categories/edit/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire("Updated", data.message, "success").then(() =>
          location.reload(),
        );
      } else {
        Swal.fire("Error", data.message, "error");
      }
    });
  });

  document.querySelectorAll(".toggleCategoryBtn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      const isBlocked = btn.dataset.active === "true";

      const confirm = await Swal.fire({
        title: "Are you sure?",
        icon: "warning",
        showCancelButton: true,
      });

      if (!confirm.isConfirmed) return;

      let enableProducts = true;

      if (isBlocked) {
        const productList = await Swal.fire({
          title: "Enable the related products?",
          icon: "question",
          showCancelButton: true,
        });
        enableProducts = productList.isConfirmed;
      }

      await fetch(`/admin/categories/toggle/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enableProducts }),
      });

      Swal.fire("Updated!", "", "success").then(() => location.reload());
    });
  });
});
