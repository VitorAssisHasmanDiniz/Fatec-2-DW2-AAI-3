
const vendedoresService = require("../services/vendedoresService");

async function cadastrarVendedor(req, res) {
  const vendedor = await vendedoresService.cadastrarVendedor(req.body);
  res.status(201).json(vendedor);
}

async function listarVendedores(req, res) {
  const ativos = req.query.ativos;

  if (ativos !== undefined && ativos !== "true" && ativos !== "false") {
    return res.status(400).json({
      erro: 'O parâmetro "ativos" deve ser "true" ou "false".'
    });
  }

  const vendedores = await vendedoresService.listarVendedores(
    ativos === "true"
  );

  res.status(200).json(vendedores);
}

async function consultarVendedorPorId(req, res) {
  const vendedor = await vendedoresService.consultarVendedorPorId(
    req.params.id
  );

  res.status(200).json(vendedor);
}

async function atualizarVendedor(req, res) {
  const vendedor = await vendedoresService.atualizarVendedor(
    req.params.id,
    req.body
  );

  res.status(200).json(vendedor);
}

async function desativarVendedor(req, res) {
  const vendedor = await vendedoresService.desativarVendedor(
    req.params.id
  );

  res.status(200).json({
    mensagem: "Vendedor desativado com sucesso.",
    vendedor
  });
}

module.exports = {
  cadastrarVendedor,
  listarVendedores,
  consultarVendedorPorId,
  atualizarVendedor,
  desativarVendedor
};
