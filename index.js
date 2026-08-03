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
    const usersCollection = database.collection("user");

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

    // GET User Profile from MongoDB (Used for restoring state after page refresh)
    app.get("/api/users/profile", async (req, res) => {
      try {
        const email = req.query.email;

        if (!email) {
          return res.status(400).send({
            success: false,
            message: "Email query parameter is required",
          });
        }

        const user = await usersCollection.findOne({ email: email });

        res.status(200).send({
          success: true,
          data: user || null,
        });
      } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).send({
          success: false,
          message: "Failed to fetch user profile",
        });
      }
    });

    // PATCH Update User Profile in MongoDB
    app.patch("/api/users/profile", async (req, res) => {
      try {
        // Optional Bearer token check
        let tokenEmail = null;
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
          const token = authHeader.split(" ")[1];
          try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            tokenEmail = decoded?.email;
          } catch (jwtErr) {
            console.log("Optional JWT verification bypassed or token expired");
          }
        }

        const { name, phone, phoneNumber, image, avatar, email: bodyEmail } = req.body;

        // Use JWT decoded email OR explicit body email
        const targetEmail = tokenEmail || bodyEmail;

        if (!targetEmail) {
          return res.status(400).send({
            success: false,
            message: "User email is required to update profile",
          });
        }

        const userPhone = phone || phoneNumber;
        const userImage = image || avatar;

        const filter = { email: targetEmail };
        const updateDoc = {
          $set: {
            email: targetEmail,
            ...(name && { name }),
            ...(userPhone && { phone: userPhone }),
            ...(userImage && { image: userImage }),
            updatedAt: new Date(),
          },
        };

        const options = { upsert: true };

        const result = await usersCollection.updateOne(filter, updateDoc, options);

        res.status(200).send({
          success: true,
          message: "Profile updated successfully in MongoDB!",
          data: result,
        });
      } catch (error) {
        console.error("Error updating profile in DB:", error);
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