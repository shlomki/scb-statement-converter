// main.js
import { handlers } from "./handlers/index.js";

const form = document.getElementById("pdfForm");
form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const fileInput = document.getElementById("pdfFile");
    const passwordInput = document.getElementById("password");
    const errorMessage = document.getElementById("errorMessage");
    const file = fileInput.files[0];
    const password = passwordInput.value;

    resetDownloadLink();
    resetErrorMessage();

    if (!file) {
        errorMessage.textContent = "Please upload a PDF file.";
        errorMessage.style.display = "block";
        return;
    }

    try {
        const pdfData = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: pdfData, password }).promise;

        let allLines = [];
        for (let i = 0; i < Math.min(3, pdf.numPages); i++) {
            const page = await pdf.getPage(i + 1);
            const textContent = await page.getTextContent();
            const lines = textContent.items.map((item) => item.str.trim()).filter(Boolean);
            allLines.push(...lines);
        }

        const Handler = handlers.find((handler) => handler.matches(allLines));

        if (!Handler) {
            errorMessage.textContent = "Unsupported PDF file type.";
            errorMessage.style.display = "block";
            return;
        }

        let csvContent = await Handler.convert(pdf);

        if (!csvContent || csvContent.trim() === "") {
            errorMessage.textContent = "Failed to process the PDF. No data has been found.";
            errorMessage.style.display = "block";
            return;
        }

        downloadCSV(csvContent, "output.csv");

    } catch (error) {
        console.error("Error processing PDF:", error);
        errorMessage.textContent = "Failed to process the PDF. Please check the file and password.";
        errorMessage.style.display = "block";
    }
});

function downloadCSV(content, filename) {
    const blob = new Blob([content], { type: "text/csv" });
    const link = document.getElementById("downloadLink");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.style.display = "block";
    link.textContent = "Download CSV";
}

function resetDownloadLink() {
    const link = document.getElementById("downloadLink");
    link.style.display = "none";
}

function resetErrorMessage() {
    const errorMessage = document.getElementById("errorMessage");
    errorMessage.style.display = "none";
    errorMessage.textContent = "";
}
