const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Candidate = require("../models/candidate");
const { jwtAuthMiddleware, generateToken } = require("../jwt");

const checkAdminRole = async (userID) => {
  try {
    const user = await User.findById(userID);
    if (user.role === "admin") {
      return true;
    }
  } catch (err) {
    return false;
  }
};

router.get("/", async (req, res) => {
  try {
    const response = await Candidate.find({}, "name party -_id");
    res.status(200).json({ response });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST route to add a candidate
router.post("/", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id)))
      return res.status(403).json({ message: "user does not have admin role" });

    const data = req.body; // Assuming the request body contains the candidate data

    // Create a new User document using the Mongoose model
    const newCandidate = new Candidate(data);

    // Save the new user to the database
    const response = await newCandidate.save();
    console.log("data saved");
    res.status(200).json({ response: response });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/:candidateID", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!checkAdminRole(req.user.id))
      return res.status(403).json({ message: "user does not have admin role" });

    const candidateID = req.params.candidateID; // Extract the id from the URL parameter
    const updatedCandidateData = req.body; // Updated data for the person

    const response = await Candidate.findByIdAndUpdate(
      candidateID,
      updatedCandidateData,
      {
        new: true, // Return the updated document
        runValidators: true, // Run Mongoose validation
      }
    );

    if (!response) {
      return res.status(404).json({ error: "Candidate not found" });
    }

    console.log("candidate data updated");
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/:candidateID", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!checkAdminRole(req.user.id)) {
      return res.status(403).json({ error: "User doesn't have admin role." });
    }
    const candidateID = req.params.candidateID;
    const response = await Candidate.findByIdAndDelete(candidateID);

    if (!response) {
      return res.status(404).json({ error: "Candidate not found." });
    }

    res.status(200).json({ response });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/vote/:candidateID", jwtAuthMiddleware, async (req, res) => {
  try {
    const candidatID = req.params.candidateID;
    const userID = req.user.id;
    const candidate = await Candidate.findById(candidatID);
    if (!candidate) {
      return res.status(404).json({ error: "Candidate not found." });
    }

    const user = await User.findById(userID);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    if (user.isVoted) {
      return res.status(400).json({ error: "You have already voted" });
    }

    if (user.role === "admin") {
      return res.status(400).json({ error: "Admin is not allowed" });
    }

    candidate.votes.push({ user: userID });
    candidate.voteCount++;
    await candidate.save();

    user.isVoted = true;
    res.status(200).json({ message: "Vote recorded successfully." });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/vote/count", async (req, res) => {
  try {
    const candidates = await Candidate.find().sort({ voteCount: "desc" });
    const voteRecord = candidates.map((candidate) => ({
      party: candidate.party,
      count: candidate.voteCount,
    }));

    res.status(200).json({ voteRecord });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
