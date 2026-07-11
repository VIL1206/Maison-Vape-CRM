async function loadHistory() {
    try {
        const response = await fetch("/api/history");

        if (!response.ok) {
            throw new Error("Ошибка загрузки истории");
        }

        const data = await response.json();

        const tbody = document.querySelector("#historyTable tbody");

        tbody.innerHTML = "";

        data.forEach(item => {
            tbody.innerHTML += `
                <tr>
                    <td>${item.closedAt}</td>
                    <td>${item.cash} грн</td>
                    <td>${item.card} грн</td>
                    <td>${item.telegram} грн</td>
                    <td><strong>${item.total} грн</strong></td>
                </tr>
            `;
        });

    } catch (error) {
        console.error(error);
        alert("Не удалось загрузить историю смен.");
    }
}

loadHistory();