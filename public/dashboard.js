async function loadDashboard(){

    // Количество товаров

    let response = await fetch("/api/products");

    let products = await response.json();

    document.getElementById("productsCount").innerHTML =
        products.length;

    // Заканчиваются

    let low = products.filter(p=>p.quantity<=3);

    document.getElementById("lowStock").innerHTML =
        low.length;

    // Продажи

    response = await fetch("/api/report");

    let sales = await response.json();

    document.getElementById("salesCount").innerHTML =
        sales.length;

    let total = 0;

    sales.forEach(s=>{

        total += Number(s.price);

    });

    document.getElementById("todaySales").innerHTML =
        total + " грн";

}

loadDashboard();