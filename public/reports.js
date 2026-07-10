async function loadReport(){

    const response = await fetch("/api/report");

    const sales = await response.json();

    let html = "";

    let total = 0;

    sales.forEach(sale=>{

        html += `

        <tr>

        <td>${sale.date}</td>

        <td>${sale.productName}</td>

        <td>${sale.price}</td>

        <td>${sale.payment}</td>

        </tr>

        `;

        total += Number(sale.price);

    });

    document.getElementById("sales").innerHTML = html;

    document.getElementById("sum").innerHTML = total;

}

loadReport();