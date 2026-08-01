import { news } from "./newsData.js";

export function showNews() {

    const content = document.getElementById("publicContent");

    if (!content) return;

    content.innerHTML = `
        <h2>Latest News</h2>
        <p>${news.length} recent announcements.</p>
    `;

    news.forEach(item => {

        content.innerHTML += `

        <div class="newsCard">

            <h3>${item.title}</h3>

            <small>${item.date}</small>

            <p>${item.text}</p>

        </div>

        `;

    });

}
