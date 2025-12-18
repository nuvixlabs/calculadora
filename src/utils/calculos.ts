import { TaxaFrete, CalculoConferencia } from '../types';

export const calcularConferencia = (
  valorISS: number,
  valorPedagio: number,
  valorTotal: number,
  taxaFrete: TaxaFrete,
  tipoVeiculo: 'toco' | 'truck' | 'carreta',
  valorMercadoria?: number
): CalculoConferencia => {
  // Calcular ADV (porcentagem sobre valor de mercadoria)
  const adv = valorMercadoria ? (valorMercadoria * taxaFrete.adv) / 100 : 0;
  
  // Obter valor do veículo baseado no tipo selecionado
  let valorVeiculo = 0;
  if (tipoVeiculo === 'toco') {
    valorVeiculo = taxaFrete.toco;
  } else if (tipoVeiculo === 'truck') {
    valorVeiculo = taxaFrete.truck;
  } else if (tipoVeiculo === 'carreta') {
    valorVeiculo = taxaFrete.carreta;
  }
  
  // Somar valores fixos (escolta + valor do veículo selecionado)
  const valoresFixos = taxaFrete.escolta + valorVeiculo;
  
  // Calcular subtotal
  const subtotal = valorISS + valorPedagio + adv + valoresFixos;
  
  // Calcular diferença
  const diferenca = valorTotal - subtotal;
  
  // Verificar se está correto (tolerância de R$ 0,01)
  const estaCorreto = Math.abs(diferenca) <= 0.01;
  
  return {
    valorISS,
    valorPedagio,
    adv,
    escolta: taxaFrete.escolta,
    toco: tipoVeiculo === 'toco' ? taxaFrete.toco : 0,
    truck: tipoVeiculo === 'truck' ? taxaFrete.truck : 0,
    carreta: tipoVeiculo === 'carreta' ? taxaFrete.carreta : 0,
    tipoVeiculo,
    subtotal,
    valorTotalInformado: valorTotal,
    diferenca,
    estaCorreto
  };
};

