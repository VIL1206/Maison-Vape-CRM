async function loadProducts() {
    try {
        const response = await fetch("/api/products");

        if (!response.ok) {
            throw new Error("Ошибка загрузки товаров");
        }

        const products = await response.json();

        let html = "";

        products.forEach(product => {
            html += `
                <tr>
                    <td>${product.id}</td>
                    <td>${product.name}</td>
                    <td>${product.category}</td>
                    <td>${product.quantity}</td>
                    <td>${product.sellPrice} грн</td>
                    <td>
                        <button onclick="editProduct(${product.id})">✏</button>
                        <button onclick="deleteProduct(${product.id})">🗑</button>
                    </td>
                </tr>
            `;
        });

        document.getElementById("products").innerHTML = html;

    } catch (error) {
        console.error(error);
        alert("Не удалось загрузить товары.");
    }
}

async function addProduct() {

    const product = {
        barcode: document.getElementById("barcode").value.trim(),
        name: document.getElementById("name").value.trim(),
        category: document.getElementById("category").value.trim(),
        buyPrice: Number(document.getElementById("buyPrice").value),
        sellPrice: Number(document.getElementById("sellPrice").value),
        quantity: Number(document.getElementById("quantity").value)
    };

    if (!product.name) {
        alert("Введите название товара.");
        return;
    }

    try {
        const response = await fetch("/api/products", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(product)
        });

        if (!response.ok) {
            throw new Error("Ошибка добавления товара");
        }

        clearForm();
        await loadProducts();

    } catch (error) {
        console.error(error);
        alert("Не удалось добавить товар.");
    }
}

async function deleteProduct(id) {

    if (!confirm("Удалить товар?")) {
        return;
    }

    try {
        const response = await fetch(`/api/products/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("Ошибка удаления товара");
        }

        await loadProducts();

    } catch (error) {
        console.error(error);
        alert("Не удалось удалить товар.");
    }
}

function searchProducts() {

    const text = document
        .getElementById("search")
        .value
        .toLowerCase();

    const rows = document.querySelectorAll("#products tr");

    rows.forEach(row => {
        row.style.display = row.innerText.toLowerCase().includes(text)
            ? ""
            : "none";
    });
}

function clearForm() {

    document.getElementById("barcode").value = "";
    document.getElementById("name").value = "";
    document.getElementById("category").value = "";
    document.getElementById("buyPrice").value = "";
    document.getElementById("sellPrice").value = "";
    document.getElementById("quantity").value = "";
}

async function editProduct(id) {

    try {
        const response = await fetch("/api/products");

        if (!response.ok) {
            throw new Error("Ошибка загрузки товаров");
        }

        const products = await response.json();

        const product = products.find(p => p.id === id);

        if (!product) {
            alert("Товар не найден.");
            return;
        }

        const name = prompt("Название", product.name);
        if (name === null) return;

        const buyPrice = prompt("Закупка", product.buyPrice);
        if (buyPrice === null) return;

        const sellPrice = prompt("Продажа", product.sellPrice);
        if (sellPrice === null) return;

        const quantity = prompt("Количество", product.quantity);
        if (quantity === null) return;

        const updateResponse = await fetch(`/api/products/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                barcode: product.barcode,
                name: name.trim(),
                category: product.category,
                buyPrice: Number(buyPrice),
                sellPrice: Number(sellPrice),
                quantity: Number(quantity)
            })
        });

        if (!updateResponse.ok) {
            throw new Error("Ошибка обновления товара");
        }

        await loadProducts();

    } catch (error) {
        console.error(error);
        alert("Не удалось обновить товар.");
    }
}

loadProducts();