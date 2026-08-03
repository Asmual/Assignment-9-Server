const express = require("express");
const { ObjectId } = require("mongodb");

// Helper function to safely escape regex special characters
function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

function doctorsRoutes(doctorsCollection) {
  const router = express.Router();

  // GET ALL DOCTORS
  router.get("/", async (req, res) => {
    try {
      const result = await doctorsCollection.find().toArray();
      res.status(200).send(result);
    } catch (error) {
      res.status(500).send({
        success: false,
        message: "Failed to fetch doctors",
      });
    }
  });

  // SEARCH DOCTORS (Must be declared before /:id route)
  router.get("/search", async (req, res) => {
    try {
      const searchQuery = req.query.query ? req.query.query.trim() : "";

      if (!searchQuery) {
        return res.status(200).send({
          success: true,
          doctors: [],
        });
      }

      // Escape special characters and perform a case-insensitive regex search
      const sanitizedQuery = escapeRegex(searchQuery);
      const searchRegex = new RegExp(sanitizedQuery, "i");

      const result = await doctorsCollection
        .find({
          $or: [
            { name: { $regex: searchRegex } },
            { specialty: { $regex: searchRegex } },
            { designation: { $regex: searchRegex } },
            { hospital: { $regex: searchRegex } },
          ],
        })
        .limit(10)
        .toArray();

      res.status(200).send({
        success: true,
        doctors: result,
      });
    } catch (error) {
      console.error("Error searching doctors:", error);
      res.status(500).send({
        success: false,
        message: "Failed to search doctors",
      });
    }
  });

  // GET SINGLE DOCTOR BY ID
  router.get("/:id", async (req, res) => {
    try {
      const id = req.params.id;

      if (!ObjectId.isValid(id)) {
        return res.status(400).send({
          success: false,
          message: "Invalid doctor id",
        });
      }

      const result = await doctorsCollection.findOne({
        _id: new ObjectId(id),
      });

      if (!result) {
        return res.status(404).send({
          success: false,
          message: "Doctor profile not found",
        });
      }

      res.status(200).send(result);
    } catch (error) {
      res.status(500).send({
        success: false,
        message: "Failed to fetch doctor profile",
      });
    }
  });

  return router;
}

module.exports = doctorsRoutes;