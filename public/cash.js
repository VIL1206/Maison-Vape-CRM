async function loadCash() {
    try {
        const response = await fetch("/api/cash");

        if (!response.ok) {
            throw new Error("Ошибка загрузки кассы");
        }

        const data = await response.json();

        let cash = 0;
        let card = 0;
        let tg = 0;

        data.forEach(item => {
            if (item.payment === "Наличные") {
                cash = Number(item.total);
            }

            if (item.payment === "Карта") {
                card = Number(item.total);
            }

            if (item.payment === "Telegram") {
                tg = Number(item.total);
            }
        });

        document.getElementById("cash").textContent = cash;
        document.getElementById("card").textContent = card;
        document.getElementById("tg").textContent = tg;
        document.getElementById("total").textContent = cash + card + tg;

    } catch (error) {
        console.error(error);
        alert("Не удалось загрузить данные кассы.");
    }
}

async function closeShift() {
    if (!confirm("Закрыть смену и обнулить кассу?")) {
        return;
    }

    try {
        const response = await fetch("/api/close-shift", {
            method: "POST"
        });

        if (!response.ok) {
            throw new Error("Ошибка закрытия смены");
        }

        alert("Смена успешно закрыта.");

        await loadCash();

    } catch (error) {
        console.error(error);
        alert("Не удалось закрыть смену.");
    }
}

loadCash();