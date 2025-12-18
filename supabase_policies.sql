-- Habilitar Row Level Security na tabela
ALTER TABLE public.taxas_frete ENABLE ROW LEVEL SECURITY;

-- Policy para SELECT (ler taxas)
CREATE POLICY "Permitir leitura de taxas para todos"
ON public.taxas_frete
FOR SELECT
USING (true);

-- Policy para INSERT (criar taxas)
CREATE POLICY "Permitir inserção de taxas para todos"
ON public.taxas_frete
FOR INSERT
WITH CHECK (true);

-- Policy para UPDATE (atualizar taxas)
CREATE POLICY "Permitir atualização de taxas para todos"
ON public.taxas_frete
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Policy para DELETE (deletar taxas)
CREATE POLICY "Permitir exclusão de taxas para todos"
ON public.taxas_frete
FOR DELETE
USING (true);


