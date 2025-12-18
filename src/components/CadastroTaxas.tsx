import { useState, useEffect } from 'react';
import { TaxaFrete } from '../types';
import { getTaxasFrete, saveTaxaFrete, deleteTaxaFrete } from '../utils/storage';
import './CadastroTaxas.css';

const CadastroTaxas = () => {
  const [taxas, setTaxas] = useState<TaxaFrete[]>([]);
  const [editingTaxa, setEditingTaxa] = useState<TaxaFrete | null>(null);
  const [formData, setFormData] = useState<Omit<TaxaFrete, 'id'>>({
    operacao: '',
    filialDestino: '',
    pedagioEixo: 0,
    adv: 0,
    escolta: 0,
    toco: 0,
    truck: 0,
    carreta: 0,
  });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingLista, setLoadingLista] = useState(false);

  useEffect(() => {
    loadTaxas();
  }, []);

  const loadTaxas = async () => {
    setLoadingLista(true);
    const lista = await getTaxasFrete();
    setTaxas(lista);
    setLoadingLista(false);
  };

  const handleInputChange = (field: keyof Omit<TaxaFrete, 'id'>, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const taxa: TaxaFrete = editingTaxa
      ? { ...formData, id: editingTaxa.id }
      : { ...formData, id: Date.now().toString() };

    await saveTaxaFrete(taxa);
    await loadTaxas();
    resetForm();
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      operacao: '',
      filialDestino: '',
      pedagioEixo: 0,
      adv: 0,
      escolta: 0,
      toco: 0,
      truck: 0,
      carreta: 0,
    });
    setEditingTaxa(null);
    setShowForm(false);
  };

  const handleEdit = (taxa: TaxaFrete) => {
    setEditingTaxa(taxa);
    setFormData({
      operacao: taxa.operacao,
      filialDestino: taxa.filialDestino,
      pedagioEixo: taxa.pedagioEixo,
      adv: taxa.adv,
      escolta: taxa.escolta,
      toco: taxa.toco,
      truck: taxa.truck,
      carreta: taxa.carreta,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta taxa?')) {
      setLoading(true);
      await deleteTaxaFrete(id);
      await loadTaxas();
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="cadastro-taxas">
      <div className="header-section">
        <h2>Cadastro de Taxas e Fretes</h2>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          Nova Taxa
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <h3>{editingTaxa ? 'Editar Taxa' : 'Nova Taxa'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Operação *</label>
                <input
                  type="text"
                  value={formData.operacao}
                  onChange={(e) => handleInputChange('operacao', e.target.value)}
                  required
                  placeholder="Ex: Abastecimento Angra"
                />
              </div>
              <div className="form-group">
                <label>Filial Destino *</label>
                <select
                  value={formData.filialDestino}
                  onChange={(e) => handleInputChange('filialDestino', e.target.value)}
                  required
                >
                  <option value="">Selecione...</option>
                  <option value="Campos">Campos</option>
                  <option value="Angra">Angra</option>
                </select>
              </div>
              <div className="form-group">
                <label>Pedágio Eixo (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.pedagioEixo}
                  onChange={(e) => handleInputChange('pedagioEixo', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="form-group">
                <label>ADV (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.adv}
                  onChange={(e) => handleInputChange('adv', parseFloat(e.target.value) || 0)}
                  placeholder="Ex: 0.30"
                />
              </div>
              <div className="form-group">
                <label>Escolta (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.escolta}
                  onChange={(e) => handleInputChange('escolta', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="form-group">
                <label>Toco (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.toco}
                  onChange={(e) => handleInputChange('toco', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="form-group">
                <label>Truck (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.truck}
                  onChange={(e) => handleInputChange('truck', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="form-group">
                <label>Carreta (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.carreta}
                  onChange={(e) => handleInputChange('carreta', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Salvando...' : editingTaxa ? 'Salvar Alterações' : 'Salvar'}
              </button>
              <button type="button" onClick={resetForm} className="btn-secondary">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="table-card">
        <h3>Taxas Cadastradas</h3>
        {loadingLista && <p className="empty-message">Carregando taxas...</p>}
        {!loadingLista && taxas.length === 0 ? (
          <p className="empty-message">Nenhuma taxa cadastrada ainda.</p>
        ) : !loadingLista && (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Operação</th>
                  <th>Filial Destino</th>
                  <th>Pedágio Eixo</th>
                  <th>ADV (%)</th>
                  <th>Escolta</th>
                  <th>Toco</th>
                  <th>Truck</th>
                  <th>Carreta</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {taxas.map((taxa) => (
                  <tr key={taxa.id}>
                    <td>{taxa.operacao}</td>
                    <td>{taxa.filialDestino}</td>
                    <td>{formatCurrency(taxa.pedagioEixo)}</td>
                    <td>{taxa.adv.toFixed(2)}%</td>
                    <td>{formatCurrency(taxa.escolta)}</td>
                    <td>{formatCurrency(taxa.toco)}</td>
                    <td>{formatCurrency(taxa.truck)}</td>
                    <td>{formatCurrency(taxa.carreta)}</td>
                    <td>
                      <button onClick={() => handleEdit(taxa)} className="btn-edit">
                        Editar
                      </button>
                      <button onClick={() => handleDelete(taxa.id)} className="btn-delete">
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CadastroTaxas;


