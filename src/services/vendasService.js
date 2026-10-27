
const pool = require("../config/db");
const HttpError = require("../utils/httpError");
const calcularComissao = require("../utils/calcularComissao");

const CAMPOS_VENDA = `
  v.id_venda,
  v.id_vendedor,
  ve.nome AS nome_vendedor,
  v.id_regiao,
  r.nome_regiao,
  v.data_venda,
  v.valor_venda,
  v.tipo_cliente,
  v.valor_comissao
`;

const JOINS_VENDA = `
  FROM vendas v
  INNER JOIN vendedores ve ON ve.id_vendedor = v.id_vendedor
  INNER JOIN regioes r ON r.id_regiao = v.id_regiao
`;

async function registrarVenda(dados) {
  const {
    id_vendedor,
    id_regiao,
    valor_venda,
    tipo_cliente
  } = dados;

  const vendedorId = Number(id_vendedor);
  const regiaoId = Number(id_regiao);
  const valor = Number(valor_venda);

  if (!Number.isSafeInteger(vendedorId) || vendedorId <= 0) {
    throw new HttpError(400, "O ID do vendedor deve ser um inteiro positivo.");
  }

  if (!Number.isSafeInteger(regiaoId) || regiaoId <= 0) {
    throw new HttpError(400, "O ID da região deve ser um inteiro positivo.");
  }

  if (
    valor_venda === undefined ||
    valor_venda === null ||
    valor_venda === "" ||
    !Number.isFinite(valor) ||
    valor <= 0
  ) {
    throw new HttpError(400, "O valor da venda deve ser maior que zero.");
  }

  if (tipo_cliente !== "PF" && tipo_cliente !== "PJ") {
    throw new HttpError(400, "O tipo de cliente deve ser PF ou PJ.");
  }

  const conexao = await pool.getConnection();

  try {
    await conexao.beginTransaction();

    const [vendedores] = await conexao.execute(
      `SELECT id_vendedor, percentual_base, ativo
       FROM vendedores
       WHERE id_vendedor = ?
       FOR UPDATE`,
      [vendedorId]
    );

    if (vendedores.length === 0) {
      throw new HttpError(404, "Vendedor não encontrado.");
    }

    if (!vendedores[0].ativo) {
      throw new HttpError(400, "Não é possível registrar vendas para um vendedor inativo.");
    }

    const comissao = await calcularComissao(
      valor,
      Number(vendedores[0].percentual_base),
      tipo_cliente,
      regiaoId,
      conexao
    );

    const [resultado] = await conexao.execute(
      `INSERT INTO vendas
        (id_vendedor, id_regiao, valor_venda, tipo_cliente, valor_comissao)
       VALUES (?, ?, ?, ?, ?)`,
      [vendedorId, regiaoId, valor, tipo_cliente, comissao]
    );

    await conexao.commit();

    const [vendas] = await pool.execute(
      `SELECT ${CAMPOS_VENDA}
       ${JOINS_VENDA}
       WHERE v.id_venda = ?`,
      [resultado.insertId]
    );

    return vendas[0];
  } catch (erro) {
    await conexao.rollback();
    throw erro;
  } finally {
    conexao.release();
  }
}

async function listarVendas() {
  const [vendas] = await pool.query(
    `SELECT ${CAMPOS_VENDA}
     ${JOINS_VENDA}
     ORDER BY v.data_venda DESC, v.id_venda DESC`
  );

  return vendas;
}

async function consultarVendasPorVendedor(id) {
  const vendedorId = Number(id);

  if (!Number.isSafeInteger(vendedorId) || vendedorId <= 0) {
    throw new HttpError(400, "O ID do vendedor deve ser um inteiro positivo.");
  }

  const [vendedores] = await pool.execute(
    "SELECT id_vendedor FROM vendedores WHERE id_vendedor = ?",
    [vendedorId]
  );

  if (vendedores.length === 0) {
    throw new HttpError(404, "Vendedor não encontrado.");
  }

  const [vendas] = await pool.execute(
    `SELECT ${CAMPOS_VENDA}
     ${JOINS_VENDA}
     WHERE v.id_vendedor = ?
     ORDER BY v.data_venda DESC, v.id_venda DESC`,
    [vendedorId]
  );

  return vendas;
}

async function consultarVendasPorRegiao(id) {
  const regiaoId = Number(id);

  if (!Number.isSafeInteger(regiaoId) || regiaoId <= 0) {
    throw new HttpError(400, "O ID da região deve ser um inteiro positivo.");
  }

  const [regioes] = await pool.execute(
    "SELECT id_regiao FROM regioes WHERE id_regiao = ?",
    [regiaoId]
  );

  if (regioes.length === 0) {
    throw new HttpError(404, "Região não encontrada.");
  }

  const [vendas] = await pool.execute(
    `SELECT ${CAMPOS_VENDA}
     ${JOINS_VENDA}
     WHERE v.id_regiao = ?
     ORDER BY v.data_venda DESC, v.id_venda DESC`,
    [regiaoId]
  );

  return vendas;
}

async function excluirVenda(id) {
  const vendaId = Number(id);

  if (!Number.isSafeInteger(vendaId) || vendaId <= 0) {
    throw new HttpError(400, "O ID da venda deve ser um inteiro positivo.");
  }

  const [resultado] = await pool.execute(
    "DELETE FROM vendas WHERE id_venda = ?",
    [vendaId]
  );

  if (resultado.affectedRows === 0) {
    throw new HttpError(404, "Venda não encontrada.");
  }

  return {
    mensagem: "Venda excluída com sucesso.",
    id_venda: vendaId
  };
}

module.exports = {
  registrarVenda,
  listarVendas,
  consultarVendasPorVendedor,
  consultarVendasPorRegiao,
  excluirVenda
};
