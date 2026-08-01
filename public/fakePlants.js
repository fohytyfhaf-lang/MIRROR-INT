import { plants } from "./plantsData.js";

export function showPlants() {

    const content = document.getElementById("publicContent");

    if (!content) return;

    content.innerHTML = `
        <h2>Plant Database</h2>
        <p>Showing ${plants.length} documented species.</p>
    `;

    plants.forEach(plant => {

        content.innerHTML += `
            <div class="plantCard">
                <h3>${plant.name}</h3>
                <i>${plant.latin}</i>
                <p><b>Category:</b> ${plant.category}</p>
                <p><b>Region:</b> ${plant.region}</p>
                <p>${plant.description}</p>
            </div>
        `;

    });

}
