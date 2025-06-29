// handlers/SCBCardXHandler.js

export function matches(lines) {
    return lines.some((line) => line.includes("CARD TYPE"));
}

export async function convert(pdf) {
    const csvHeader = "Posting Date,Transaction Date,Description,Foreign Currency Amount,Amount Baht\n";
    let csvContent = csvHeader;

    const dataStartMarker = "CARD TYPE";
    const dataEndMarkers = ["งยอดรายการบัตรเครดิต CardX", "TOTAL BALANCE", "For the minimum payment"];


    for (let i = 0; i < pdf.numPages; i++) {
        const page = await pdf.getPage(i + 1);
        const textContent = await page.getTextContent();
        const lines = textContent.items.map((item) => item.str.trim()).filter(Boolean);
        // const lines = textContent.items.map((item) => item.str);

        let isDataSegment = false;
        let skipLinesRemaining = 0;
        let csvRows = [];

        for (let j = 0; j < lines.length; j++) {
            const line = lines[j];

            if (!isDataSegment) {
                if (line.includes(dataStartMarker)) {
                    isDataSegment = true;
                    skipLinesRemaining = 2;
                    continue;
                }
            } else {
                if (skipLinesRemaining > 0) {
                    skipLinesRemaining--;
                    continue;
                }

                if (dataEndMarkers.some((marker) => line.includes(marker))) {
                    break; // End of data section
                }

                //Check that we have enough lines to read
                if (j + 4 > lines.length) 
                    break;

                //Check that none of the upcoming lines contains an end of data marker
                for (let upcomingLineIndex = j; upcomingLineIndex < j + 4; upcomingLineIndex++) {
                    const upcomingLine = lines[upcomingLineIndex];
                    if (dataEndMarkers.some((marker) => upcomingLine.includes(marker))) {
                        isDataSegment = false;
                    }   
                }

                if (!isDataSegment)
                    break;
                
                let description = lines[j++].replace(/,/g, "");

                //Continue adding to the description until we find dates (3 lines max)
                for (let descriptionLineIndex = 0; descriptionLineIndex < 3; descriptionLineIndex++) {
                    const descriptionParticle = lines[j];
                    if ( descriptionParticle.match(/[\\\/]/g) ){
                        break;
                    }
                    else {
                        description += " " + descriptionParticle.replace(/,/g, "");
                        j++;
                    }
                }

                //Add dates
                let transactionDate, postingDate;
                transactionDate = lines[j++].replace(/,/g, "");
                postingDate = lines[j++].replace(/,/g, "");
                
                //Add amount lines (if we have 2 amounts, the first is foreignAmount and second is amountBaht)
                let firstAmountLine = lines[j].replace(/,/g, "");
                let foreignAmount = "";
                let amountBaht = firstAmountLine;

                if (j+1 < lines.length && /^-?\d+(\.\d{1,2})?$/.test(lines[j+1])) {
                    foreignAmount = firstAmountLine;
                    amountBaht = lines[++j].replace(/,/g, "");
                }

                const newCsvLine = [
                    postingDate,
                    transactionDate,
                    description,
                    foreignAmount,
                    amountBaht
                ].join(",");

                csvRows.push(newCsvLine);
            }
        }

        if (csvRows.length > 0) {
            csvContent += csvRows.join("\n") + "\n";
        }
    }

    return csvContent;
}
