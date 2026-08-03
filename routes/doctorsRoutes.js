const express = require("express");
const { ObjectId } = require("mongodb");

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

  // SEARCH DOCTORS (Must be placed before /:id route)
  router.get("/search", async (req, res) => {
    try {
      const query = req.query.query;

      if (!query || query.trim() === "") {
        return res.status(200).send({
          success: true,
          doctors: [],
        });
      }

      // Case-insensitive regex search
      const searchRegex = new RegExp(query, "i");

      const result = await doctorsCollection
        .find({
          $or: [
            { name: searchRegex },
            { specialty: searchRegex },
            { designation: searchRegex },
            { hospital: searchRegex },
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

  // GET SINGLE DOCTOR
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