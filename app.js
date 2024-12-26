/** BizTime express application. */

const express = require("express");
const ExpressError = require("./expressError");
const companiesRoutes = require("./routes/companies");
const invoicesRoutes = require("./routes/invoices");

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Company routes
app.use("/companies", companiesRoutes);

// Invoice routes
app.use("/invoices", invoicesRoutes);

// 404 handler
app.use((req, res, next) => {
  const err = new ExpressError("Not Found", 404);
  return next(err);
});

// General error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  return res.json({
    error: err.message || "Something went wrong",
    message: err.message
  });
});

module.exports = app;
