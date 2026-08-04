import { plants } from "./plantsData.js";

export function initSearch() {

    const input = document.getElementById("publicSearch");

    if (!input) return;

    input.addEventListener("input", () => {

        const text = input.value.toLowerCase().trim();

        const cards = document.querySelectorAll(".plantCard");

        cards.forEach(card => {

            const name = card.dataset.name;
            const latin = card.dataset.latin;
            const region = card.dataset.region;
            const category = card.dataset.category;

            const visible =
                name.includes(text) ||
                latin.includes(text) ||
                region.includes(text) ||
                category.includes(text);

            card.style.display = visible ? "" : "none";

        });

    });

}
