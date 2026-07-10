async function loadCash(){

    const response = await fetch("/api/cash");

    const data = await response.json();

    let cash = 0;
    let card = 0;
    let tg = 0;

    data.forEach(item=>{

        if(item.payment=="Наличные")
            cash = item.total;

        if(item.payment=="Карта")
            card = item.total;

        if(item.payment=="Telegram")
            tg = item.total;

    });

    document.getElementById("cash").innerHTML = cash;
    document.getElementById("card").innerHTML = card;
    document.getElementById("tg").innerHTML = tg;
    document.getElementById("total").innerHTML =
        Number(cash)+Number(card)+Number(tg);

}

loadCash();