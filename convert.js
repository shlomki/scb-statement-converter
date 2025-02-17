document.getElementById("pdfForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const fileInput = document.getElementById("pdfFile");
    const passwordInput = document.getElementById("password");
    const errorMessage = document.getElementById("errorMessage");
    const file = fileInput.files[0];
    const password = passwordInput.value;

    // Clear UI from download link and error messages
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

        const csvHeader = "Date,Time,Channel,Amount,Balance,Description,Note\n";
        let csvContent = csvHeader;
        for (let i = 0; i < pdf.numPages; i++) {
            const page = await pdf.getPage(i + 1);
            const textContent = await page.getTextContent();
            const text = textContent.items.map((item) => item.str).join("\n");
            csvContent += processTextToCSV(text);
        }

        //If no data has been found
        if (csvContent == csvHeader) {
            errorMessage.textContent = "Failed to process the PDF. No data has been found. Please make sure your file is a standard SCB Statement PDF.";
            errorMessage.style.display = "block";
            return;
        }

        downloadCSV(csvContent, "output.csv");

    } catch (error) {
        console.error("Error proces5sing PDF:", error);
        errorMessage.textContent = "Failed to process the PDF. Please check the file and password.";
        errorMessage.style.display = "block";
    }
});

function processTextToCSV(inputText) {
    const dataStartMarker = "รายการ/ช่องทาง";
    const dataEndMarkers = ["www.scb.co.th", "Total amount"];
	const dataSkipLines = ["Balance brought forward", "NOTE :", "DESC :", "ลูกหนี้", "เจ้าหนี้", "รายละเอียด/บันทึกช่วยจํ", "ยอดเงินคงเหลือยกมา"];
    const previousBalanceMarker = "***";
    

    const lines = inputText.split("\n").map((line) => line.trim()).filter((line) => line);
    let csvRows = [];
    let isDataSegment = false;
    let previousBalance = 0;
    let previousBalanceFound = false;

    for (let i = 0; i < lines.length; i++) {
		//Skip empty lines
		if (lines[i] == "") {
			continue;
		}

        //Find the previous balance, for amount calculation. This is done because it's hard to know if the amount is debit or credit.
        if (lines[i].includes(previousBalanceMarker)) {
            previousBalanceFound = true;
            previousBalance = lines[i].replace(/\,/g,"").replace(previousBalanceMarker,"");
            continue;
        }
		
        //If data segment hasn't been found yet, keep looking for it
        if (!isDataSegment) {
            if (lines[i].includes(dataStartMarker)) { //Data segment has been found
                isDataSegment = true; 
                continue;
            }
        } else { //We're in the data segment
            
            //Make sure data segment hasn't ended
            if (dataEndMarkers.some((marker) => lines[i].includes(marker))) {
                isDataSegment = false;
                continue;
            }
			
            //Ignore unnecessary lines
            if (dataSkipLines.some((marker) => lines[i].includes(marker))) {
                continue;
            }
			
            //Make sure we have enough lines ahead to read
            if (i + 7 >= lines.length) break;

            const date = lines[i++].replace(/\,/g,"");
            const time = lines[i++].replace(/\,/g,"");
            const channel = lines[i++].replace(/\,/g,"");
            let amount = lines[i++].replace(/\,/g,"");
            const balance = lines[i++].replace(/\,/g,"");
            const description = lines[i++].replace(/\,/g,"");
            const note = lines[i++].replace(/\,/g,"");

            //If the previous balance has been found before, correct the amount
            if (previousBalanceFound) {
                amount = previousBalance - balance;
                amount = Math.round(amount * 100) / 100; //Round to 2 decimal points
            }

            previousBalance = balance;
            previousBalanceFound = true;

            const newCsvLine = [date, time, channel, amount, balance, description, note].join(",");

            console.log(newCsvLine);
            csvRows.push(newCsvLine);
        }
    }
    
    if (csvRows.length > 0) {
        return csvRows.join("\n") + "\n";
    } else {
        return "";
    }
}


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
    errorMessage.style.display = "none";
    errorMessage.textContent = "";
}
