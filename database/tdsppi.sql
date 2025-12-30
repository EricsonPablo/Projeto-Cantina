-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 10/12/2025 às 06:04
-- Versão do servidor: 10.4.32-MariaDB
-- Versão do PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `tdsppi`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `carrinho`
--

CREATE TABLE `carrinho` (
  `id` int(11) NOT NULL,
  `id_produto` int(11) NOT NULL,
  `quantidade` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `financas_cliente`
--

CREATE TABLE `financas_cliente` (
  `Id` int(11) NOT NULL COMMENT 'identificador único.',
  `nome` varchar(255) DEFAULT NULL COMMENT 'Nome completo do cliente/aluno.',
  `curso` varchar(100) NOT NULL COMMENT 'Curso ou programa de estudos.',
  `cpf` varchar(14) DEFAULT NULL COMMENT 'CPF (chave de identificação única).',
  `nome_responsavel` varchar(255) NOT NULL COMMENT 'Nome do responsável pelo pagamento.',
  `data_cadastro` datetime DEFAULT NULL COMMENT 'Data em que o cliente foi registrado.',
  `valor_atual` int(11) NOT NULL COMMENT 'Valor atual'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `financas_cliente`
--

INSERT INTO `financas_cliente` (`Id`, `nome`, `curso`, `cpf`, `nome_responsavel`, `data_cadastro`, `valor_atual`) VALUES
(27, 'Eric', 'TDS', '1136', 'Pabline', NULL, -2);

-- --------------------------------------------------------

--
-- Estrutura para tabela `financas_entrada`
--

CREATE TABLE `financas_entrada` (
  `id` int(11) NOT NULL COMMENT 'Identificador único da entrada.',
  `id_financas` int(11) NOT NULL COMMENT 'FOREIGN KEY que aponta clientes_financeiros.id.',
  `valor_recebido` decimal(10,2) NOT NULL COMMENT 'Valor recebido.',
  `responsavel_pagamento` varchar(255) NOT NULL COMMENT 'Quem efetuou o pagamento.',
  `data_criacao` datetime NOT NULL COMMENT 'Quando houve a criação.',
  `data_modificacao` datetime NOT NULL COMMENT 'Data de modificação.'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `financas_entrada`
--

INSERT INTO `financas_entrada` (`id`, `id_financas`, `valor_recebido`, `responsavel_pagamento`, `data_criacao`, `data_modificacao`) VALUES
(2, 15, 20.00, 'Saldo Inicial', '2025-12-09 13:21:27', '2025-12-09 13:21:27'),
(3, 16, 20.00, '', '2025-12-09 13:27:19', '2025-12-09 13:27:19'),
(4, 17, 20.00, '', '2025-12-09 13:30:45', '2025-12-09 13:30:45'),
(5, 18, 20.00, 'Pabline', '2025-12-09 13:34:17', '2025-12-09 13:34:17'),
(6, 19, 50.00, 'Pabline', '2025-12-09 13:34:29', '2025-12-09 13:34:29'),
(7, 20, 10.00, 'Pabline', '2025-12-09 13:34:41', '2025-12-09 13:34:41'),
(8, 21, 10.00, 'Pabline', '2025-12-09 13:34:55', '2025-12-09 13:34:55'),
(9, 22, 20.00, 'Pabline', '2025-12-09 13:38:37', '2025-12-09 13:38:37'),
(10, 23, 10.00, 'Pabline', '2025-12-09 14:16:36', '2025-12-09 14:16:36'),
(11, 24, 10.00, 'Pabline', '2025-12-09 14:24:06', '2025-12-09 14:24:06'),
(12, 25, 100.00, 'Pabline', '2025-12-09 19:42:29', '2025-12-09 19:42:29'),
(13, 26, 120.00, 'Pabline', '2025-12-09 20:02:44', '2025-12-09 20:02:44'),
(14, 27, 10.00, 'Pabline', '2025-12-10 01:43:26', '2025-12-10 01:43:26');

-- --------------------------------------------------------

--
-- Estrutura para tabela `financas_saidas`
--

CREATE TABLE `financas_saidas` (
  `id` int(11) NOT NULL COMMENT 'Identificador único da saída.',
  `id_financas` int(11) NOT NULL COMMENT 'FOREIGN KEY (opcional, se for despesa de cliente).',
  `valor_saida` decimal(10,2) NOT NULL COMMENT 'Valor gasto/despesa',
  `data_criacao` datetime NOT NULL COMMENT 'Quando o valor foi pago. (aluguel, material, etc.).',
  `data_modificacao` datetime NOT NULL COMMENT 'data da modificação'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `financas_saidas`
--

INSERT INTO `financas_saidas` (`id`, `id_financas`, `valor_saida`, `data_criacao`, `data_modificacao`) VALUES
(1, 13, 12.00, '2025-12-09 13:06:15', '2025-12-09 13:06:15'),
(2, 13, 12.00, '2025-12-09 13:06:44', '2025-12-09 13:06:44'),
(3, 13, 200.00, '2025-12-09 13:13:18', '2025-12-09 13:13:18'),
(4, 15, 20.00, '2025-12-09 13:22:47', '2025-12-09 13:22:47'),
(5, 22, 20.00, '2025-12-09 13:39:08', '2025-12-09 13:39:08'),
(6, 23, 10.00, '2025-12-09 14:17:01', '2025-12-09 14:17:01'),
(7, 24, 10.00, '2025-12-09 14:25:09', '2025-12-09 14:25:09'),
(8, 25, 100.00, '2025-12-09 19:43:43', '2025-12-09 19:43:43'),
(9, 25, 100.00, '2025-12-09 19:43:52', '2025-12-09 19:43:52'),
(10, 25, 100.00, '2025-12-09 19:43:58', '2025-12-09 19:43:58'),
(11, 26, 12.00, '2025-12-09 22:50:03', '2025-12-09 22:50:03'),
(12, 26, 20.00, '2025-12-09 22:50:14', '2025-12-09 22:50:14'),
(13, 27, 12.00, '2025-12-10 01:43:37', '2025-12-10 01:43:37');

-- --------------------------------------------------------

--
-- Estrutura para tabela `pedido`
--

CREATE TABLE `pedido` (
  `id` int(11) NOT NULL COMMENT 'ID',
  `id_cliente` int(11) NOT NULL COMMENT 'id',
  `data_pedido` date NOT NULL COMMENT 'data',
  `valor_total` int(11) NOT NULL COMMENT 'total',
  `status` varchar(50) NOT NULL COMMENT 'Status',
  `nomeProduto` varchar(50) NOT NULL COMMENT 'Nome do produto',
  `quantidade` int(11) NOT NULL COMMENT 'quantidade'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `pedido`
--

INSERT INTO `pedido` (`id`, `id_cliente`, `data_pedido`, `valor_total`, `status`, `nomeProduto`, `quantidade`) VALUES
(7, 0, '2025-12-09', 6, 'Pendente', 'Chocolate', 1),
(8, 0, '2025-12-09', 6, 'Pendente', 'Chocolate', 1),
(9, 0, '2025-12-09', 6, 'Pendente', 'Chocolate', 1),
(10, 0, '2025-12-09', 6, 'Pendente', 'Chocolate', 1),
(11, 0, '2025-12-09', 6, 'Pendente', 'Chocolate', 1),
(12, 0, '2025-12-10', 6, 'Pendente', 'Chocolate', 1);

-- --------------------------------------------------------

--
-- Estrutura para tabela `produto`
--

CREATE TABLE `produto` (
  `id` int(11) NOT NULL COMMENT 'O identificador único de cadaproduto.',
  `nome` varchar(100) NOT NULL COMMENT 'Produto1',
  `descricao` text NOT NULL COMMENT 'Descrição',
  `preco` decimal(5,2) NOT NULL COMMENT '5 dígitos totais, 2 após a vírgula: 99.99'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `produto`
--

INSERT INTO `produto` (`id`, `nome`, `descricao`, `preco`) VALUES
(25, 'Chocolate', 'Preto', 6.00);

-- --------------------------------------------------------

--
-- Estrutura para tabela `produtos`
--

CREATE TABLE `produtos` (
  `id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `carrinho`
--
ALTER TABLE `carrinho`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `financas_cliente`
--
ALTER TABLE `financas_cliente`
  ADD PRIMARY KEY (`Id`);

--
-- Índices de tabela `financas_entrada`
--
ALTER TABLE `financas_entrada`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `financas_saidas`
--
ALTER TABLE `financas_saidas`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `pedido`
--
ALTER TABLE `pedido`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `produto`
--
ALTER TABLE `produto`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `carrinho`
--
ALTER TABLE `carrinho`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT de tabela `financas_cliente`
--
ALTER TABLE `financas_cliente`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'identificador único.', AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT de tabela `financas_entrada`
--
ALTER TABLE `financas_entrada`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Identificador único da entrada.', AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de tabela `financas_saidas`
--
ALTER TABLE `financas_saidas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Identificador único da saída.', AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de tabela `pedido`
--
ALTER TABLE `pedido`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'ID', AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de tabela `produto`
--
ALTER TABLE `produto`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'O identificador único de cadaproduto.', AUTO_INCREMENT=26;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
