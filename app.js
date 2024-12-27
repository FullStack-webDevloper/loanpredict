const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("index");
});


app.post("/predict", async (req, res) => {
    try {
        const { features } = req.body;  
        console.log("Received features:", features); 

        if (!features || !Array.isArray(features)) {
            return res.status(400).json({ 
                message: "Input data must include a 'features' array." 
            });
        }

        const modelApiUrl = 'https://loan-predictor-daqr.onrender.com/predict'; 

        const fetch = (await import('node-fetch')).default;

        const response = await fetch(modelApiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({ features }) 
        });

        if (!response.ok) {
            console.error("Model API Error:", await response.text());
            return res.status(500).json({ 
                message: "Failed to get prediction from model API." 
            });
        }

        const result = await response.json();
        console.log("Model API Response:", result);

    
        if (result.prediction !== undefined && result.prediction !== null) {
            return res.json({ prediction: result.prediction });
        } else {
            return res.status(500).json({ 
                message: "Model API did not return a prediction." 
            });
        }
    } catch (error) {
        console.error("Error processing request:", error.message);
        return res.status(500).json({ 
            message: "Error processing the request.",
            error: error.message 
        });
    }
});
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
