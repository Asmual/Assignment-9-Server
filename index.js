require("dotenv").config();

const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const { client, connectDB } = require("./Config/db");

const doctorsRoutes = require("./routes/doctorsRoutes");
const bookingsRoutes = require("./routes/bookingsRoutes");
const verifyJWT = require("./middlewares/verifyJWT");

const app = express();

const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://docappoint-eight-drab.vercel.app",
    ],
    credentials: true,
  })
);

app.use(express.json());

app.use(cookieParser());

async function startServer() {
  try {
    await connectDB();

    const database = client.db("DocAppoint");

    const doctorsCollection = database.collection("doctors");
    const bookingsCollection = database.collection("bookings");
    const usersCollection = database.collection("users"); // Added users collection

    // JWT Token Generation
    app.post("/jwt", async (req, res) => {
      try {
        const user = req.body;

        const token = jwt.sign(
          user,
          process.env.JWT_SECRET,
          {
            expiresIn: "7d",
          }
        );

        res.send({
          success: true,
          token,
        });
      } catch (error) {
        res.status(500).send({
          success: false,
          message: "Failed to generate token",
        });
      }
    });

    // Profile Update API Endpoint for MongoDB
    app.patch("/api/users/profile", verifyJWT, async (req, res) => {
      try {
        const { name, phone, phoneNumber, image, avatar } = req.body;
        
        // Extract email from JWT decoded token
        const email = req.decoded?.email;

        if (!email) {
          return res.status(400).send({
            success: false,
            message: "User email not found in auth token",
          });
        }

        const userPhone = phone || phoneNumber;
        const userImage = image || avatar;

        const filter = { email: email };
        const updateDoc = {
          $set: {
            email: email,
            ...(name && { name }),
            ...(userPhone && { phone: userPhone }),
            ...(userImage && { image: userImage }),
            updatedAt: new Date(),
          },
        };

        // upsert: true ensures document is created if user record doesn't exist yet
        const options = { upsert: true };

        const result = await usersCollection.updateOne(filter, updateDoc, options);

        res.status(200).send({
          success: true,
          message: "Profile updated successfully in MongoDB!",
          data: result,
        });
      } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).send({
          success: false,
          message: "Failed to update profile",
        });
      }
    });

    // Existing Routes
    app.use(
      "/api/doctors",
      doctorsRoutes(doctorsCollection)
    );

    app.use(
      "/api/bookings",
      bookingsRoutes(bookingsCollection)
    );

    app.get("/", (req, res) => {
      res.send("DocAppoint Server Running...");
    });

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });

  } catch (error) {
    console.log("Server error:", error);
  }
}

startServer();