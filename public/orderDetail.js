const orderId = window.location.pathname.split('/').pop()

const loadOrder = async () => {
    const response = await fetch(`/api/order/${orderId}`)
    const result = await response.json()
    const order = result.order
   
    document.getElementById('order-id').textContent = 
        `Order #${order._id.toString().slice(-8).toUpperCase()}`
    document.getElementById('order-date').textContent = 
        `Placed on ${new Date(order.createdAt).toLocaleDateString('en-IN')}`

  
    const statusEl = document.getElementById('order-status')
    statusEl.textContent = order.status.toUpperCase()
    statusEl.className = `status-badge status-${order.status}`

    renderStatusTracker(order.status)

    const itemsContainer = document.getElementById('order-items')
    order.items.forEach(item => {
        const image = item.image && item.image[0] 
            ? item.image[0] 
            : 'placeholder.jpeg'
        itemsContainer.innerHTML += `
        <div class="item-row">
            <img src="/uploads/${image}" class="item-img">
            <div>
                <div class="item-name">${item.name}</div>
                <div class="item-qty">QTY ${item.quantity}</div>
            </div>
            <div class="item-price">
                ₹${item.subtotal.toLocaleString('en-IN')}
            </div>
        </div>`
    })

  
    document.getElementById('subtotal').textContent = 
        `₹${order.pricing.subtotal.toLocaleString('en-IN')}`
    document.getElementById('shipping').textContent = 
        `₹${order.pricing.shipping.toLocaleString('en-IN')}`
    document.getElementById('discount').textContent = 
        `-₹${order.pricing.discount.toLocaleString('en-IN')}`
    document.getElementById('total').textContent = 
        `₹${order.pricing.total.toLocaleString('en-IN')}`
    document.getElementById('payment-method').textContent = 
        order.razorpayOrderId ? 'Razorpay' : 'Cash on Delivery'

   
    document.getElementById('address-name').textContent = 
        order.shippingAddress.fullName || order.customer.name
    document.getElementById('address-lines').innerHTML = `
        ${order.shippingAddress.line1}<br>
        ${order.shippingAddress.line2 ? order.shippingAddress.line2 + '<br>' : ''}
        ${order.shippingAddress.city}, ${order.shippingAddress.state}<br>
        ${order.shippingAddress.pincode}
    `

    
    const actionSection = document.getElementById('action-section')

    if (order.status === 'pending') {
        actionSection.innerHTML += `
        <button class="btn-cancel" onclick="cancelOrder()">
            CANCEL ORDER
        </button>`
    }

    if (order.status === 'delivered') {
        actionSection.innerHTML += `
        <button class="btn-return" onclick="requestReturn()">
            REQUEST RETURN
        </button>`
    }
}

const cancelOrder = async () => {
    const result = await Swal.fire({
        title: 'Cancel Order?',
        text: 'This action cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, cancel it',
        confirmButtonColor: '#991b1b'
    })

    if (!result.isConfirmed) return

    const response = await fetch(`/order/${orderId}/cancel`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
    })

    const data = await response.json()
    if (data.status) {
        Swal.fire({
            icon: 'success',
            title: 'Order Cancelled',
            timer: 1500,
            showConfirmButton: false
        }).then(() => loadOrder())
    } else {
        Swal.fire('Error', data.message, 'error')
    }
}

const requestReturn = async () => {
    const { value: reason } = await Swal.fire({
        title: 'Return Request',
        input: 'textarea',
        inputPlaceholder: 'Please tell us why you want to return this order...',
        inputAttributes: { required: true },
        showCancelButton: true,
        confirmButtonText: 'Submit Return Request'
    })

    if (!reason) return

    const response = await fetch(`/order/${orderId}/return`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
    })

    const data = await response.json()
    if (data.status) {
        Swal.fire({
            icon: 'success',
            title: 'Return Requested',
            text: 'We will process your return shortly.',
            timer: 2000,
            showConfirmButton: false
        }).then(() => loadOrder())
    } else {
        Swal.fire('Error', data.message, 'error')
    }
}

document.addEventListener('DOMContentLoaded', loadOrder)

const renderStatusTracker = (status) => {
    const tracker = document.getElementById('status-tracker')
    
    const steps = ['pending', 'confirmed', 'shipped', 'out-for-delivery', 'delivered']
    const labels = ['Pending', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered']
    
  
    if (status === 'cancelled') {
        tracker.innerHTML = `
        <div class="tracker-step">
            <div class="tracker-dot completed">✓</div>
            <span class="tracker-label completed">Pending</span>
        </div>
        <div class="tracker-line cancelled"></div>
        <div class="tracker-step">
            <div class="tracker-dot cancelled">✕</div>
            <span class="tracker-label cancelled">Cancelled</span>
        </div>`
        return
    }

  
    if (status === 'return-requested') {
        tracker.innerHTML = `
        <div class="tracker-step">
            <div class="tracker-dot completed">✓</div>
            <span class="tracker-label completed">Delivered</span>
        </div>
        <div class="tracker-line completed"></div>
        <div class="tracker-step">
            <div class="tracker-dot active">↩</div>
            <span class="tracker-label active">Return Requested</span>
        </div>`
        return
    }

    const currentIndex = steps.indexOf(status)

    steps.forEach((step, index) => {
        let dotClass = ''
        let labelClass = ''
        let symbol = index + 1

        if (index < currentIndex) {
            dotClass = 'completed'
            labelClass = 'completed'
            symbol = '✓'
        } else if (index === currentIndex) {
            dotClass = 'active'
            labelClass = 'active'
        }

        tracker.innerHTML += `
        <div class="tracker-step">
            <div class="tracker-dot ${dotClass}">${symbol}</div>
            <span class="tracker-label ${labelClass}">${labels[index]}</span>
        </div>`

        // add line between steps (not after last)
        if (index < steps.length - 1) {
            const lineClass = index < currentIndex ? 'completed' : ''
            tracker.innerHTML += `<div class="tracker-line ${lineClass}"></div>`
        }
    })
}