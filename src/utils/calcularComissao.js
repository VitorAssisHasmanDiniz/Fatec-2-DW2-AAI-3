
const pool = require("../config/db");
const HttpError = require("./httpError");

async function calcularComissao(
  valorVenda,
  percentualBase,
  tipoCliente,
  idRegiao,
  conexao = pool
) {
  const valor = Number(valorVenda);
  const base = Number(percentualBase);
  const regiaoId = Number(idRegiao);

  if (!Number.isFinite(valor) || valor <= 0) {
    throw new HttpError(400, "O valor da venda deve ser maior que zero.");
  }

  if (
    !Number.isFinite(base) ||
    base < 0 ||
    base > 100
  ) {
    throw new HttpError(400, "O percentual base deve estar entre 0 e 100.");
  }

  if (tipoCliente !== "PF" && tipoCliente !== "PJ") {
    throw new HttpError(400, "O tipo de cliente deve ser PF ou PJ.");
  }

  if (!Number.isSafeInteger(regiaoId) || regiaoId <= 0) {
    throw new HttpError(400, "O ID da região deve ser um inteiro positivo.");
  }

  const [regioes] = await conexao.execute(
    `SELECT percentual_bonus
     FROM regioes
     WHERE id_regiao = ?`,
    [regiaoId]
  );

  if (regioes.length === 0) {
    throw new HttpError(404, "Região não encontrada.");
  }

  const percentualCliente = tipoCliente === "PF" ? 2 : 3;
  const percentualRegiao = Number(regioes[0].percentual_bonus);

  const percentualTotal =
    base + percentualCliente + percentualRegiao;

  const comissao = Math.round(
    (valor * percentualTotal / 100 + Number.EPSILON) * 100
  ) / 100;

  return comissao;
}

module.exports = calcularComissao;
