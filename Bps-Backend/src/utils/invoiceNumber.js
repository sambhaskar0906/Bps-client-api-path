import InvoiceCounter from "../model/InvoiceCounter.js";

function getStationCode(stationName = "") {
    if (!stationName) return "NA";
    return stationName.trim().substring(0, 3).toUpperCase();
}

export async function generateInvoiceNumber(stationName) {
    const code = getStationCode(stationName);

    const counterDoc = await InvoiceCounter.findOneAndUpdate(
        { stationCode: code },
        { $inc: { counter: 1 } },
        { new: true, upsert: true }
    );

    const serial = String(counterDoc.counter).padStart(4, "0");
    return `BPS/${code}/${serial}`;
}