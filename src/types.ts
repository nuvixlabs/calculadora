export interface TaxaFrete {
  id: string;
  operacao: string;
  filialDestino: string;
  pedagioEixo: number;
  adv: number; // porcentagem
  escolta: number;
  toco: number;
  truck: number;
  carreta: number;
}

export interface ConferenciaFrete {
  valorISS: number;
  valorPedagio: number;
  valorTotal: number;
  taxaFreteId?: string;
}

export interface CalculoConferencia {
  valorISS: number;
  valorPedagio: number;
  adv: number;
  escolta: number;
  toco: number;
  truck: number;
  carreta: number;
  tipoVeiculo: 'toco' | 'truck' | 'carreta';
  subtotal: number;
  valorTotalInformado: number;
  diferenca: number;
  estaCorreto: boolean;
}

export interface ResultadoLoteConferencia extends CalculoConferencia {
  linha: number;
  taxaFreteDescricao: string;
}

