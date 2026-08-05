import { showPlants } from "./fakePlants.js";
import { showArticles } from "./fakeArticles.js";
import { showDocuments } from "./fakeDocuments.js";
import { initSearch } from "./search.js";
import { showNews } from "./fakeNews.js";
import { initSecretEntry } from "./secretEntry.js";

export function initRouter() {

    document.querySelectorAll("#publicMenu a").forEach(link => {

        link.addEventListener("click", e => {

            e.preventDefault();

            const page = link.dataset.page;

            switch(page){

                case "home":
                    setActivePage(page);
                    showHome();
                    break;

                case "plants":
                    setActivePage(page);
                    showPlants();
                    break;

                case "articles":
                    setActivePage(page);
                    showArticles();
                    break;

                case "downloads":
                    setActivePage(page);
                    showDownloads();
                    break;

                case "contact":
                    setActivePage(page);
                    showContact();
                    break;

            }

        });

    });

    showHome();
    initSecretEntry();
}

function showHome(){

    const content = document.getElementById("publicContent");

    content.innerHTML = `

<section id="hero">

    <div id="heroText">

        <h2>North American Plant Encyclopedia</h2>

        <p>
            Explore over <b>45,000</b> documented plant species.
        </p>

    </div>

    <div id="heroImage">

        <img src="forest.jpg">

    </div>

</section>

<section id="searchBox">

<h3>Search Plant Database</h3>

<input id="publicSearch" placeholder="Enter plant name...">

<button id="publicSearchButton">

Search

</button>

</section>

<section id="featuredPlants">

<h2>Featured Plants</h2>

<div id="plantGrid"></div>

</section>

<section id="latestNews">

<h2>Latest News</h2>

<ul id="newsList"></ul>

</section>

`;

    showNews();
    showPlants();
    initSearch();

}

function showDownloads(){

    document.getElementById("publicContent").innerHTML = `

<h2>Downloads</h2>

<p>No public downloads available.</p>

`;

}

function showContact(){

    document.getElementById("publicContent").innerHTML = `

<h2>Contact</h2>

<p>American Botanical Information Center</p>

<p>Portland, Oregon</p>

<p>contact@abic.org</p>

`;

}

function setActivePage(page){

    document
        .querySelectorAll("#publicMenu a")
        .forEach(link=>{

            link.classList.remove("active");

            if(link.dataset.page===page){

                link.classList.add("active");

            }

        });

}
