# Etapa 1 - Protecao da Base Original

Data e hora da copia diagnostica: 2026-07-21 15:46:06 -03:00

Banco original analisado: `C:\Users\SEMASC\Desktop\Funcionarios\Funcionarios\dados\sistema_social.db`

Copia diagnostica local: `local-data/sqlite-diagnostics/sistema_social.diagnostic.20260721-154606.db`

SHA-256 do banco original: `68799309a60e03f06637fbca002bee02214f9aa4984a279e316939f568e74170`

SHA-256 da copia diagnostica: `68799309a60e03f06637fbca002bee02214f9aa4984a279e316939f568e74170`

Resultado da verificacao: a copia diagnostica e identica ao banco original no momento da copia.

## Contagens Registradas

| Item | Total |
| --- | ---: |
| Funcionarios | 630 |
| Funcionarios ativos | 503 |
| Funcionarios exonerados | 127 |
| Movimentacoes | 826 |
| Unidades | 22 |
| Usuarios | 2 |

## Regras de Protecao

- O sistema local em `C:\Users\SEMASC\Desktop\Funcionarios\Funcionarios` deve permanecer intacto durante a migracao.
- O banco original, os backups, scripts atuais e a planilha original nao devem ser alterados por esta etapa.
- A copia diagnostica fica em `local-data/`, pasta ignorada pelo Git.
- Arquivos reais de banco, planilhas, CSVs e dados temporarios foram adicionados ao `.gitignore`.
- O importador atual da planilha nao deve ser executado nesta fase, pois ele substitui funcionarios e historicos.

## Backups Existentes

O sistema local ja mantem backups em:

`C:\Users\SEMASC\Desktop\Funcionarios\Funcionarios\backup`

Exemplos encontrados:

- `sistema_social_20260720.db`
- `sistema_social_20260717.db`
- `sistema_social_20260716.db`
- `sistema_social_20260715.db`
- `sistema_social_20260714.db`

## Restauracao do Sistema Local

1. Fechar o servidor local do Sistema de Funcionarios.
2. Fazer uma copia adicional do arquivo atual `dados\sistema_social.db`.
3. Escolher um backup em `backup\sistema_social_YYYYMMDD.db`.
4. Copiar o backup escolhido para `dados\sistema_social.db`.
5. Reiniciar o servidor local com os scripts atuais.
6. Validar login, dashboard, listagem, funcionarios ativos, exonerados e historico.

## Observacoes de Seguranca

- Nenhum banco real deve ser enviado ao GitHub.
- Nenhuma planilha real deve ser enviada ao GitHub.
- Nenhum CPF, telefone, e-mail, senha ou hash de senha deve entrar em documentos versionados.
- As senhas do sistema local nao serao migradas para o Supabase Auth.
- A credencial padrao legada deve deixar de existir na versao online, mas o sistema local nao sera alterado agora.
