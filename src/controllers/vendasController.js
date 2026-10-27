
const vendasService = require("../services/vendasService");

async function registrarVenda(req, res) {
  const venda = await vendasService.registrarVenda(req.body);
  res.status(201).json(venda);
}

async function listarVendas(req, res) {
  const vendas = await vendasService.listarVendas();
  res.status(200).json(vendas);
}

async function consultarVendasPorVendedor(req, res) {
  const vendas = await vendasService.consultarVendasPorVendedor(
    req.params.id
  );

  res.status(200).json(vendas);
}

async function consultarVendasPorRegiao(req, res) {
  const vendas = await vendasService.consultarVendasPorRegiao(
    req.params.id
  );

  res.status(200).json(vendas);
}

async function excluirVenda(req, res) {
  const resultado = await vendasService.excluirVenda(req.params.id);
  res.status(200).json(resultado);
}

module.exports = {
  registrarVenda,
  listarVendas,
  consultarVendasPorVendedor,
  consultarVendasPorRegiao,
  excluirVenda
};
