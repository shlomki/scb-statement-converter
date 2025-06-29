// handlers/SCBHandler.js

export function matches(lines) {
    return lines.some((line) => line.includes("รายการ/ช่องทาง"));
}

export async function convert(pdf) {
    const csvHeader = "Date,Time,Channel,Amount,Balance,Description,Note\n";
    let csvContent = csvHeader;
    let previousBalance = 0;
    let previousBalanceFound = false;

    for (let i = 0; i < pdf.numPages; i++) {
        const page = await pdf.getPage(i + 1);
        const textContent = await page.getTextContent();
        const lines = textContent.items.map((item) => item.str.trim()).filter(Boolean);

        const dataStartMarker = "รายการ/ช่องทาง";
        const dataEndMarkers = ["www.scb.co.th", "Total amount"];
        const dataSkipLines = [
            "Balance brought forward",
            "NOTE :",
            "DESC :",
            "ลูกหนี้",
            "เจ้าหนี้",
            "รายละเอียด/บันทึกช่วยจํ",
            "ยอดเงินคงเหลือยกมา",
        ];
        const previousBalanceMarker = "***";

        let csvRows = [];
        let isDataSegment = false;

        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes(previousBalanceMarker)) {
                previousBalanceFound = true;
                previousBalance = parseFloat(lines[i].replace(/,/g, "").replace(previousBalanceMarker, ""));
                continue;
            }

            if (!isDataSegment) {
                if (lines[i].includes(dataStartMarker)) {
                    isDataSegment = true;
                    continue;
                }
            } else {
                if (dataEndMarkers.some((marker) => lines[i].includes(marker))) {
                    isDataSegment = false;
                    continue;
                }

                if (dataSkipLines.some((marker) => lines[i].includes(marker))) {
                    continue;
                }

                if (i + 6 >= lines.length) break;

                const date = lines[i++].replace(/,/g, "");
                const time = lines[i++].replace(/,/g, "");
                const channel = lines[i++].replace(/,/g, "");
                let amount = lines[i++].replace(/,/g, "");
                const balance = lines[i++].replace(/,/g, "");
                const description = lines[i++].replace(/,/g, "");
                const note = lines[i++].replace(/,/g, "");

                if (previousBalanceFound) {
                    amount = previousBalance - parseFloat(balance);
                    amount = Math.round(amount * 100) / 100;
                }

                previousBalance = parseFloat(balance);
                previousBalanceFound = true;

                const newCsvLine = [date, time, channel, amount, balance, description, note].join(",");
                csvRows.push(newCsvLine);
            }
        }

        if (csvRows.length > 0) {
            csvContent += csvRows.join("\n") + "\n";
        }
    }

    return csvContent;
}
