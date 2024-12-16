document.addEventListener('DOMContentLoaded', () => {
    // Fetch order data and render categories
    fetch('./order.json')
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch data from order.json');
            return response.json();
        })
        .then(data => renderCategories(data.categories))
        .catch(error => alert(`Error loading categories: ${error.message}`));

    // Attach event listeners to buttons
    document.getElementById('search').addEventListener('input', filterMedicines);
    document.getElementById('clear-cart').addEventListener('click', clearCart);
    document.getElementById('buy-now').addEventListener('click', navigateToCheckout);
    document.getElementById('add-to-favorites').addEventListener('click', saveFavorites);
    document.getElementById('apply-favorites').addEventListener('click', loadFavorites);
    document.getElementById('go-back').addEventListener('click', goBackToOrderPage);

    // Handle the payment and show the thank you message
    const orderDetailsForm = document.getElementById('orderDetailsForm');
    orderDetailsForm.addEventListener('submit', handlePayment);

    // Handle going back to the order page from thank you message
    document.getElementById('go-back-from-thank-you').addEventListener('click', goBack);

    // Simulate a delivery date and display on the order confirmation page
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 3); // Delivery in 3 days
    document.getElementById('delivery-date').textContent = `Your order will be delivered on: ${deliveryDate.toLocaleDateString()}`;
});

// Function to handle payment and show the thank you message and summary table
function handlePayment(event) {
    // Prevent the form from submitting to keep the page from reloading
    event.preventDefault();

    // Hide the order details form
    const orderDetailsForm = document.getElementById('orderDetailsForm');
    orderDetailsForm.style.display = 'none';

    // Show the thank you message
    const thankYouMessage = document.getElementById('thankYouMessage');
    thankYouMessage.style.display = 'block';

    // Show the summary table
    const summaryTableSection = document.getElementById('summary-table-section');
    summaryTableSection.style.display = 'block'; // Show the summary table section

    // Simulate a delivery date (for demonstration purposes)
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 3); // Delivery in 3 days
    document.getElementById('deliveryDate').textContent = `Your order will be delivered on: ${deliveryDate.toLocaleDateString()}`;
}

// Function to handle going back to the order page (resetting the form)
function goBack() {
    // Show the order details form again
    const orderDetailsForm = document.getElementById('orderDetailsForm');
    orderDetailsForm.style.display = 'block';

    // Hide the thank you message
    const thankYouMessage = document.getElementById('thankYouMessage');
    thankYouMessage.style.display = 'none';

    // Hide the summary table
    const summaryTableSection = document.getElementById('summary-table-section');
    summaryTableSection.style.display = 'none';

    // Optionally, reset the form fields (if needed)
    orderDetailsForm.reset();
}

// Render categories dynamically
function renderCategories(categories) {
    const categoriesContainer = document.getElementById('medicine-categories');
    categoriesContainer.innerHTML = ''; // Clear the container first

    categories.forEach(category => {
        const section = document.createElement('section');
        section.classList.add('category');
        section.innerHTML = `
            <h3>${category.name}</h3>
            <div class="medicines">
                ${category.medicines.map(medicine => `
                    <div class="item" data-name="${medicine.name}" data-price="${medicine.price}">
                        <img src="${medicine.Image}" alt="${medicine.name}">
                        <p>${medicine.name} - $${medicine.price}</p>
                        <input type="number" min="0" value="0" class="quantity" />
                    </div>
                `).join('')}
            </div>
        `;
        categoriesContainer.appendChild(section);
    });

    attachEventListenersToQuantityInputs();
}

// Attach event listeners for quantity input changes
function attachEventListenersToQuantityInputs() {
    const quantityInputs = document.querySelectorAll('.quantity');
    quantityInputs.forEach(input => {
        input.addEventListener('input', updateCart);
    });
}

// Update cart with item quantities and prices
function updateCart() {
    const cartTable = document.querySelector('#cart-table tbody');
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

// Filter medicines based on the search input
function filterMedicines() {
    const searchQuery = document.getElementById('search').value.toLowerCase();
    const items = document.querySelectorAll('.item');

    items.forEach(item => {
        const name = item.getAttribute('data-name').toLowerCase();
        if (name.includes(searchQuery)) {
            item.style.display = 'inline-block';
        } else {
            item.style.display = 'none';
        }
    });
}

// Clear the cart
function clearCart() {
    const cartTable = document.querySelector('#cart-table tbody');
    cartTable.innerHTML = '';
    document.getElementById('total-price').textContent = '0';
}

// Navigate to checkout page when Buy Now is clicked
function navigateToCheckout() {
    // Store cart data in localStorage for the checkout page
    const cartRows = document.querySelectorAll('#cart-table tbody tr');
    const cartData = Array.from(cartRows).map(row => {
        const cells = row.children;
        return {
            name: cells[0].textContent,
            quantity: parseInt(cells[1].textContent),
            price: parseFloat(cells[2].textContent.replace('$', ''))
        };
    });

    localStorage.setItem('cart', JSON.stringify(cartData));

    // Redirect to the checkout page
    window.location.href = 'checkout.html';
}

// Save the favorites to localStorage
function saveFavorites() {
    const cartRows = document.querySelectorAll('#cart-table tbody tr');
    const favorites = Array.from(cartRows).map(row => {
        const cells = row.children;
        return {
            name: cells[0].textContent,
            quantity: parseInt(cells[1].textContent),
            price: parseFloat(cells[2].textContent.replace('$', ''))
        };
    });

    localStorage.setItem('favorites', JSON.stringify(favorites));
    alert('Favorites have been saved!');
}

// Load favorites from localStorage and apply to the cart
function loadFavorites() {
    const favorites = JSON.parse(localStorage.getItem('favorites'));
    if (!favorites) {
        alert('No favorites found!');
        return;
    }

    const cartTable = document.querySelector('#cart-table tbody');
    favorites.forEach(favorite => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${favorite.name}</td>
            <td>${favorite.quantity}</td>
            <td>$${favorite.price.toFixed(2)}</td>
            <td>$${(favorite.quantity * favorite.price).toFixed(2)}</td>
        `;
        cartTable.appendChild(row);
    });

    updateCart();
}

// Go back to the order page
function goBackToOrderPage() {
    const cartSection = document.getElementById('cart-section');
    cartSection.style.display = 'block';

    const checkoutSection = document.getElementById('thank-you-section');
    checkoutSection.style.display = 'none';

    // Clear cart
    clearCart();
}

