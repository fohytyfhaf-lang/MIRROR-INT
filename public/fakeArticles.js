import { articles } from "./articlesData.js";

export function showArticles() {

    const content = document.getElementById("publicContent");

    if (!content) return;

    content.innerHTML = `
        <h2>Research Articles</h2>
        <p>${articles.length} published articles.</p>
    `;

    articles.forEach(article => {

        content.innerHTML += `
            <div class="articleCard">

                <h3>${article.title}</h3>

                <small>
                    ${article.date} |
                    ${article.author} |
                    ${article.category}
                </small>

                <p>${article.text}</p>

            </div>
        `;

    });

}
