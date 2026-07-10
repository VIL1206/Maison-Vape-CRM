function updateTime(){

    const now = new Date();

    const options = {

        day:"2-digit",

        month:"2-digit",

        year:"numeric",

        hour:"2-digit",

        minute:"2-digit",

        second:"2-digit"

    };

    const text = now.toLocaleString("ru-RU",options);

    const el=document.getElementById("datetime");

    if(el){

        el.innerHTML=text;

    }

}

setInterval(updateTime,1000);

updateTime();