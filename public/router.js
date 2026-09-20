import { showPlants } from "./fakePlants.js";
import { showArticles } from "./fakeArticles.js";
import { news } from "./newsData.js";
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

    const content =
        document.getElementById("publicContent");

    if(!content) return;


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

    <input
        id="publicSearch"
        type="text"
        placeholder="Enter plant name..."
        autocomplete="off"
    >

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

    <div id="newsList"></div>

</section>

`;


    showPlants();

    renderNews();


    const searchButton =
        document.getElementById("publicSearchButton");

    const searchInput =
        document.getElementById("publicSearch");


    if(searchButton && searchInput){

        searchButton.addEventListener("click", () => {

            const text =
                searchInput.value.trim();

            if(!text) return;


            setActivePage("plants");

            showPlants();


            const plantSearch =
                document.getElementById("publicSearch");


            if(plantSearch){

                plantSearch.value = text;

                plantSearch.dispatchEvent(
                    new Event("input")
                );

            }

        });

    }

}


function renderNews(){

    const list =
        document.getElementById("newsList");

    if(!list) return;


    list.innerHTML = news
        .slice(0, 4)
        .map(item => `

            <article class="newsCard">

                <h3>${item.title}</h3>

                <small>${item.date}</small>

                <p>${item.text}</p>

            </article>

        `)
        .join("");

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
        .forEach(link => {

            link.classList.remove("active");

            if(link.dataset.page === page){

                link.classList.add("active");

            }

        });

}
