import { plants } from "./fakePlants.js";
import { news } from "./fakeNews.js";

export function initFakeSite(){

    loadPlants();
    loadNews();

}

function loadPlants(){

    const container = document.getElementById("plantGrid");

    if(!container) return;

    container.innerHTML="";

    plants.forEach(plant=>{

        container.innerHTML+=`

        <div class="plantCard">

            <h3>${plant.name}</h3>

            <i>${plant.latin}</i>

            <p>${plant.description}</p>

        </div>

        `;

    });

}

function loadNews(){

    const list =
    document.querySelector("#latestNews ul");


    if(!list) return;


    list.innerHTML="";


    news.forEach(item=>{


        list.innerHTML += `

        <li>
        ${item.date}
        —
        ${item.text}
        </li>

        `;


    });

}


