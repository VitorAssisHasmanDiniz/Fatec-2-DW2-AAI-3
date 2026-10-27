
const express = require("express");
const vendasController = require("../controllers/vendasController");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.post(
  "/",
  asyncHandler(vendasController.registrarVenda)
);

router.get(
  "/vendedor/:id",
  asyncHandler(vendasController.consultarVendasPorVendedor)
);

router.get(
  "/regiao/:id",
  asyncHandler(vendasController.consultarVendasPorRegiao)
);

router.get(
  "/",
  asyncHandler(vendasController.listarVendas)
);

router.delete(
  "/:id",
  asyncHandler(vendasController.excluirVenda)
);

module.exports = router;
