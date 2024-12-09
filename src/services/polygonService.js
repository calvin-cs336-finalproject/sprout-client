import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.REACT_APP_WEB_API_KEY;

const fetchDataFromAPI = async (ticker, date) => {
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

fetchDataFromAPI('AAPL', '2023-01-09');
