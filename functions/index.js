
import { onSchedule } from "firebase-functions/scheduler";
import { fetchDataOfAllCompaniesForOneDay } from "../src/services/polygonService.js";

export const dailyDataFetch = onSchedule("0 13 * * *", async () => {
    try {
        // Calculate the date for the previous day
        const now = new Date();
        now.setDate(now.getDate() - 1); // Go back one day
        const previousDate = now.toISOString().split("T")[0]; // Format as YYYY-MM-DD

        console.log(`Fetching data for ${previousDate}...`);
        await fetchDataOfAllCompaniesForOneDay(previousDate);
        console.log("Data fetch completed successfully.");
    } catch (error) {
        console.error("Error in daily data fetch:", error);
    }
});


//Test--------------------------------------------
// if (process.env.FUNCTIONS_EMULATOR) {
//     // Call your function manually for testing
//     const testDate = "2024-12-11"; // Replace with the desired test date
//     fetchDataOfAllCompaniesForOneDay(testDate).then(() => {
//         console.log("Test fetch completed.");
//     }).catch((error) => {
//         console.error("Test fetch failed:", error);
//     });
// }

