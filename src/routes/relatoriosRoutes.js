
const express = require("express");
const relatoriosController = require("../controllers/relatoriosController");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.get(
  "/performance",
  asyncHandler(relatoriosController.gerarRelatorioPerformance)
);

module.exports = router;
