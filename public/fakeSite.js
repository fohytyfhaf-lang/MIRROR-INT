import { plants } from "./fakePlants.js";

export function initFakeSite(){

    loadPlants();

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
