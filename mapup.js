const express = require("express");
const bodyParser = require("body-parser");
const turf = require("@turf/turf");

const app = express();
app.use(bodyParser.json());

// Middleware for header-based authentication
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    // Perform authentication logic here
    // Example: validate the token against a secret key or database
    if (token === "your_secret_token") {
      next(); // Authentication successful
    } else {
      res.sendStatus(401); // Unauthorized
    }
  } else {
    res.sendStatus(401); // Unauthorized
  }
};

// POST route for intersecting linestring with the set of lines
app.post("/api/intersect", authMiddleware, (req, res) => {
  try {
    // Log the incoming request
    console.log("Incoming request:", req.body);

    // Check if the request body contains a valid GeoJSON linestring
    const { geometry } = req.body;
    if (!geometry || geometry.type !== "LineString" || !geometry.coordinates) {
      res.status(400).json({ error: "Invalid linestring" });
      return;
    }

    // Generate 50 random line features
    const lines = [];
    for (let i = 1; i <= 50; i++) {
      const startPoint = turf.randomPosition();
      const endPoint = turf.randomPosition();
      const line = turf.lineString([startPoint, endPoint], { id: `L${i}` });
      lines.push(line);
    }

    // Create the linestring feature from the request body
    const linestring = turf.lineString(geometry.coordinates);

    // Find intersections between the linestring and the set of lines
    const intersectingLines = lines.filter((line) =>
      turf.booleanIntersects(linestring, line)
    );

    // Prepare the response
    if (intersectingLines.length === 0) {
      res.json([]); // No intersections
    } else {
      const results = intersectingLines.map((line) => ({
        id: line.properties.id,
        intersection: turf.lineIntersect(linestring, line).features[0].geometry
          .coordinates
      }));
      res.json(results); // Array of intersecting line ids with intersection points
    }
  } catch (error) {
    // Log and handle errors
    console.error("Error:", error);
    res.sendStatus(500);
  }
});

// Start the server
app.listen(3000, () => {
  console.log("Server started on port 3000");
});
