
require("dotenv").config();

const app = require("./app");
const pool = require("./config/db");

const PORT = Number(process.env.PORT || 3000);

async function iniciarServidor() {
  try {
    await pool.query("SELECT 1");

    app.listen(PORT, () => {
      console.log(`API disponível em http://localhost:${PORT}`);
    });
  } catch (erro) {
    console.error("Não foi possível iniciar a API:", erro.message);
    await pool.end();
    process.exitCode = 1;
  }
}

iniciarServidor();
