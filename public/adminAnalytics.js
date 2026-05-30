const loadAnalytics = async () => {
    const response = await fetch('/admin/analytics')
    const result = await response.json()
    const data = result.data
    
    document.getElementById('today-orders').textContent = data.today.orders
    document.getElementById('today-revenue').textContent = `₹${data.today.revenue.toLocaleString('en-IN')}`
    document.getElementById('week-orders').textContent = data.week.orders
    document.getElementById('week-revenue').textContent = `₹${data.week.revenue.toLocaleString('en-IN')}`
    document.getElementById('month-orders').textContent = data.month.orders
    document.getElementById('month-revenue').textContent = `₹${data.month.revenue.toLocaleString('en-IN')}`

    new Chart(document.getElementById('salesChart'), {
        type: 'line',
        data: {
            labels: ['Today', 'This Week', 'This Month'],
            datasets: [{
                label: 'Number of Orders',
                data: [
                    data.today.orders,
                    data.week.orders,
                    data.month.orders
                ],
                backgroundColor: ['#6366f1', '#8b5cf6', '#a78bfa'],
                 borderColor: '#6366f1',
            borderWidth: 2,
            pointBackgroundColor: '#6366f1',
            tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } }
        }
    })

    new Chart(document.getElementById('revenueChart'), {
        type: 'doughnut',
        data: {
            labels: ['Today', 'This Week', 'This Month'],
            datasets: [{
                data: [
                    data.today.revenue,
                    data.week.revenue,
                    data.month.revenue
                ],
                backgroundColor: ['#f59e0b', '#10b981', '#3b82f6']
            }]
        },
        options: { responsive: true }
    })

    const productLabels = data.topProducts.map(p => p._id)
    const productSales = data.topProducts.map(p => p.totalSold)

    new Chart(document.getElementById('topProductsChart'), {
        type: 'bar',
        data: {
            labels: productLabels,
            datasets: [{
                label: 'Units Sold',
                data: productSales,
                backgroundColor: '#10b981'
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            plugins: { legend: { display: false } }
        }
    })

    const tbody = document.getElementById('top-products-table')
    data.topProducts.forEach((product, index) => {
        tbody.innerHTML += `
        <tr>
            <td>${index + 1}</td>
            <td>${product._id}</td>
            <td><strong>${product.totalSold}</strong></td>
        </tr>`
    })
}

document.addEventListener('DOMContentLoaded', loadAnalytics)