import { onSchedule } from "firebase-functions/v2/scheduler";
import { logger } from "firebase-functions";
import { fetchDataOfAllCompaniesForOneDay } from "../src/services/polygonService.js";

export const dailyDataFetch = onSchedule(
    {
        schedule: "0 13 * * *", //
        timeZone: "America/New_York", // Ensures scheduling in EST
        options: {
            timeoutSeconds: 600, // Set timeout limit --> but this doesn't seem to be working on the emulator
        },
    },
    async () => {
        try {
            // Calculate the date for the previous day
            const now = new Date();
            now.setDate(now.getDate() - 1); // Go back one day
            const previousDate = now.toISOString().split("T")[0]; // Format as YYYY-MM-DD
            //fetch data from the day before (data today is not available yet)

            //logger.info(`Fetching data for ${previousDate}...`);
            await fetchDataOfAllCompaniesForOneDay(previousDate);
            logger.info("Data fetch completed successfully.");
        } catch (error) {
            logger.error("Error in daily data fetch:", error);
        }
    }
);

//Test-------------------------------------------- (Produced by AI)
// if (process.env.FUNCTIONS_EMULATOR) {
//     // Call your function manually for testing
//     const testDate = "2024-12-06"; // Replace with the desired test date
//     fetchDataOfAllCompaniesForOneDay(testDate).then(() => {
//         console.log("Test fetch completed.");
//     }).catch((error) => {
//         console.error("Test fetch failed:", error);
//     });
// }

