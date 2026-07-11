let products = [];

async function loadProducts() {
    try {
        const response = await fetch("/api/products");

        if (!response.ok) {
            throw new Error("Не удалось загрузить товары");
        }

        products = await response.json();

        const productSelect = document.getElementById("product");

        productSelect.innerHTML = products.map(product => `
            <option value="${product.id}">
                ${product.name}
            </option>
        `).join("");

        showQuantity();

    } catch (error) {
        console.error(error);
        alert("Ошибка загрузки товаров.");
    }
}

function showQuantity() {
    const productSelect = document.getElementById("product");
    const id = Number(productSelect.value);

    const item = products.find(p => Number(p.id) === id);

    const current = document.getElementById("current");

    if (item) {
        current.textContent = `Остаток в базе: ${item.quantity}`;
    } else {
        current.textContent = "Остаток в базе: 0";
    }
}

async function saveInventory() {
    const productSelect = document.getElementById("product");
    const newQuantityInput = document.getElementById("newQuantity");

    const newQuantity = Number(newQuantityInput.value);

    if (isNaN(newQuantity) || newQuantity < 0) {
        alert("Введите корректное количество.");
        return;
    }

    try {
        const response = await fetch("/api/inventory", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                productId: Number(productSelect.value),
                newQuantity: newQuantity
            })
        });

        if (!response.ok) {
            throw new Error("Ошибка сохранения переучета");
        }

        alert("Переучет успешно сохранен!");

        newQuantityInput.value = "";

        await loadProducts();

    } catch (error) {
        console.error(error);
        alert("Не удалось сохранить переучет.");
    }
}

loadProducts();