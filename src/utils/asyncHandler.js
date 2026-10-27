
function asyncHandler(funcao) {
  return function (req, res, next) {
    Promise.resolve(funcao(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
