import { documents } from "./documentsData.js";

export function showDocuments() {

    const content = document.getElementById("publicContent");

    if (!content) return;

    content.innerHTML = `
        <h2>Research Library</h2>
        <p>${documents.length} archived documents.</p>
    `;

    documents.forEach(doc => {

        content.innerHTML += `

        <div class="documentCard">

            <h3>${doc.name}</h3>

            <p><b>Type:</b> ${doc.type}</p>

            <p><b>Year:</b> ${doc.year}</p>

            <p><b>Size:</b> ${doc.size}</p>

            <p>${doc.description}</p>

        </div>

        `;

    });

}
