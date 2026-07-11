async function loadProducts() {
    try {
        const response = await fetch("/api/products");

        if (!response.ok) {
            throw new Error("Не удалось загрузить товары");
        }

        const products = await response.json();

        const productSelect = document.getElementById("product");

        productSelect.innerHTML = products.map(product => `
            <option value="${product.id}">
                ${product.name}
            </option>
        `).join("");

    } catch (error) {
        console.error(error);
        alert("Ошибка загрузки товаров.");
    }
}

async function acceptDelivery() {

    const product = document.getElementById("product");
    const quantity = document.getElementById("quantity");
    const supplier = document.getElementById("supplier");

    if (!quantity.value || Number(quantity.value) <= 0) {
        alert("Введите корректное количество.");
        return;
    }

    if (!supplier.value.trim()) {
        alert("Введите поставщика.");
        return;
    }

    try {
        const response = await fetch("/api/delivery", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                productId: Number(product.value),
                quantity: Number(quantity.value),
                supplier: supplier.value.trim()
            })
        });

        if (!response.ok) {
            throw new Error("Ошибка приема товара");
        }

        alert("Товар успешно принят!");

        quantity.value = "";
        supplier.value = "";

    } catch (error) {
        console.error(error);
        alert("Не удалось принять товар.");
    }
}

loadProducts();