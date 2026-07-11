async function loadReport() {
    try {
        const response = await fetch("/api/report");

        if (!response.ok) {
            throw new Error("Ошибка загрузки отчета");
        }

        const sales = await response.json();

        let html = "";
        let total = 0;

        sales.forEach(sale => {
            html += `
                <tr>
                    <td>${sale.date}</td>
                    <td>${sale.productName}</td>
                    <td>${sale.price} грн</td>
                    <td>${sale.payment}</td>
                </tr>
            `;

            total += Number(sale.price);
        });

        document.getElementById("sales").innerHTML = html;
        document.getElementById("sum").textContent = total;

    } catch (error) {
        console.error(error);
        alert("Не удалось загрузить отчет.");
    }
}

loadReport();