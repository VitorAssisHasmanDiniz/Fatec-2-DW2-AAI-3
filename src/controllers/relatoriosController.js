
const relatoriosService = require("../services/relatoriosService");

async function gerarRelatorioPerformance(req, res) {
  const { inicio, fim } = req.query;

  const relatorio = await relatoriosService.gerarRelatorioPerformance(
    inicio,
    fim
  );

  res.status(200).json(relatorio);
}

module.exports = {
  gerarRelatorioPerformance
};
