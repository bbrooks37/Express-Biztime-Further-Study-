const express = require("express");
const db = require("../db");
const router = express.Router();

// Add an industry
router.post("/", async (req, res, next) => {
  try {
    const { code, industry } = req.body;
    const result = await db.query(
      "INSERT INTO industries (code, industry) VALUES ($1, $2) RETURNING code, industry",
      [code, industry]
    );
    return res.status(201).json({ industry: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

// List all industries
router.get("/", async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT i.code, i.industry, ARRAY_AGG(ci.comp_code) AS companies 
       FROM industries AS i
       LEFT JOIN company_industries AS ci ON i.code = ci.ind_code
       GROUP BY i.code`
    );
    return res.json({ industries: result.rows });
  } catch (err) {
    return next(err);
  }
});

// Associate an industry with a company
router.post("/associate", async (req, res, next) => {
  try {
    const { comp_code, ind_code } = req.body;
    const result = await db.query(
      "INSERT INTO company_industries (comp_code, ind_code) VALUES ($1, $2) RETURNING comp_code, ind_code",
      [comp_code, ind_code]
    );
    return res.status(201).json({ association: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
