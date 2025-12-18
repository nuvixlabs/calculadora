# Sistema de Conferência de Frete

Sistema para cadastro de taxas e fretes e conferência de valores cobrados.

## Funcionalidades

### 1. Autenticação
- Login com credenciais padrão:
  - Email: `matheus.transportesirmaos@gmail.com`
  - Senha: `Irmaos2024@`

### 2. Cadastro de Taxas e Fretes
- Cadastro completo de taxas com os seguintes campos:
  - Operação (nome da operação)
  - Filial Destino (Campos ou Angra)
  - Pedágio Eixo (valor por eixo)
  - ADV (% sobre valor de mercadoria)
  - Escolta (valor fixo)
  - Toco (valor fixo)
  - Truck (valor fixo)
  - Carreta (valor fixo)
- Edição e exclusão de taxas cadastradas

### 3. Conferência de Frete
- Comparação de valores cobrados com a tabela cadastrada
- Campos de entrada:
  - Valor do ISS
  - Valor do Pedágio
  - Valor Total
  - Valor da Mercadoria (opcional, para cálculo do ADV)
- Exibição detalhada dos cálculos e verificação se está correto

## Instalação

```bash
npm install
```

## Execução

```bash
npm run dev
```

O sistema estará disponível em `http://localhost:5173`

## Build para produção

```bash
npm run build
```



