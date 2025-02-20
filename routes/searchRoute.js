import express from "express";
import { searchHN } from "../utils/searchHelper.js";

const router = express.Router();

router.get("/search", async (req, res, next) => {
  try {
    const searchQuery = req.query.q;
    if (!searchQuery) return res.redirect(302, "/");

    const results = await searchHN(searchQuery);
    res.render("search", {
      title: `Search results for: ${searchQuery}`,
      searchResults: results,
      searchQuery,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
