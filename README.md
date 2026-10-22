# MDP Maintenance 360

Aplicação única em português de Portugal, com dados privados em Google Sheets e backend Apps Script. O endereço GitHub Pages encaminha para a aplicação autenticada; já não apresenta uma demonstração paralela. `backend/apps-script/Console.html` contém a interface real e `Code.gs` os serviços do servidor. Os nomes dos ficheiros são internos; não há uma segunda consola para o utilizador.

## Fluxo de utilização

O administrador gere unidades e equipamentos na Administração. Criar, editar, eliminar da operação e recuperar equipamentos são ações do mesmo ambiente. Eliminar preserva o histórico. Unidades só podem ser eliminadas quando vazias.

Em **Registar trabalho**, escolhe-se o equipamento, data, tipo (corretiva, preventiva, proativa, preditiva ou inspeção), estado, responsável, descrição, horas, custo, materiais, observações e periodicidade opcional em dias. Não se criam tarefas previamente. A periodicidade gera um plano associado ao próprio trabalho; uma nova execução pode selecionar esse trabalho recorrente. Cada plano é independente dos outros trabalhos do equipamento.

Dashboard, Calendário, Equipamentos, Histórico e relatórios (CSV), MDP Intelligence e Administração usam os mesmos dados reais. A inteligência aplica regras locais explicáveis a trabalhos concluídos, custos e atrasos. Não usa APIs de IA.

## Limitações atuais

A administração de utilizadores e a entrada com utilizador+PIN estão implementadas, com perfis administrador/técnico e validação no servidor. A publicação mantém acesso Google «Apenas eu» até autorização expressa para abrir o ecrã de entrada aos técnicos. Nenhum utilizador ou PIN de exemplo foi criado. Fotografias e anexos SharePoint e sincronização Bovironda permanecem por integrar. Não são simulados como funções concluídas.

Não há dados de demonstração nem tarefas automaticamente sem registo de trabalho. Os antigos ficheiros model.js e respetivos testes apenas conservam o protótipo analítico; não são carregados pela aplicação publicada.

## Dados

- Unidades: `id,name,parentId,version,updatedAt`
- Equipamentos: `id,name,zone,status,interval,last,version,updatedAt,parentId,unitId,recordType`. `interval` e `last` antigos não têm função operacional. `recordType=archived` retira o equipamento da lista ativa.
- Intervencoes: `id,equipment,date,type,fault,description,cost,hours,technician,status,version,createdAt,updatedAt,requestId,taskId,interval,materials,notes,actor`
- Tarefas (planos originados em trabalhos): `id,equipment,name,interval,nextDate,last,version,updatedAt`
- Auditoria: `id,timestamp,actor,action,entity,entityId,requestId`

Datas em ISO, valores numéricos em euros e horas. Mutação com identidade validada, bloqueio do servidor, controlo de versão e proteção de fórmulas na folha. Repetir uma submissão de trabalho não cria duplicados. Os equipamentos existentes são preservados.

## Publicação

Configurar ID da folha e email proprietário apenas na cópia privada de Code.gs. Incorporar o HTML como `CONSOLE_HTML_`. Publicar no Apps Script mantendo «Apenas eu» enquanto o controlo de acesso de técnicos não existir. Nunca publicar credenciais ou dados operacionais no GitHub. GitHub Pages serve apenas a entrada para este mesmo ambiente.

## Verificação

`npm test` verifica autorização, validação, histórico, versões, planos independentes, repetição de pedidos, arquivo/recuperação, nomes escapados, formulário de trabalho e navegação integrada.


## Controlo de acesso

Contas criadas manualmente na Administração, com PIN de 6 a 12 algarismos. O servidor guarda apenas a assinatura HMAC-SHA256 do PIN com salt por utilizador e segredo da aplicação; não devolve PIN, hashes ou salts ao cliente. Segredo e contas ficam nas Script Properties privadas, não no GitHub nem na folha. Guardar o projeto público não inclui essas propriedades. Se o segredo se perder, os PIN têm de ser redefinidos pelo administrador.

5 tentativas por conta e 100 totais em 15 minutos, com contadores em propriedades persistentes. Sessões aleatórias duram até 6 horas; o cache pode terminá-las antes. Alterar PIN, perfil ou estado invalida sessões anteriores através da versão da conta. O token só é guardado na sessão do separador, com alternativa em memória se o navegador bloquear esse armazenamento.

Administradores gerem utilizadores, unidades e equipamentos. Técnicos podem registar trabalhos; o servidor fixa a autoria na conta autenticada, limita a consulta e alteração aos seus próprios trabalhos e recusa todas as operações administrativas. A sessão Google proprietária preserva o acesso administrativo para recuperação. O ecrã HTML não contém dados: cada chamada ao servidor valida novamente a identidade.

A publicação com acesso externo ao ecrã de entrada requer aprovação no momento da alteração, seguida da criação manual das contas. As fotografias SharePoint e Bovironda continuam por integrar.
