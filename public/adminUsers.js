document.querySelectorAll(".blockBtn").forEach(btn=>{
  btn.addEventListener("click",async()=>{
    const id=btn.dataset.id
    const isBlocked=btn.dataset.isBlocked==="true"
    try {
      const result=await Swal.fire({
        title: isBlocked ? "Unblock User?" : "Block User?",
        icon:"warning",
        showCancelButton:true,
        confirmButtonColor:"#d33",
        confirmButtonText:"yes"
      })
      if(!result.isConfirmed){
        return
      }
       const res =await fetch(`/admin/users/toggle/${id}`,{
        method:"PUT",
        headers:{
          "Content-Type":"application/json"
        }
      })

      const data=await res.json()
      if (data.success) {
        Swal.fire("success",data.message,"success")
        .then(()=>{
          window.location.reload()
        })
      } else {
        Swal.fire("error",data.message,"error")
      }

    } catch (error) {
      Swal.fire("error","something went wrong","error")
    }
  })
})