async function loadOrder() {

      const orderId =window.location.pathname.split('/').pop()
      const response = await fetch(`/api/order/${orderId}`)
      const result =await response.json()
      const order = result.order

      document.getElementById('customer-name')
       .textContent = 
       order.customer.name.split(' ')[0]
      document.getElementById('order-id') 
      .textContent = 
      '#' + order._id.slice(-8).toUpperCase()
      document.getElementById('subtotal') 
      .textContent =
      `₹${order.pricing.subtotal.toLocaleString('en-IN')}`
      document.getElementById('shipping')
       .textContent = 
       `₹${order.pricing.shipping.toLocaleString('en-IN')}`
      document.getElementById('discount')
      .textContent =
      `-₹${order.pricing.discount.toLocaleString('en-IN')}`
      document.getElementById('total')
      .textContent = 
      `₹${order.pricing.total.toLocaleString('en-IN')}`
      document.getElementById('address-name')
      .textContent = 
      order.shippingAddress.fullName || order.customer.name
      document.getElementById('address-lines')
        .innerHTML = `
          ${order.shippingAddress.line1}<br>
          ${order.shippingAddress.line2}<br>
          ${order.shippingAddress.city},
          ${order.shippingAddress.state}<br>
          ${order.shippingAddress.pincode}
        `

      document.getElementById('order-status')
        .textContent =
        order.status.toUpperCase()

      document.getElementById('created-date')
        .textContent =
        `Placed on ${new Date(order.createdAt).toLocaleDateString('en-IN')}`

      const container =
      document.getElementById('order-items')
      container.innerHTML = ''
      order.items.forEach(item => {
       container.innerHTML += `
        <div class="item-card d-flex align-items-center justify-content-between">
          <div class="d-flex align-items-center gap-3">
             <img
                src="/uploads/${item.image && item.image[0] ? item.image[0] : 'placeholder.jpeg'}"
                class="item-img"
              >
              <div>
              <div class="item-name">
                  ${item.name}
                </div>
              <div class="item-qty">
                  QTY ${item.quantity}
                </div>
             </div>
          </div>
         <div>
              ₹${item.subtotal.toLocaleString('en-IN')}
         </div>
       </div>
        `
      })

    }

    document.addEventListener(
      'DOMContentLoaded',
      loadOrder
    )

 