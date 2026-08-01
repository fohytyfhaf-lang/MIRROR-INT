import { showPlants } from "./fakePlants.js";
import { showArticles } from "./fakeArticles.js";
import { showDocuments } from "./fakeDocuments.js";
import { showNews } from "./fakeNews.js";

export function initFakeSite() {

    document.querySelectorAll("#publicMenu a").forEach(link => {

        link.addEventListener("click", e => {

            e.preventDefault();

            openPage(link.dataset.page);

        });

    });

    openPage("home");

}

function openPage(page) {

    switch (page) {

        case "home":
            showHome();
            break;

        case "plants":
            showPlants();
            break;

        case "articles":
            showArticles();
            break;

        case "downloads":
            showDocuments();
            break;

        case "news":
            showNews();
            break;

    }

}

function showHome() {

    const content = document.getElementById("publicContent");

    content.innerHTML = `
        <h2>Welcome to ABIC</h2>
        <p>
            The American Botanical Information Center maintains one of the
            largest botanical databases in North America.
        </p>
    `;

}
