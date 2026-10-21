# Validação · 21/10/2026

- Sintaxe JavaScript verificada. Cinco testes automáticos aprovados: recorrência, custos, preventivas, exclusão de planeadas/futuras e validação de entradas.
- Sete módulos abertos no navegador. Registo de teste de 42,50 €, persistência após recarregar, pesquisa, alteração de estado e CSV conferidos.
- Calendário com registo no dia correto e navegação para novembro. Administração com reposição confirmada; dados de teste removidos.
- Visual de computador e móvel inspecionado; sem expansão horizontal da página observada no móvel. Tabelas, calendário e navegação móvel usam deslocação horizontal nos respetivos contentores.
- Sem erros ou avisos na consola na verificação final.

Limites: integrações e autenticação não implementadas; não testadas com serviços reais. Workflow GitHub Pages incluído, mas ainda não executado no repositório de destino. Não constitui auditoria de segurança nem teste exaustivo entre navegadores.

A captura dashboard.png, junto do projeto, mostra o resultado no navegador. O servidor temporário de testes é encerrado após a validação. Para reabrir: executar npm start na pasta do projeto.
