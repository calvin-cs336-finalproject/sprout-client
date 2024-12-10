import fetch from 'node-fetch';
import { addStockData } from './firestoreService.js';
import { POLYGON_API_KEY } from '../credentials.js';

const apiKey = POLYGON_API_KEY;
let data;

const fetchOneSetOfDataFromAPI = async (ticker, date) => {
    const url = 'https://api.polygon.io/v1/open-close/' + ticker + '/' + date + '?adjusted=true&apiKey=' + apiKey;
    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log(data);
        return { date: data.from, close: data.close };
    } catch (error) {
        console.error("Error fetching API data:", error);
        return null;
    }
};

const fetchDataFromAPI = async (ticker, date) => {
    const url = 'https://api.polygon.io/v1/open-close/' + ticker + '/' + date + '?adjusted=true&apiKey=' + apiKey;
    try {
        const response = await fetch(url);
        data = await response.json();

        if (data.status === 'OK') {
            console.log(`Fetched data for ${date}:`, data);
            return { date: data.from, close: data.close };
        } else if (data.status === 'NOT_FOUND') {
            console.warn(`No data for ${date}: ${data.message}`);
            return null;
        } else {
            console.error(`Unexpected response for ${date}:`, data);
            return null;
        }
    } catch (error) {
        console.error("Error fetching API data:", error);
        return null;
    }
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchAndStoreData = async (ticker, startDate, endDate) => {
    const currentDate = new Date(startDate);
    let callCount = 0;

    while (currentDate <= new Date(endDate)) {
        const formattedDate = currentDate.toISOString().split('T')[0];
        const data = await fetchDataFromAPI(ticker, formattedDate);

        //console.log(typeof (data));
        if (data) {
            // Add data to Firestore
            await addStockData(ticker, data.date, data.close, "stocks");
        }

        // Move to the next day
        currentDate.setDate(currentDate.getDate() + 1);
        callCount++;

        // Check if we've made 4 API calls
        if (callCount === 4 || currentDate === endDate) {
            console.log("Reached rate limit, waiting for a minute...");
            await delay(60000); // Wait for 1 minute
            callCount = 0; // Reset the counter
        }
    }

    console.log("Finished fetching and storing data.");
};

const fetchDataOfAllCompanies = async (startDate, endDate) => {
    //execluded 'AAPL' and 'NVDA' since it is already filled
    const top20NYSECompanies = [
        'MSFT', 'AMZN', 'GOOGL', 'META', 'TSLA', 'BRK.B', 'TSM', 'AVGO',
        'WMT', 'LLY', 'JPM', 'V', 'ORCL', 'UNH', 'XOM', 'NVO', 'MA', 'COST'
    ];
    for (let ticker of top20NYSECompanies) {
        try {
            console.log(`Fetching data for ${ticker}...`);
            // Call fetchAndStoreData for each ticker
            await fetchAndStoreData(ticker, startDate, endDate);
            console.log(`Successfully fetched and stored required data for ${ticker}. Now waiting
                to ensure throttle limit is not hit.`);
            await delay(60000);
        } catch (error) {
            console.error(`Error fetching data for ${ticker}:`, error);
        }
    }
};

const fetchDataOfAllCompaniesForOneDay = async (date) => {
    const top20NYSECompanies = [
        'AAPL', 'NVDA', 'MSFT', 'AMZN', 'GOOGL', 'META', 'TSLA', 'BRK.B', 'TSM', 'AVGO',
        'WMT', 'LLY', 'JPM', 'V', 'ORCL', 'UNH', 'XOM', 'NVO', 'MA', 'COST'
    ];
    let count = 0;
    for (let ticker of top20NYSECompanies) {
        fetchOneSetOfDataFromAPI(ticker, date);
        count++;
        if (count === 4) {
            console.log("Query limit hit, must wait one minute before querying again");
            await delay(60000); // Wait for 1 minute to not hit query limit
            count = 0; // Reset the counter
        }
    }

};

//fetchAndStoreData('AMZN', '2024-11-06', '2024-12-06');
//fetchOneSetOfDataFromAPI('BRK.B', '2024-11-06');
//fetchDataOfAllCompanies('2024-11-06', '2024-12-06');
fetchDataOfAllCompaniesForOneDay('2024-12-09');
