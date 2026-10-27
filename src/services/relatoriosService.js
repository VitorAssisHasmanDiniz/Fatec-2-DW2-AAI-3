
const pool = require("../config/db");
const HttpError = require("../utils/httpError");

function validarPeriodo(dataInicio, dataFim) {
    const formatoData = /^\d{4}-\d{2}-\d{2}$/;

    function dataValida(data) {
        if (typeof data !== "string" || !formatoData.test(data)) {
            return false;
        }

        const dataObjeto = new Date(`${data}T00:00:00.000Z`);

        return !Number.isNaN(dataObjeto.getTime()) &&
            dataObjeto.toISOString().slice(0, 10) === data;
    }

    if (!dataValida(dataInicio) || !dataValida(dataFim)) {
        throw new HttpError(
            400,
            "Informe inicio e fim no formato YYYY-MM-DD com datas válidas."
        );
    }

    if (dataInicio > dataFim) {
        throw new HttpError(
            400,
            "A data inicial não pode ser posterior à data final."
        );
    }
}

async function gerarRelatorioPerformance(dataInicio, dataFim) {
    validarPeriodo(dataInicio, dataFim);

    const parametros = [dataInicio, dataFim];

    const [resumo] = await pool.execute(
        `SELECT
       COUNT(*) AS total_vendas,
       COALESCE(SUM(valor_venda), 0) AS valor_total_vendido,
       COALESCE(AVG(valor_comissao), 0) AS comissao_media_geral
     FROM vendas
     WHERE data_venda >= ?
       AND data_venda < DATE_ADD(?, INTERVAL 1 DAY)`,
        parametros
    );

    const [vendasPorRegiao] = await pool.execute(
        `SELECT
            r.id_regiao,
            r.nome_regiao,
        COUNT(v.id_venda) AS quantidade_vendas,
        COALESCE(SUM(v.valor_venda), 0) AS valor_total_vendido,
        COALESCE(AVG(v.valor_comissao), 0) AS comissao_media
        FROM regioes r
        LEFT JOIN vendas v
        ON v.id_regiao = r.id_regiao
            AND v.data_venda >= ?
            AND v.data_venda < DATE_ADD(?, INTERVAL 1 DAY)
        GROUP BY r.id_regiao, r.nome_regiao
        ORDER BY r.id_regiao`,
        parametros
    );

    const [vendasPorTipoCliente] = await pool.execute(
        `SELECT
        tipo_cliente,
    COUNT(*) AS quantidade_vendas,
    COALESCE(SUM(valor_venda), 0) AS valor_total_vendido
    FROM vendas
    WHERE data_venda >= ?
        AND data_venda < DATE_ADD(?, INTERVAL 1 DAY)
    GROUP BY tipo_cliente
    ORDER BY tipo_cliente`,
        parametros
    );

    const [melhorVendedor] = await pool.execute(
        `SELECT
            ve.id_vendedor,
            ve.nome,
        SUM(v.valor_venda) AS valor_total_vendido,
        COUNT(v.id_venda) AS quantidade_vendas
        FROM vendas v
        INNER JOIN vendedores ve
        ON ve.id_vendedor = v.id_vendedor
        WHERE v.data_venda >= ?
            AND v.data_venda < DATE_ADD(?, INTERVAL 1 DAY)
        GROUP BY ve.id_vendedor, ve.nome
        ORDER BY valor_total_vendido DESC, ve.id_vendedor ASC
        LIMIT 1`,
        parametros
    );

    const [maiorComissao] = await pool.execute(
        `SELECT
            ve.id_vendedor,
            ve.nome,
        SUM(v.valor_comissao) AS comissao_total,
        COUNT(v.id_venda) AS quantidade_vendas
        FROM vendas v
        INNER JOIN vendedores ve
        ON ve.id_vendedor = v.id_vendedor
        WHERE v.data_venda >= ?
            AND v.data_venda < DATE_ADD(?, INTERVAL 1 DAY)
        GROUP BY ve.id_vendedor, ve.nome
        ORDER BY comissao_total DESC, ve.id_vendedor ASC
        LIMIT 1`,
        parametros
    );

    const [metas] = await pool.execute(
        `SELECT COUNT(DISTINCT resultado.id_vendedor) AS vendedores_com_meta_atingida
        FROM (
            SELECT
                ve.id_vendedor,
            DATE_FORMAT(v.data_venda, '%Y-%m') AS mes,
                ve.meta_mensal,
            SUM(v.valor_venda) AS total_mensal
        FROM vendas v
        INNER JOIN vendedores ve
        ON ve.id_vendedor = v.id_vendedor
        WHERE v.data_venda >= ?
            AND v.data_venda < DATE_ADD(?, INTERVAL 1 DAY)
            AND DATE_FORMAT(v.data_venda, '%Y-%m-01') >= ?
            AND LAST_DAY(v.data_venda) <= ?
        GROUP BY
            ve.id_vendedor,
        DATE_FORMAT(v.data_venda, '%Y-%m'),
            ve.meta_mensal
        HAVING SUM(v.valor_venda) >= ve.meta_mensal
        ) AS resultado`,
        [
            dataInicio,
            dataFim,
            dataInicio,
            dataFim
        ]
    );

    return {
        periodo: {
            inicio: dataInicio,
            fim: dataFim
        },
        resumo: resumo[0],
        vendas_por_regiao: vendasPorRegiao,
        vendas_por_tipo_cliente: vendasPorTipoCliente,
        melhor_vendedor: melhorVendedor[0] || null,
        maior_comissao_acumulada: maiorComissao[0] || null,
        metas_atingidas: {
            quantidade_vendedores: Number(
                metas[0].vendedores_com_meta_atingida
            )
        }
    };
}

module.exports = {
    gerarRelatorioPerformance
};
