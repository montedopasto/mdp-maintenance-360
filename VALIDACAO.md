# Validação · 21/10/2026

- Sintaxe JavaScript verificada. Cinco testes automáticos aprovados: recorrência, custos, preventivas, exclusão de planeadas/futuras e validação de entradas.
- Sete módulos abertos no navegador. Registo de teste de 42,50 €, persistência após recarregar, pesquisa, alteração de estado e CSV conferidos.
- Calendário com registo no dia correto e navegação para novembro. Administração com reposição confirmada; dados de teste removidos.
- Visual de computador e móvel inspecionado; sem expansão horizontal da página observada no móvel. Tabelas, calendário e navegação móvel usam deslocação horizontal nos respetivos contentores.
- Sem erros ou avisos na consola na verificação final.

Limites: integrações e autenticação não implementadas; não testadas com serviços reais. Workflow GitHub Pages incluído, mas ainda não executado no repositório de destino. Não constitui auditoria de segurança nem teste exaustivo entre navegadores.

A captura dashboard.png, junto do projeto, mostra o resultado no navegador. O servidor temporário de testes é encerrado após a validação. Para reabrir: executar npm start na pasta do projeto.

## Ligação Google v0.2

Treze testes locais aprovados, incluindo oito verificações do backend com serviços simulados: rejeição de identidades, base sem demonstração, reenvios idempotentes, equipamento obrigatório, tipos numéricos, concorrência, datas/valores inválidos e proteção de fórmulas.

Verificação efetiva no Google: folha nativa importada e relida, privada apenas para o proprietário, pt_PT e Europe/Lisbon. Apps Script ligado à folha e implementado como «Apenas eu». A consola leu a folha; equipamento e intervenção temporários foram criados pela consola e confirmados por leitura independente no Sheets, com auditoria. Registos temporários removidos por IDs conferidos; auditoria da verificação preservada.

Limites remanescentes: não houve ensaio multiutilizador nem auditoria de segurança completa. Atualização de estado e repetição de pedidos foram verificadas localmente com serviços simulados, não com múltiplas sessões Google simultâneas. Os módulos completos no Pages mantêm-se em demonstração; dados reais têm consola privada própria.
