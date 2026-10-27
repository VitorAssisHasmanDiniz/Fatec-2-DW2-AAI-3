
const express = require("express");
const pool = require("./config/db");
const asyncHandler = require("./utils/asyncHandler");
const errorHandler = require("./middleware/errorHandler");
const vendedoresRoutes = require("./routes/vendedoresRoutes");
const vendasRoutes = require("./routes/vendasRoutes");
const relatoriosRoutes = require("./routes/relatoriosRoutes");

const app = express();

app.use(express.json());

app.get(
  "/health",
  asyncHandler(async (req, res) => {
    const [resultado] = await pool.query(
      "SELECT DATABASE() AS banco"
    );

    res.status(200).json({
      status: "ok",
      banco: resultado[0].banco
    });
  })
);

app.use("/vendedores", vendedoresRoutes);
app.use("/vendas", vendasRoutes);
app.use("/relatorios", relatoriosRoutes);

app.use((req, res) => {
  res.status(404).json({
    erro: "Rota não encontrada."
  });
});

app.use(errorHandler);

module.exports = app;
