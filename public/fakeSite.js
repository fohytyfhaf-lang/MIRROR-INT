import { showPlants } from "./fakePlants.js";
import { showArticles } from "./fakeArticles.js";
import { showDocuments } from "./fakeDocuments.js";
import { showNews } from "./fakeNews.js";

export function initFakeSite() {

    setupMenu();
    showHome();

}

function setupMenu() {

    const links = document.querySelectorAll("#publicMenu a");

    links.forEach(link => {

        link.addEventListener("click", (e) => {

            e.preventDefault();

            const page = link.textContent.trim();

            switch(page){

                case "Home":
                    showHome();
                    break;

                case "Plant Database":
                    showPlants();
                    break;

                case "Species Index":
                    showPlants();
                    break;

                case "Research Library":
                    showDocuments();
                    break;

                case "Articles":
                    showArticles();
                    break;

                case "Downloads":
                    showDownloads();
                    break;

                case "Contact":
                    showContact();
                    break;

            }

        });

    });

}

function showHome(){

    const content = document.getElementById("publicContent");

    if(!content) return;

    content.innerHTML = `

    <section id="hero">

        <div id="heroText">

            <h2>North American Plant Encyclopedia</h2>

            <p>
                Welcome to the American Botanical Information Center.
            </p>

            <p>
                Our archive contains more than
                <strong>45,000 documented species</strong>,
                research articles,
                herbarium records
                and educational publications.
            </p>

        </div>

    </section>

    `;

}

function showDownloads(){

    const content = document.getElementById("publicContent");

    if(!content) return;

    content.innerHTML = `

        <h2>Downloads</h2>

        <p>

            Public documents available for download.

        </p>

        <ul>

            <li>North American Flora Guide.pdf</li>

            <li>Species Catalogue 2013.pdf</li>

            <li>Herbarium Instructions.pdf</li>

            <li>Plant Classification Manual.pdf</li>

        </ul>

    `;

}

function showContact(){

    const content = document.getElementById("publicContent");

    if(!content) return;

    content.innerHTML = `

        <h2>Contact</h2>

        <p>

            American Botanical Information Center

        </p>

        <p>

            315 Green Valley Road

        </p>

        <p>

            Portland, Oregon

        </p>

        <p>

            Phone:
            +1 (503) 555-2481

        </p>

        <p>

            Email:
            contact@abic.org

        </p>

    `;

}
