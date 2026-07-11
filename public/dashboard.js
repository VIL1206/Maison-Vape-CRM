async function loadDashboard() {
    try {
        // Загружаем товары
        const productsResponse = await fetch("/api/products");

        if (!productsResponse.ok) {
            throw new Error("Ошибка загрузки товаров");
        }

        const products = await productsResponse.json();

        document.getElementById("productsCount").textContent = products.length;

        const lowStock = products.filter(product => Number(product.quantity) <= 3);

        document.getElementById("lowStock").textContent = lowStock.length;

        // Загружаем продажи
        const salesResponse = await fetch("/api/report");

        if (!salesResponse.ok) {
            throw new Error("Ошибка загрузки продаж");
        }

        const sales = await salesResponse.json();

        document.getElementById("salesCount").textContent = sales.length;

        const total = sales.reduce((sum, sale) => {
            return sum + Number(sale.price);
        }, 0);

        document.getElementById("todaySales").textContent = `${total} грн`;

    } catch (error) {
        console.error(error);
        alert("Не удалось загрузить данные панели управления.");
    }
}

loadDashboard();