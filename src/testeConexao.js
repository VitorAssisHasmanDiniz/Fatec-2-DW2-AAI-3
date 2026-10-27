const pool = require("./config/db");

async function testarConexao() {
  try {
    const [resultado] = await pool.query("SELECT DATABASE() AS banco");

    console.log("Conexão estabelecida!");
    console.log("Banco conectado:", resultado[0].banco);
  } catch (erro) {
    console.error("Erro ao conectar ao banco:", erro.message);
  } finally {
    await pool.end();
  }
}

testarConexao();
