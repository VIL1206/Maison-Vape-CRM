async function loadHistory(){

    const response = await fetch("/api/history");

    const data = await response.json();

    const table = document.getElementById("historyTable");

    data.forEach(item=>{

        table.innerHTML += `
        <tr>

            <td>${item.closedAt}</td>
            <td>${item.cash} грн</td>
            <td>${item.card} грн</td>
            <td>${item.telegram} грн</td>
            <td><b>${item.total} грн</b></td>

        </tr>
        `;

    });

}

loadHistory();