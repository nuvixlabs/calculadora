import { useRef, useState, useEffect } from 'react';
import { TaxaFrete, CalculoConferencia, ResultadoLoteConferencia } from '../types';
import { getTaxasFrete, getTaxaFreteById } from '../utils/storage';
import { calcularConferencia } from '../utils/calculos';
import './ConferenciaFrete.css';
import * as XLSX from 'xlsx';

type TipoVeiculo = 'toco' | 'truck' | 'carreta' | '';

const ConferenciaFrete = () => {
  const [taxas, setTaxas] = useState<TaxaFrete[]>([]);
  const [taxaSelecionada, setTaxaSelecionada] = useState<string>('');
  const [tipoVeiculo, setTipoVeiculo] = useState<TipoVeiculo>('');
  const [valorISS, setValorISS] = useState<number>(0);
  const [valorPedagio, setValorPedagio] = useState<number>(0);
  const [valorTotal, setValorTotal] = useState<number>(0);
  const [valorMercadoria, setValorMercadoria] = useState<number>(0);
  const [mostrarResultado, setMostrarResultado] = useState(false);
  const [calculo, setCalculo] = useState<CalculoConferencia | null>(null);
  const [resultadosLote, setResultadosLote] = useState<ResultadoLoteConferencia[]>([]);
  const inputArquivoRef = useRef<HTMLInputElement | null>(null);
  const [, setLoadingTaxas] = useState(false);


  useEffect(() => {
    const carregar = async () => {
      setLoadingTaxas(true);
      const lista = await getTaxasFrete();
      setTaxas(lista);
      setLoadingTaxas(false);
    };
    carregar();
  }, []);

  const handleConferir = async () => {
    if (!taxaSelecionada) {
      alert('Por favor, selecione uma taxa de frete');
      return;
    }

    if (!tipoVeiculo) {
      alert('Por favor, selecione o tipo de veículo');
      return;
    }

    const taxa = await getTaxaFreteById(taxaSelecionada);
    if (!taxa) {
      alert('Taxa de frete não encontrada');
      return;
    }

    const resultado = calcularConferencia(
      valorISS,
      valorPedagio,
      valorTotal,
      taxa,
      tipoVeiculo,
      valorMercadoria || undefined
    );

    setCalculo(resultado);
    setMostrarResultado(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const resetForm = () => {
    setValorISS(0);
    setValorPedagio(0);
    setValorTotal(0);
    setValorMercadoria(0);
    setTaxaSelecionada('');
    setTipoVeiculo('');
    setMostrarResultado(false);
    setCalculo(null);
  };

  const handleDownloadModelo = () => {
    const cabecalhos = [
      'Taxa de Frete (Operação - Filial Destino)',
      'Tipo de Veículo (Toco/Truck/Carreta)',
      'Valor ISS',
      'Valor Pedágio',
      'Valor Cobrado',
      'Valor Mercadoria',
    ];

    const wsData = [cabecalhos];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Modelo');
    XLSX.writeFile(wb, 'modelo_conferencia_frete.xlsx');
  };

  const abrirSeletorArquivo = () => {
    if (inputArquivoRef.current) {
      inputArquivoRef.current.value = '';
      inputArquivoRef.current.click();
    }
  };

  const normalizarTipoVeiculo = (valor: string): TipoVeiculo => {
    const v = valor.trim().toLowerCase();
    if (v === 'toco') return 'toco';
    if (v === 'truck' || v === 'truque') return 'truck';
    if (v === 'carreta') return 'carreta';
    return '';
  };

  const handleImportarArquivo = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const resultados: ResultadoLoteConferencia[] = [];

      // Começa na linha 2 (índice 1) para pular cabeçalho
      for (let i = 1; i < json.length; i++) {
        const linha = json[i];
        if (!linha || linha.length === 0) continue;

        const [
          taxaDescricao,
          tipoVeiculoStr,
          issStr,
          pedagioStr,
          valorCobradoStr,
          valorMercadoriaStr,
        ] = linha as (string | number)[];

        if (!taxaDescricao) continue;

        const taxaLabel = String(taxaDescricao).trim();
        const taxa = taxas.find(
          (t) => `${t.operacao} - ${t.filialDestino}`.trim().toLowerCase() === taxaLabel.toLowerCase()
        );

        if (!taxa) {
          continue;
        }

        const tipo = normalizarTipoVeiculo(String(tipoVeiculoStr ?? ''));
        if (!tipo) {
          continue;
        }

        const iss = Number(issStr) || 0;
        const pedagio = Number(pedagioStr) || 0;
        const valorCobrado = Number(valorCobradoStr) || 0;
        const valorMerc = Number(valorMercadoriaStr) || 0;

        const resultado = calcularConferencia(
          iss,
          pedagio,
          valorCobrado,
          taxa,
          tipo,
          valorMerc || undefined
        );

        resultados.push({
          ...resultado,
          linha: i + 1,
          taxaFreteDescricao: taxaLabel,
        });
      }

      setResultadosLote(resultados);
    };

    reader.readAsArrayBuffer(file);
  };

  const handleExportarResultados = () => {
    if (!resultadosLote.length) {
      alert('Nenhum resultado em lote para exportar. Importe um arquivo primeiro.');
      return;
    }

    const cabecalhos = [
      'Linha (arquivo origem)',
      'Taxa de Frete',
      'Tipo de Veículo',
      'Valor ISS',
      'Valor Pedágio',
      'Valor Cobrado',
      'Valor Mercadoria',
      'Valor Calculado',
      'Diferença',
      'Está Correto',
    ];

    const linhas = resultadosLote.map((r) => [
      r.linha,
      r.taxaFreteDescricao,
      r.tipoVeiculo.toUpperCase(),
      r.valorISS,
      r.valorPedagio,
      r.valorTotalInformado,
      r.adv ? r.adv : '',
      r.subtotal,
      r.diferenca,
      r.estaCorreto ? 'SIM' : 'NÃO',
    ]);

    const ws = XLSX.utils.aoa_to_sheet([cabecalhos, ...linhas]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Resultados');
    XLSX.writeFile(wb, 'conferencia_frete_resultados.xlsx');
  };

  return (
    <div className="conferencia-frete">
      <div className="header-section">
        <h2>Conferência de Frete</h2>
      </div>

      <div className="form-card">
        <h3>Dados da Conferência</h3>
        
        <div className="form-group">
          <label>Selecione a Taxa de Frete *</label>
          <select
            value={taxaSelecionada}
            onChange={(e) => setTaxaSelecionada(e.target.value)}
            required
          >
            <option value="">Selecione uma taxa...</option>
            {taxas.map((taxa) => (
              <option key={taxa.id} value={taxa.id}>
                {taxa.operacao} - {taxa.filialDestino}
              </option>
            ))}
          </select>
        </div>

        {taxas.length === 0 && (
          <div className="warning-message">
            Nenhuma taxa cadastrada. Por favor, cadastre taxas primeiro no módulo "Taxas e Fretes".
          </div>
        )}

        <div className="form-group">
          <label>Tipo de Veículo *</label>
          <select
            value={tipoVeiculo}
            onChange={(e) => setTipoVeiculo(e.target.value as TipoVeiculo)}
            required
          >
            <option value="">Selecione o tipo de veículo...</option>
            <option value="toco">Toco</option>
            <option value="truck">Truck</option>
            <option value="carreta">Carreta</option>
          </select>
        </div>

        <div className="form-group">
          <label>Valor do ISS (R$)</label>
          <input
            type="number"
            step="0.01"
            value={valorISS || ''}
            onChange={(e) => setValorISS(parseFloat(e.target.value) || 0)}
            placeholder="0.00"
          />
        </div>

        <div className="form-group">
          <label>Valor do Pedágio (R$)</label>
          <input
            type="number"
            step="0.01"
            value={valorPedagio || ''}
            onChange={(e) => setValorPedagio(parseFloat(e.target.value) || 0)}
            placeholder="0.00"
          />
        </div>

        <div className="form-group">
          <label>Valor Total Cobrado (R$)</label>
          <input
            type="number"
            step="0.01"
            value={valorTotal || ''}
            onChange={(e) => setValorTotal(parseFloat(e.target.value) || 0)}
            placeholder="0.00"
          />
        </div>

        <div className="form-group">
          <label>Valor da Mercadoria (R$) - Opcional (para cálculo do ADV)</label>
          <input
            type="number"
            step="0.01"
            value={valorMercadoria || ''}
            onChange={(e) => setValorMercadoria(parseFloat(e.target.value) || 0)}
            placeholder="0.00"
          />
        </div>

        <div className="form-actions">
          <button onClick={handleConferir} className="btn-primary" disabled={taxas.length === 0}>
            Conferir Frete
          </button>
          <button onClick={resetForm} className="btn-secondary">
            Limpar
          </button>
        </div>
      </div>

      <div className="form-card">
        <h3>Conferência em Lote (Excel)</h3>
        <p className="descricao-lote">
          Use esta área para calcular vários fretes de uma vez usando um arquivo Excel no modelo correto.
        </p>
        <div className="lote-actions">
          <button type="button" className="btn-secondary" onClick={handleDownloadModelo}>
            Baixar modelo (.xlsx)
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={abrirSeletorArquivo}
            disabled={taxas.length === 0}
          >
            Importar modelo preenchido (.xlsx)
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleExportarResultados}
            disabled={!resultadosLote.length}
          >
            Exportar resultados (.xlsx)
          </button>
          <input
            type="file"
            accept=".xlsx,.xls"
            ref={inputArquivoRef}
            style={{ display: 'none' }}
            onChange={handleImportarArquivo}
          />
        </div>

        {resultadosLote.length > 0 && (
          <div className="tabela-lote-container">
            <table className="tabela-lote">
              <thead>
                <tr>
                  <th>Linha</th>
                  <th>Taxa de Frete</th>
                  <th>Tipo Veículo</th>
                  <th>ISS</th>
                  <th>Pedágio</th>
                  <th>Valor Cobrado</th>
                  <th>Valor Calculado</th>
                  <th>Diferença</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {resultadosLote.map((r) => (
                  <tr key={r.linha} className={r.estaCorreto ? 'linha-ok' : 'linha-erro'}>
                    <td>{r.linha}</td>
                    <td>{r.taxaFreteDescricao}</td>
                    <td>{r.tipoVeiculo.toUpperCase()}</td>
                    <td>{formatCurrency(r.valorISS)}</td>
                    <td>{formatCurrency(r.valorPedagio)}</td>
                    <td>{formatCurrency(r.valorTotalInformado)}</td>
                    <td>{formatCurrency(r.subtotal)}</td>
                    <td>{formatCurrency(r.diferenca)}</td>
                    <td>{r.estaCorreto ? 'Correto' : 'Incorreto'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {mostrarResultado && calculo && (
        <div className="resultado-card">
          <h3>Resultado da Conferência</h3>
          
          <div className={`status-badge ${calculo.estaCorreto ? 'status-ok' : 'status-erro'}`}>
            {calculo.estaCorreto ? '✓ Valores Corretos' : '✗ Valores Incorretos'}
          </div>

          <div className="calculos-grid">
            <div className="calculos-section">
              <h4>Extratificação de Valores</h4>
              <div className="valor-item">
                <span>ISS:</span>
                <strong>{formatCurrency(calculo.valorISS)}</strong>
              </div>
              <div className="valor-item">
                <span>Pedágio:</span>
                <strong>{formatCurrency(calculo.valorPedagio)}</strong>
              </div>
              <div className="valor-item">
                <span>ADV:</span>
                <strong>{formatCurrency(calculo.adv)}</strong>
              </div>
              <div className="valor-item">
                <span>Escolta:</span>
                <strong>{formatCurrency(calculo.escolta)}</strong>
              </div>
              {calculo.tipoVeiculo === 'toco' && (
                <div className="valor-item">
                  <span>Toco:</span>
                  <strong>{formatCurrency(calculo.toco)}</strong>
                </div>
              )}
              {calculo.tipoVeiculo === 'truck' && (
                <div className="valor-item">
                  <span>Truck:</span>
                  <strong>{formatCurrency(calculo.truck)}</strong>
                </div>
              )}
              {calculo.tipoVeiculo === 'carreta' && (
                <div className="valor-item">
                  <span>Carreta:</span>
                  <strong>{formatCurrency(calculo.carreta)}</strong>
                </div>
              )}
              <div className="valor-item subtotal">
                <span>Subtotal:</span>
                <strong>{formatCurrency(calculo.subtotal)}</strong>
              </div>
            </div>

            <div className="comparacao-section">
              <h4>Comparação</h4>
              <div className="valor-item">
                <span>Valor Total Informado:</span>
                <strong>{formatCurrency(calculo.valorTotalInformado)}</strong>
              </div>
              <div className="valor-item">
                <span>Valor Calculado:</span>
                <strong>{formatCurrency(calculo.subtotal)}</strong>
              </div>
              <div className={`valor-item diferenca ${calculo.estaCorreto ? 'diferenca-ok' : 'diferenca-erro'}`}>
                <span>Diferença:</span>
                <strong>{formatCurrency(calculo.diferenca)}</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConferenciaFrete;

