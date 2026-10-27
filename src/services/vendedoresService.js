
const pool = require("../config/db");
const HttpError = require("../utils/httpError");

async function cadastrarVendedor(dados) {
  const { nome, meta_mensal, percentual_base } = dados;

  if (
    typeof nome !== "string" ||
    !nome.trim() ||
    nome.trim().length > 100
  ) {
    throw new HttpError(400, "O nome é obrigatório e deve ter até 100 caracteres.");
  }

  if (
    meta_mensal === undefined ||
    meta_mensal === null ||
    meta_mensal === "" ||
    !Number.isFinite(Number(meta_mensal)) ||
    Number(meta_mensal) < 0
  ) {
    throw new HttpError(400, "A meta mensal deve ser um número maior ou igual a zero.");
  }

  if (
    percentual_base === undefined ||
    percentual_base === null ||
    percentual_base === "" ||
    !Number.isFinite(Number(percentual_base)) ||
    Number(percentual_base) < 0 ||
    Number(percentual_base) > 100
  ) {
    throw new HttpError(400, "O percentual base deve estar entre 0 e 100.");
  }

  const [resultado] = await pool.execute(
    `INSERT INTO vendedores (nome, meta_mensal, percentual_base)
     VALUES (?, ?, ?)`,
    [nome.trim(), Number(meta_mensal), Number(percentual_base)]
  );

  return consultarVendedorPorId(resultado.insertId);
}

async function listarVendedores(apenasAtivos = false) {
  const sql = apenasAtivos
    ? "SELECT * FROM vendedores WHERE ativo = TRUE ORDER BY id_vendedor"
    : "SELECT * FROM vendedores ORDER BY id_vendedor";

  const [vendedores] = await pool.query(sql);
  return vendedores;
}

async function consultarVendedorPorId(id) {
  const idVendedor = Number(id);

  if (!Number.isSafeInteger(idVendedor) || idVendedor <= 0) {
    throw new HttpError(400, "O ID do vendedor deve ser um inteiro positivo.");
  }

  const [vendedores] = await pool.execute(
    "SELECT * FROM vendedores WHERE id_vendedor = ?",
    [idVendedor]
  );

  if (vendedores.length === 0) {
    throw new HttpError(404, "Vendedor não encontrado.");
  }

  return vendedores[0];
}

async function atualizarVendedor(id, dados) {
  const idVendedor = Number(id);
  const { meta_mensal, percentual_base } = dados;

  if (!Number.isSafeInteger(idVendedor) || idVendedor <= 0) {
    throw new HttpError(400, "O ID do vendedor deve ser um inteiro positivo.");
  }

  if (
    meta_mensal === undefined ||
    meta_mensal === null ||
    meta_mensal === "" ||
    !Number.isFinite(Number(meta_mensal)) ||
    Number(meta_mensal) < 0
  ) {
    throw new HttpError(400, "A meta mensal deve ser um número maior ou igual a zero.");
  }

  if (
    percentual_base === undefined ||
    percentual_base === null ||
    percentual_base === "" ||
    !Number.isFinite(Number(percentual_base)) ||
    Number(percentual_base) < 0 ||
    Number(percentual_base) > 100
  ) {
    throw new HttpError(400, "O percentual base deve estar entre 0 e 100.");
  }

  const [resultado] = await pool.execute(
    `UPDATE vendedores
     SET meta_mensal = ?, percentual_base = ?
     WHERE id_vendedor = ?`,
    [Number(meta_mensal), Number(percentual_base), idVendedor]
  );

  if (resultado.affectedRows === 0) {
    await consultarVendedorPorId(idVendedor);
  }

  return consultarVendedorPorId(idVendedor);
}

async function desativarVendedor(id) {
  const vendedor = await consultarVendedorPorId(id);

  if (!vendedor.ativo) {
    return vendedor;
  }

  await pool.execute(
    "UPDATE vendedores SET ativo = FALSE WHERE id_vendedor = ?",
    [Number(id)]
  );

  return consultarVendedorPorId(id);
}

module.exports = {
  cadastrarVendedor,
  listarVendedores,
  consultarVendedorPorId,
  atualizarVendedor,
  desativarVendedor
};
