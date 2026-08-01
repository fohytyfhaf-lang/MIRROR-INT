import { plants } from "./plantsData.js";

export function initSearch() {

    const input = document.getElementById("publicSearch");
    if (!input) return;

    input.addEventListener("input", () => {

        const value = input.value.trim().toLowerCase();

        showSearchResults(value);

    });

}

function showSearchResults(query) {

    const container = document.getElementById("plantGrid");

    if (!container) return;

    container.innerHTML = "";

    const results = plants.filter(plant => {

        return (
            plant.name.toLowerCase().includes(query) ||
            plant.latin.toLowerCase().includes(query) ||
            plant.category.toLowerCase().includes(query) ||
            plant.region.toLowerCase().includes(query)
        );

    });

    if (results.length === 0) {

        container.innerHTML = `
            <p class="noResults">
                No matching plants found.
            </p>
        `;

        return;
    }

    results.forEach(plant => {

        container.innerHTML += `
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
