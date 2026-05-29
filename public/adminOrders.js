const loadOrders = async () => {
    const response = await fetch('/admin/orders')
    const result = await response.json()
    const tbody = document.getElementById('orders-table-body')
    tbody.innerHTML = ''

    if (!result.orders || result.orders.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center">No orders found</td>
            </tr>`
        return
    }

    result.orders.forEach(order => {
        const date = new Date(order.createdAt) .toLocaleDateString('en-IN')
        const itemNames = order.items.map(i => i.name).join(', ')

        tbody.innerHTML += `
        <tr>
            <td>
                <small class="text-muted">
                    #${order._id.toString().slice(-8).toUpperCase()}
                </small>
            </td>
            <td>
                <div>${order.customer.name}</div>
                <small class="text-muted">${order.customer.email}</small>
            </td>
            <td>
                <small>${itemNames}</small>
            </td>
            <td>₹${(order.pricing.total||0).toLocaleString('en-IN')}</td>
            <td>
                ${order.razorpayOrderId ? 'Razorpay' : 'COD'}
            </td>
            <td>
                <span class="badge ${getBadgeClass(order.status)}">
                    ${order.status.toUpperCase()}
                </span>
            </td>
            <td>${date}</td>
           <td>
    ${(() => {
        const nextStatuses = getNextStatuses(order.status)
        if (nextStatuses.length === 0) {
            return `<span style="font-size:0.75rem; color:#999;">No actions</span>`
        }
        return `<select 
            class="form-select form-select-sm"
            onchange="updateStatus('${order._id}', this.value)">
            <option value="">Change...</option>
            ${nextStatuses.map(s => 
                `<option value="${s}">${s.toUpperCase()}</option>`
            ).join('')}
        </select>`
    })()}
</td>
        </tr>`
    })
}

const getBadgeClass = (status) => {
    return {
        'pending':          'bg-warning text-dark',
        'paid':             'bg-info text-dark',
        'confirmed':        'bg-primary',
        'shipped':          'bg-primary',
        'out-for-delivery': 'bg-warning text-dark',
        'delivered':        'bg-success',
        'cancelled':        'bg-danger',
        'failed':           'bg-danger',
    }[status] || 'bg-secondary'
}

const updateStatus = async (orderId, status) => {
    if (!status) return

    const response = await fetch(`/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
    })

    const result = await response.json()
    if (result.status) {
        loadOrders()
    } else {
        alert('Failed to update status')
    }
}

document.addEventListener('DOMContentLoaded', loadOrders)
const getNextStatuses = (currentStatus) => {
    const flow = {
        'pending':          ['confirmed', 'cancelled'],
        'paid':             ['confirmed', 'cancelled'],
        'confirmed':        ['shipped', 'cancelled'],
        'shipped':          ['out-for-delivery'],
        'out-for-delivery': ['delivered'],
        'delivered':        [],
        'cancelled':        [],
        'failed':           [],
        'return-requested': ['returned'],
        'returned':         []
    }
    return flow[currentStatus] || []
}