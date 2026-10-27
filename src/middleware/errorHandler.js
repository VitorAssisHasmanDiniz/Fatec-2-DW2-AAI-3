
function errorHandler(erro, req, res, next) {
  if (res.headersSent) {
    return next(erro);
  }

  const status = Number.isInteger(erro.status) &&
    erro.status >= 400 &&
    erro.status <= 599
    ? erro.status
    : 500;

  if (status === 500) {
    console.error(erro);
  }

  res.status(status).json({
    erro: status === 500
      ? "Erro interno do servidor."
      : erro.message
  });
}

module.exports = errorHandler;
