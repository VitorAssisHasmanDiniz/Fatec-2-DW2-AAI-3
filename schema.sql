
CREATE DATABASE IF NOT EXISTS db_vendas
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_0900_ai_ci;

USE db_vendas;

DROP TABLE IF EXISTS vendas;
DROP TABLE IF EXISTS vendedores;
DROP TABLE IF EXISTS regioes;

CREATE TABLE regioes (
    id_regiao INT AUTO_INCREMENT PRIMARY KEY,
    nome_regiao VARCHAR(50) NOT NULL UNIQUE,
    percentual_bonus DECIMAL(5,2) NOT NULL,
    CONSTRAINT chk_regiao_bonus
        CHECK (percentual_bonus >= 0)
);

CREATE TABLE vendedores (
    id_vendedor INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    meta_mensal DECIMAL(12,2) NOT NULL,
    percentual_base DECIMAL(5,2) NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT chk_vendedor_meta
        CHECK (meta_mensal >= 0),
    CONSTRAINT chk_vendedor_percentual
        CHECK (percentual_base >= 0 AND percentual_base <= 100)
);

CREATE TABLE vendas (
    id_venda INT AUTO_INCREMENT PRIMARY KEY,
    id_vendedor INT NOT NULL,
    id_regiao INT NOT NULL,
    data_venda DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    valor_venda DECIMAL(12,2) NOT NULL,
    tipo_cliente ENUM('PF', 'PJ') NOT NULL,
    valor_comissao DECIMAL(12,2) NOT NULL,

    CONSTRAINT fk_vendas_vendedor
        FOREIGN KEY (id_vendedor)
        REFERENCES vendedores(id_vendedor)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_vendas_regiao
        FOREIGN KEY (id_regiao)
        REFERENCES regioes(id_regiao)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT chk_venda_valor
        CHECK (valor_venda > 0),

    CONSTRAINT chk_venda_comissao
        CHECK (valor_comissao >= 0),

    INDEX idx_vendas_data (data_venda),
    INDEX idx_vendas_vendedor_data (id_vendedor, data_venda),
    INDEX idx_vendas_regiao_data (id_regiao, data_venda)
);

INSERT INTO regioes (nome_regiao, percentual_bonus) VALUES
    ('Norte', 1.00),
    ('Nordeste', 1.00),
    ('Sudeste', 0.00),
    ('Sul', 0.50);

INSERT INTO vendedores (nome, meta_mensal, percentual_base, ativo) VALUES
    ('Ana Souza', 20000.00, 5.00, TRUE),
    ('Bruno Lima', 25000.00, 6.00, TRUE),
    ('Carla Mendes', 18000.00, 4.50, TRUE),
    ('Diego Rocha', 30000.00, 5.50, TRUE),
    ('Elisa Martins', 22000.00, 5.00, TRUE);

INSERT INTO vendas (
    id_vendedor,
    id_regiao,
    data_venda,
    valor_venda,
    tipo_cliente,
    valor_comissao
) VALUES
    (1, 1, '2026-10-02 10:00:00', 4500.00, 'PF', 360.00),
    (1, 2, '2026-10-04 14:30:00', 6200.00, 'PJ', 620.00),
    (1, 3, '2026-10-08 09:15:00', 3100.00, 'PF', 217.00),
    (2, 4, '2026-10-03 11:20:00', 8000.00, 'PJ', 760.00),
    (2, 1, '2026-10-05 16:00:00', 7200.00, 'PF', 648.00),
    (2, 3, '2026-10-11 13:45:00', 5000.00, 'PJ', 450.00),
    (3, 2, '2026-10-06 10:10:00', 3500.00, 'PF', 262.50),
    (3, 4, '2026-10-09 15:30:00', 4100.00, 'PJ', 328.00),
    (3, 3, '2026-10-13 12:00:00', 2900.00, 'PF', 188.50),
    (4, 1, '2026-10-01 08:40:00', 9500.00, 'PJ', 902.50),
    (4, 2, '2026-10-12 17:10:00', 6700.00, 'PJ', 636.50),
    (4, 3, '2026-10-15 09:00:00', 5600.00, 'PF', 420.00),
    (5, 4, '2026-10-07 10:50:00', 6000.00, 'PF', 450.00),
    (5, 2, '2026-10-16 14:10:00', 7400.00, 'PJ', 666.00),
    (5, 3, '2026-10-18 16:25:00', 3900.00, 'PF', 273.00);
