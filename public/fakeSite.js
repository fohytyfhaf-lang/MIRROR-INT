import { showHome } from "./fakeHome.js";
import { showPlants } from "./fakePlants.js";
import { showResearch } from "./fakeResearch.js";
import { showArticles } from "./fakeArticles.js";
import { showDownloads } from "./fakeDocuments.js";
import { showContact } from "./fakeContact.js";

export function initFakeSite(){

    openPage("home");

    document.querySelectorAll("#publicMenu a").forEach(link=>{

        link.addEventListener("click",e=>{

            e.preventDefault();

            openPage(link.dataset.page);

        });

    });

}

function openPage(page){

    switch(page){

        case "home":
            showHome();
            break;

        case "plants":
            showPlants();
            break;

        case "research":
            showResearch();
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

}
