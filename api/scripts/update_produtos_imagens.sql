-- Atualizar imagens dos produtos
UPDATE produtos SET imagemPath = '/uploads/produtos/x-burger.jpg' WHERE nome LIKE '%X-Burger%';
UPDATE produtos SET imagemPath = '/uploads/produtos/x-salada.jpg' WHERE nome LIKE '%X-Salada%';
UPDATE produtos SET imagemPath = '/uploads/produtos/x-bacon.jpg' WHERE nome LIKE '%X-Bacon%';
UPDATE produtos SET imagemPath = '/uploads/produtos/x-egg.jpg' WHERE nome LIKE '%X-Egg%';
UPDATE produtos SET imagemPath = '/uploads/produtos/x-tudo.jpg' WHERE nome LIKE '%X-Tudo%';
UPDATE produtos SET imagemPath = '/uploads/produtos/batata-frita.jpg' WHERE nome LIKE '%Batata Frita%';
UPDATE produtos SET imagemPath = '/uploads/produtos/batata-frita-cheddar.jpg' WHERE nome LIKE '%Batata Frita Cheddar%';
UPDATE produtos SET imagemPath = '/uploads/produtos/batata-frita-bacon.jpg' WHERE nome LIKE '%Batata Frita Bacon%';
UPDATE produtos SET imagemPath = '/uploads/produtos/refrigerante.jpg' WHERE nome LIKE '%Refrigerante%';
UPDATE produtos SET imagemPath = '/uploads/produtos/suco.jpg' WHERE nome LIKE '%Suco%';
UPDATE produtos SET imagemPath = '/uploads/produtos/agua.jpg' WHERE nome LIKE '%Água%';
UPDATE produtos SET imagemPath = '/uploads/produtos/milk-shake.jpg' WHERE nome LIKE '%Milk Shake%';
UPDATE produtos SET imagemPath = '/uploads/produtos/sorvete.jpg' WHERE nome LIKE '%Sorvete%';

-- Adicionar coluna imagemPath na tabela produtos
ALTER TABLE produtos ADD COLUMN imagemPath VARCHAR(255);

-- Criar pasta para armazenar as imagens
-- mkdir -p api/uploads/produtos 