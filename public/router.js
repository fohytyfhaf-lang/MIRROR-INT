import { showPlants } from "./fakePlants.js";
import { news } from "./newsData.js";
import { initSecretEntry } from "./secretEntry.js";
import { openMemberAccess } from "./memberAccess.js";


export function initRouter() {

    const menuLinks =
        document.querySelectorAll("#publicMenu a");


    menuLinks.forEach(link => {

        link.addEventListener("click", event => {

            event.preventDefault();

            const page =
                link.dataset.page;


            switch (page) {

                case "home":

                    setActivePage("home");
                    showHome();

                    break;


                case "plants":

                    setActivePage("plants");
                    showPlants();

                    break;


                case "articles":

                    setActivePage("articles");
                    showArticles();

                    break;


                
                
                case "member":
                    setActivePage("member");
                    openMemberAccess();
                    
                    break;



                case "downloads":

                    setActivePage("downloads");
                    showDownloads();

                    break;


                case "contact":

                    setActivePage("contact");
                    showContact();

                    break;

            }

        });

    });


    /*
        Initial page
    */

    setActivePage("home");

    showHome();


    /*
        Hidden ABIC → OMEGA entry
    */

    initSecretEntry();

}



/* =========================================================
   HOME
========================================================= */

function showHome() {

    const content =
        document.getElementById("publicContent");


    if (!content) return;


    content.innerHTML = `

        <div class="abicHome">


            <!-- HERO -->

            <section class="abicHomeHero">

                <div class="abicHomeHeroText">

                    <div class="abicHomeEyebrow">
                        AMERICAN BOTANICAL INFORMATION CENTER
                    </div>

                    <h1>
                        North American
                        <br>
                        Plant Encyclopedia
                    </h1>

                    <p>
                        Explore botanical records,
                        research publications and
                        documented plant species
                        from across North America.
                    </p>

                    <button
                        id="homeOpenDatabase"
                        class="abicHomePrimaryButton"
                    >
                        Open Plant Database
                    </button>

                </div>


                <div class="abicHomeHeroImage">

                    <img
                        src="forest.jpg"
                        alt="North American forest"
                    >

                </div>

            </section>



            <!-- DATABASE SEARCH -->

            <section class="abicHomeSearch">

                <div class="abicHomeSectionLabel">
                    PLANT DATABASE
                </div>

                <h2>
                    Search the ABIC collection
                </h2>

                <p>
                    Search documented species by
                    common name, scientific name,
                    region or category.
                </p>


                <div class="abicHomeSearchRow">

                    <input
                        id="homePlantSearch"
                        type="text"
                        placeholder="Enter plant name..."
                        autocomplete="off"
                    >

                    <button
                        id="homePlantSearchButton"
                        class="abicHomeSearchButton"
                    >
                        Search
                    </button>

                </div>

            </section>



            <!-- FEATURED PLANTS -->

            <section class="abicHomeFeatured">

                <div class="abicHomeSectionHeader">

                    <div>

                        <div class="abicHomeSectionLabel">
                            COLLECTION
                        </div>

                        <h2>
                            Featured Plants
                        </h2>

                    </div>

                    <button
                        id="homeViewAllPlants"
                        class="abicHomeTextButton"
                    >
                        View database →
                    </button>

                </div>


                <div
                    id="homeFeaturedPlantGrid"
                    class="abicHomePlantGrid"
                ></div>

            </section>



            <!-- NEWS -->

            <section class="abicHomeNews">

                <div class="abicHomeSectionLabel">
                    ABIC NEWS
                </div>

                <h2>
                    Latest News
                </h2>


                <div
                    id="homeNewsList"
                    class="abicHomeNewsList"
                ></div>

            </section>


        </div>

    `;


    /*
        Home-only events
    */

    initHomeSearch();
    initHomeButtons();

    renderFeaturedPlants();
    renderHomeNews();

}



/* =========================================================
   HOME — BUTTONS
========================================================= */

function initHomeButtons() {

    const openDatabase =
        document.getElementById(
            "homeOpenDatabase"
        );


    const viewAll =
        document.getElementById(
            "homeViewAllPlants"
        );


    if (openDatabase) {

        openDatabase.addEventListener(
            "click",
            () => {

                setActivePage("plants");

                showPlants();

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

            }
        );

    }


    if (viewAll) {

        viewAll.addEventListener(
            "click",
            () => {

                setActivePage("plants");

                showPlants();

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

            }
        );

    }

}



/* =========================================================
   HOME — SEARCH
========================================================= */

function initHomeSearch() {

    const input =
        document.getElementById(
            "homePlantSearch"
        );


    const button =
        document.getElementById(
            "homePlantSearchButton"
        );


    if (!input || !button) return;


    function openSearch() {

        const query =
            input.value.trim();


        /*
            Empty search simply opens
            the Plant Database.
        */

        setActivePage("plants");

        showPlants();


        /*
            Wait until Plant Database
            creates its own search input.
        */

        if (!query) {

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

            return;

        }


        requestAnimationFrame(() => {

            const databaseInput =
                document.getElementById(
                    "plantDatabaseSearch"
                );


            if (!databaseInput) return;


            databaseInput.value =
                query;


            databaseInput.dispatchEvent(
                new Event("input")
            );


            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        });

    }


    button.addEventListener(
        "click",
        openSearch
    );


    input.addEventListener(
        "keydown",
        event => {

            if (event.key === "Enter") {

                event.preventDefault();

                openSearch();

            }

        }
    );

}



/* =========================================================
   HOME — FEATURED PLANTS
========================================================= */

async function renderFeaturedPlants() {

    const grid =
        document.getElementById(
            "homeFeaturedPlantGrid"
        );


    if (!grid) return;


    /*
        Import only the data.
        Home does NOT import showPlants().
    */

    const module =
        await import("./plantsData.js");


    const plants =
        module.plants || [];


    const featured =
        plants.slice(0, 6);


    grid.innerHTML =
        featured
            .map((plant, index) => `

                <article
                    class="abicHomePlantCard"
                >

                    <img
                        src="${plant.image}"
                        alt="${escapeHTML(
                            plant.name
                        )}"
                        onerror="
                            this.src='images/plants/placeholder.png'
                        "
                    >


                    <div class="abicHomePlantBody">

                        <div class="abicHomePlantCategory">
                            ${escapeHTML(
                                plant.category || "BOTANY"
                            )}
                        </div>


                        <h3>
                            ${escapeHTML(
                                plant.name
                            )}
                        </h3>


                        <p class="abicHomePlantLatin">
                            ${escapeHTML(
                                plant.latin
                            )}
                        </p>


                        <p class="abicHomePlantRegion">
                            ${escapeHTML(
                                plant.region
                            )}
                        </p>


                        <button
                            class="abicHomePlantButton"
                            data-plant-index="${index}"
                        >
                            View record
                        </button>

                    </div>

                </article>

            `)
            .join("");


    /*
        Featured cards open the database.
        The actual plant record is handled
        by fakePlants.js.
    */

    grid
        .querySelectorAll(
            ".abicHomePlantButton"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const query =
                        plants[
                            Number(
                                button.dataset.plantIndex
                            )
                        ];


                    setActivePage("plants");

                    showPlants();


                    requestAnimationFrame(() => {

                        /*
                            Search by exact plant name.
                            Plant Database handles the
                            actual filtering.
                        */

                        const input =
                            document.getElementById(
                                "plantDatabaseSearch"
                            );


                        if (!input || !query) {
                            return;
                        }


                        input.value =
                            query.name;


                        input.dispatchEvent(
                            new Event("input")
                        );


                        window.scrollTo({
                            top: 0,
                            behavior: "smooth"
                        });

                    });

                }
            );

        });

}



/* =========================================================
   HOME — NEWS
========================================================= */

function renderHomeNews() {

    const list =
        document.getElementById(
            "homeNewsList"
        );


    if (!list) return;


    list.innerHTML =
        news
            .slice(0, 4)
            .map(item => `

                <article
                    class="abicHomeNewsCard"
                >

                    <div class="abicHomeNewsDate">
                        ${escapeHTML(
                            item.date
                        )}
                    </div>


                    <div>

                        <h3>
                            ${escapeHTML(
                                item.title
                            )}
                        </h3>


                        <p>
                            ${escapeHTML(
                                item.text
                            )}
                        </p>

                    </div>

                </article>

            `)
            .join("");

}



/* =========================================================
   ARTICLES
========================================================= */

function showArticles() {

    const content =
        document.getElementById(
            "publicContent"
        );


    if (!content) return;


    content.innerHTML = `

        <section class="abicSimplePage">

            <div class="abicSimpleLabel">
                ABIC PUBLICATIONS
            </div>

            <h1>
                Articles
            </h1>

            <p>
                Botanical research articles and
                scientific publications will be
                available here.
            </p>

        </section>

    `;

}



/* =========================================================
   DOWNLOADS
========================================================= */

function showDownloads() {

    const content =
        document.getElementById(
            "publicContent"
        );


    if (!content) return;


    content.innerHTML = `

        <section class="abicSimplePage">

            <div class="abicSimpleLabel">
                ABIC RESOURCES
            </div>

            <h1>
                Downloads
            </h1>

            <p>
                No public downloads are currently
                available.
            </p>

        </section>

    `;

}



/* =========================================================
   CONTACT
========================================================= */

function showContact() {

    const content =
        document.getElementById(
            "publicContent"
        );


    if (!content) return;


    content.innerHTML = `

        <section class="abicSimplePage">

            <div class="abicSimpleLabel">
                AMERICAN BOTANICAL INFORMATION CENTER
            </div>

            <h1>
                Contact
            </h1>

            <p>
                American Botanical Information Center
            </p>

            <p>
                Portland, Oregon
            </p>

            <p>
                contact@abic.org
            </p>

        </section>

    `;

}



/* =========================================================
   NAVIGATION
========================================================= */

function setActivePage(page) {

    document
        .querySelectorAll(
            "#publicMenu a"
        )
        .forEach(link => {

            link.classList.remove(
                "active"
            );


            if (
                link.dataset.page === page
            ) {

                link.classList.add(
                    "active"
                );

            }

        });

}



/* =========================================================
   HTML SAFETY
========================================================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}
