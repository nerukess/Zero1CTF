const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Pool } = require("pg");

// PostgreSQL connection pool (replace placeholders with your actual credentials)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || "postgresql://challenge_registry_user:tlmAT6yRUgrGADILw2FqBvmrUUA9wxaS@dpg-cth1vk8gph6c73d7cai0-a/challenge_registry",
    ssl: {
        rejectUnauthorized: false, // Required for Render-hosted PostgreSQL
    },
});

// Test connection to ensure it works
pool.connect((err) => {
    if (err) {
        console.error("Database connection error:", err);
    } else {
        console.log("Connected to PostgreSQL database successfully.");
    }
});

// Function to initialize the database and create the `users` table
async function initializeDatabase() {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
            name VARCHAR(100) NOT NULL,         
            surname VARCHAR(100) NOT NULL,      
            time_elapsed FLOAT NOT NULL,        
            registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    try {
        // Run the query to create the table
        await pool.query(createTableQuery);
        console.log("Database initialized and `users` table is ready.");
    } catch (error) {
        console.error("Error initializing the database:", error);
    }
}

// Initialize database when server starts
initializeDatabase();

const app = express();
const PORT = 3000;

// Middleware
app.use(cors()); // Enable cross-origin requests
app.use(bodyParser.json()); // Parse incoming JSON data

// Store correct challenge answers securely on the backend
const challengeAnswers = {
    challenge1: "FLAG{mA7r1x_cR4Ck}",
    challenge2: "FLAG{0p3N_Y0uR_3yE5_H4h4}",
    challenge3: "FLAG{ImP3R14L_M1gHt}",
    challenge4: "FLAG{Kr!Z1Uk41_nUlL1uK4!}",
    challenge5: "FLAG{H0W_d1D_yOU_FiNd_U5}",
    challenge6: "FLAG{IT%_%uRe_lS}",
    challenge7: "FLAG{H3X_D3Cor}",
    challenge8: "FLAG{M4lW3rE_F0unD}",
    challenge9: "FLAG{Own3r_MlsslnG}",
    challenge10: "FLAG{M3t4_Pr4ct1c3}",
};

// Endpoint to validate flags
app.post("/validate", (req, res) => {
    const { challengeId, userAnswer } = req.body;

    // Check if the challenge ID and answer are provided
    if (!challengeId || !userAnswer) {
        return res.status(400).json({
            valid: false,
            message: "Invalid request: Please provide both challenge ID and answer.",
        });
    }

    // Look up the correct answer for the challenge
    const correctAnswer = challengeAnswers[challengeId];
    if (!correctAnswer) {
        return res.status(404).json({
            valid: false,
            message: "Challenge not found.",
        });
    }

    // Log inputs and correct answer for debugging
    console.log(`Challenge ID: ${challengeId}`);
    console.log(`User Answer: ${userAnswer}`);
    console.log(`Correct Answer: ${correctAnswer}`);

    // Validate the answer
    if (userAnswer === correctAnswer) {
        return res.json({
            valid: true,
            message: "Correct! Well done.",
        });
    } else if (userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase()) {
        return res.json({
            valid: false,
            message: "Correct answer but wrong case! Remember, the flag is case-sensitive.",
        });
    } else {
        return res.json({
            valid: false,
            message: "Incorrect. Try again!",
        });
    }
});

// Endpoint to register name, surname, and time elapsed after all challenges are completed
app.post("/register", async (req, res) => {
    const { name, surname, timeElapsed } = req.body;

    // Validate inputs
    if (!name || !surname || !timeElapsed) {
        return res.status(400).json({
            success: false,
            message: "Name, surname, and time elapsed are required.",
        });
    }

    try {
        // Insert name, surname, and time elapsed into the PostgreSQL database
        const query = "INSERT INTO users (name, surname, time_elapsed) VALUES ($1, $2, $3)";
        await pool.query(query, [name, surname, timeElapsed]);

        res.status(200).json({
            success: true,
            message: "User successfully registered!",
        });
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({
            success: false,
            message: "Error saving user to the database.",
        });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});