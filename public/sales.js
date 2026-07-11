let products = [];
let cart = [];

async function loadProducts() {
    try {
        const response = await fetch("/api/products");

        if (!response.ok) {
            throw new Error("Ошибка загрузки товаров");
        }

        products = await response.json();

        drawProducts(products);

    } catch (error) {
        console.error(error);
        alert("Не удалось загрузить товары.");
    }
}

function drawProducts(array) {

    const list = document.getElementById("list");

    let html = "";

    array.forEach(product => {

        html += `
            <tr>
                <td>${product.name}</td>
                <td>${product.sellPrice} грн</td>
                <td>${product.quantity}</td>
                <td>
                    <button onclick="addToCart(${product.id})">+</button>
                </td>
            </tr>
        `;

    });

    list.innerHTML = html;
}

function searchProduct() {

    const text = document
        .getElementById("search")
        .value
        .toLowerCase();

    const filtered = products.filter(product =>
        product.name.toLowerCase().includes(text)
    );

    drawProducts(filtered);
}

function addToCart(id) {

    const product = products.find(product => product.id === id);

    if (!product) {
        return;
    }

    if (product.quantity <= 0) {
        alert("Товар закончился.");
        return;
    }

    cart.push(product);

    drawCart();
}

function drawCart() {

    const cartTable = document.getElementById("cart");

    let html = "";
    let total = 0;

    cart.forEach(product => {

        html += `
            <tr>
                <td>${product.name}</td>
                <td>${product.sellPrice} грн</td>
            </tr>
        `;

        total += Number(product.sellPrice);

    });

    cartTable.innerHTML = html;

    document.getElementById("total").textContent =
        `Итого: ${total} грн`;
}

async function checkout() {

    if (cart.length === 0) {
        alert("Корзина пустая.");
        return;
    }

    const payment = prompt(
`Способ оплаты:

1 - Наличные
2 - Карта
3 - Telegram`
    );

    if (payment === null) {
        return;
    }

    let type = "Наличные";

    if (payment === "2") {
        type = "Карта";
    }

    if (payment === "3") {
        type = "Telegram";
    }

    try {

        const response = await fetch("/api/sale", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                cart,
                payment: type
            })
        });

        if (!response.ok) {
            throw new Error("Ошибка оформления продажи");
        }

        alert("Продажа успешно выполнена!");

        cart = [];

        drawCart();

        await loadProducts();

    } catch (error) {
        console.error(error);
        alert("Не удалось выполнить продажу.");
    }
}

loadProducts();