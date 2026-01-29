-- ALERTA DE SEGURANÇA: Este script permite que QUALQUER pessoa edite seus produtos.
-- Isso é aceitável apenas para protótipos ou apps onde "anon" é o admin temporário.
-- Para produção real com múltiplos usuários, configure autenticação real.

-- 1. Habilitar RLS (caso não esteja)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- 2. Permitir SELECT público (Leitura)
CREATE POLICY "Public Read Products" ON products FOR SELECT USING (true);
CREATE POLICY "Public Read Categories" ON categories FOR SELECT USING (true);

-- 3. Permitir INSERT/UPDATE/DELETE para 'anon' e 'authenticated'
-- Nota: Isso torna seu banco de dados "inseguro" para escrita pública, 
-- mas resolve o erro de "não salva" no seu painel Admin simples.

-- Products Permissions
CREATE POLICY "Anon Update Products" ON products FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anon Insert Products" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon Delete Products" ON products FOR DELETE USING (true);

-- Categories Permissions
CREATE POLICY "Anon Update Categories" ON categories FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anon Insert Categories" ON categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon Delete Categories" ON categories FOR DELETE USING (true);

-- Se as policies já existirem e der erro, você pode rodar DROP POLICY antes ou apenas ignorar os erros.
