document.addEventListener('DOMContentLoaded', () => {
    // Attach event listeners to buttons
    document.getElementById('pay-now').addEventListener('click', handlePayment);
    
    // If cart data is stored in localStorage, load it
    const cartData = JSON.parse(localStorage.getItem('cart'));
    if (cartData) {
        renderCart(cartData);
    }

    // Attach event listeners for quantity changes in the cart
    const quantityInputs = document.querySelectorAll('.quantity');
    quantityInputs.forEach(input => {
        input.addEventListener('input', updateCart);
    });
});

// Function to render the cart from the cart data
function renderCart(cartData) {
    const cartTable = document.querySelector('#cart-items');
    const totalPriceElement = document.getElementById('total-price');
    let totalPrice = 0;

    // Clear the current cart
    cartTable.innerHTML = '';

    cartData.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td><input type="number" class="quantity" value="${item.quantity}" min="1" data-name="${item.name}" data-price="${item.price}"></td>
            <td>$${item.price.toFixed(2)}</td>
            <td>$${(item.quantity * item.price).toFixed(2)}</td>
        `;
        cartTable.appendChild(row);
        totalPrice += item.quantity * item.price;
    });

    totalPriceElement.textContent = totalPrice.toFixed(2);
}

// Function to handle payment and show the thank you message
function handlePayment() {
    // Hide the payment form
    const paymentForm = document.getElementById('payment-form');
    paymentForm.style.display = 'none';

    // Show the thank you message popup
    const thankYouPopup = document.getElementById('thank-you-popup');
    thankYouPopup.style.display = 'block';

    // Simulate a delivery date
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 3); // Delivery in 3 days
    document.getElementById('delivery-date').textContent = `Your order will be delivered on: ${deliveryDate.toLocaleDateString()}`;

    // Optionally, save the cart data to localStorage
    const cartRows = document.querySelectorAll('#cart-table tbody tr');
    const cartData = Array.from(cartRows).map(row => {
        const cells = row.children;
        return {
            name: cells[0].textContent,
            quantity: parseInt(cells[1].querySelector('.quantity').value),
            price: parseFloat(cells[2].textContent.replace('$', ''))
        };
    });

    localStorage.setItem('cart', JSON.stringify(cartData)); // Store cart data in localStorage
}

// Function to update the cart with item quantities and prices
function updateCart() {
    const cartTable = document.querySelector('#cart-items');
    const totalPriceElement = document.getElementById('total-price');
    let totalPrice = 0;

    const items = document.querySelectorAll('.item');
    items.forEach(item => {
        const name = item.getAttribute('data-name');
        const price = parseFloat(item.getAttribute('data-price'));
        const quantity = parseInt(item.querySelector('.quantity').value);

        const existingRow = Array.from(cartTable.querySelectorAll('tr')).find(row => row.cells[0].textContent === name);

        if (existingRow) {
            if (quantity > 0) {
                existingRow.cells[1].textContent = quantity;
                existingRow.cells[3].textContent = `$${(quantity * price).toFixed(2)}`;
            } else {
                existingRow.remove();
            }
        } else if (quantity > 0) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${name}</td>
                <td>${quantity}</td>
                <td>$${price.toFixed(2)}</td>
                <td>$${(quantity * price).toFixed(2)}</td>
            `;
            cartTable.appendChild(row);
        }

        totalPrice += quantity * price;
    });

    totalPriceElement.textContent = totalPrice.toFixed(2);
}

// Function to close the thank you popup
document.getElementById('close-popup').addEventListener('click', () => {
    const thankYouPopup = document.getElementById('thank-you-popup');
    thankYouPopup.style.display = 'none';

    // Optionally, reset the payment form
    const paymentForm = document.getElementById('payment-form');
    paymentForm.reset();

    // Optionally, show the payment form again
    paymentForm.style.display = 'block';
});
