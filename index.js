const express = require("express");
const winston = require("winston");
const cors = require("cors")
const app = express();
app.use(cors())
// Create a Winston logger instance
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
            return `${timestamp} ${level}: ${message}`;
        })
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'app.log' })
    ]
});

app.get("/", async (req, res) => {
    logger.info("Received a request on /");
    startBackgroundTasks()
    res.status(200).json("Request received, background tasks started");
});

app.listen(4000, () => {
    try {
        logger.info("Server started on http://localhost:4000");
        console.log("http://localhost:4000");
    } catch (error) {
        logger.error(`Error starting the server: ${error.message}`);
        console.log(error);
    }
});

const fetchEndpoints = async (urls) => {
    for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        try {
            logger.info(`Background task ${i + 1} started for URL: ${url}`);
            const response = await fetch(url);
            const data = await response.json();
            logger.info(`Response from server for task ${i + 1}: ${JSON.stringify(data)}`);
        } catch (error) {
            logger.error(`Error fetching from server for task ${i + 1}: ${error.message}`);
        }
    }
};
const urls = [
    "https://learning-management-system-a3kr.onrender.com",
    "https://budget-management-n4bf.onrender.com"

]
const startBackgroundTasks = () => {
    let taskNumber = 1;

    const intervalId = setInterval(() => {
        if (taskNumber > 100000) {
            clearInterval(intervalId);
            logger.info('All background tasks have been started.');
            return;
        }

        // Call the background task without awaiting it
        fetchEndpoints(urls);

        taskNumber++;
    }, 10000); // Call every 10 seconds
};
