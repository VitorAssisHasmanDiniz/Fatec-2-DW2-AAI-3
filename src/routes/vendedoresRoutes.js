
const express = require("express");
const vendedoresController = require("../controllers/vendedoresController");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.post(
  "/",
  asyncHandler(vendedoresController.cadastrarVendedor)
);

router.get(
  "/",
  asyncHandler(vendedoresController.listarVendedores)
);

router.get(
  "/:id",
  asyncHandler(vendedoresController.consultarVendedorPorId)
);

router.put(
  "/:id",
  asyncHandler(vendedoresController.atualizarVendedor)
);

router.patch(
  "/:id/desativar",
  asyncHandler(vendedoresController.desativarVendedor)
);

module.exports = router;
