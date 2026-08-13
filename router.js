import { showHome } from "./pages/home.js";
import { showPlants } from "./pages/plants.js";
import { showArticles } from "./pages/articles.js";
import { showDownloads } from "./pages/downloads.js";
import { showContact } from "./pages/contact.js";

export function initRouter() {

    document.querySelectorAll("#publicMenu a").forEach(link => {

        link.addEventListener("click", e => {

            e.preventDefault();

            const page = link.dataset.page;

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
                    showDownloads();
                    break;

                case "contact":
                    showContact();
                    break;
            }

        });

    });

    showHome();

}
