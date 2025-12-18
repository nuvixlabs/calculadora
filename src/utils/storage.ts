import { TaxaFrete } from '../types';
import { supabase } from './supabaseClient';

const AUTH_STORAGE_KEY = 'auth';

export interface AuthData {
  isAuthenticated: boolean;
}

export const getAuth = (): AuthData => {
  const stored = localStorage.getItem(AUTH_STORAGE_KEY);
  return stored ? JSON.parse(stored) : { isAuthenticated: false };
};

export const setAuth = (isAuthenticated: boolean): void => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ isAuthenticated }));
};

// -------- Taxas de Frete (Supabase) --------

export const getTaxasFrete = async (): Promise<TaxaFrete[]> => {
  const { data, error } = await supabase
    .from('taxas_frete')
    .select('*')
    .order('operacao', { ascending: true });

  if (error) {
    console.error('Erro ao buscar taxas de frete', error);
    return [];
  }

  return (
    data?.map((row: any) => ({
      id: row.id,
      operacao: row.operacao,
      filialDestino: row.filial_destino,
      pedagioEixo: row.pedagio_eixo,
      adv: row.adv,
      escolta: row.escolta,
      toco: row.toco,
      truck: row.truck,
      carreta: row.carreta,
    })) || []
  );
};

export const saveTaxaFrete = async (taxa: TaxaFrete): Promise<void> => {
  const { error } = await supabase.from('taxas_frete').upsert(
    {
      id: taxa.id,
      operacao: taxa.operacao,
      filial_destino: taxa.filialDestino,
      pedagio_eixo: taxa.pedagioEixo,
      adv: taxa.adv,
      escolta: taxa.escolta,
      toco: taxa.toco,
      truck: taxa.truck,
      carreta: taxa.carreta,
    },
    { onConflict: 'id' }
  );

  if (error) {
    console.error('Erro ao salvar taxa de frete', error);
    throw error;
  }
};

export const deleteTaxaFrete = async (id: string): Promise<void> => {
  const { error } = await supabase.from('taxas_frete').delete().eq('id', id);
  if (error) {
    console.error('Erro ao excluir taxa de frete', error);
    throw error;
  }
};

export const getTaxaFreteById = async (id: string): Promise<TaxaFrete | null> => {
  const { data, error } = await supabase
    .from('taxas_frete')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Erro ao buscar taxa de frete por ID', error);
    return null;
  }

  if (!data) return null;

  return {
    id: data.id,
    operacao: data.operacao,
    filialDestino: data.filial_destino,
    pedagioEixo: data.pedagio_eixo,
    adv: data.adv,
    escolta: data.escolta,
    toco: data.toco,
    truck: data.truck,
    carreta: data.carreta,
  };
};


