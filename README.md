# MDP Maintenance 360 · v0.2

Primeira versão funcional de demonstração, em português de Portugal, preparada para alojamento estático no GitHub Pages. Grafite, cinza claro e verde de inspiração Monte do Pasto; as cores e a marca tipográfica provisória não constituem identidade oficial validada.

## Experimentar

Na pasta do projeto executar `npm start` e abrir http://localhost:4173. Não abrir index.html diretamente: são usados módulos JavaScript. Sem dependências npm. Testes: `npm test` (Node 18+).

## Funcionalidades disponíveis

- Dashboard com indicadores e distribuição de custos calculados a partir dos registos locais.
- Registo rápido validado; equipamento, data, tipo, estado, responsável, categoria, custo, duração e descrição. Persistência em localStorage e aviso quando indisponível.
- Calendário mensal navegável; consultar intervenções e alterar estado no detalhe.
- Catálogo de quatro equipamentos fictícios e acesso ao respetivo histórico.
- Relatórios: pesquisa, filtro de estado, exportação CSV e conclusões automáticas.
- Administração: estado honesto das integrações e reposição da demonstração com confirmação.
- MDP Intelligence: recorrência de 3 avarias iguais por equipamento em 90 dias; custos superiores a 2× a mediana de pelo menos dois registos anteriores do mesmo equipamento e tipo; manutenção periódica vencida. Regras locais, sem IA generativa, sem Supabase, sem APIs de IA pagas.

Os dados e intervalos são fictícios, a data de referência da inteligência é 21/10/2026. O dashboard mostra custos de todos os registos não planeados (não representa faturação). Estado operacional dos equipamentos é o da ficha demo; não é inferido das intervenções. As regras são apoio à decisão e precisam de validação técnica.

## Publicação no GitHub Pages

1. Colocar o conteúdo desta pasta na raiz do repositório pretendido, ramo `main`.
2. Em Settings → Pages, escolher GitHub Actions como origem.
3. O workflow incluído executa os testes e publica apenas index.html, app.js, model.js e style.css; não publica documentação, testes ou backend.
4. Os caminhos relativos e a navegação por fragmentos suportam URLs de projeto, como /mdp-maintenance-360/.

Repositório: https://github.com/montedopasto/mdp-maintenance-360. GitHub Pages configurado com publicação automática pelo workflow incluído. Aplicação: https://montedopasto.github.io/mdp-maintenance-360/. Consultar o estado de cada publicação no separador Actions. A integração real depende da configuração abaixo. As fontes Google Fonts são opcionais; sem rede são usadas fontes locais.

## Arquitetura planeada e limites

Consultar `backend/ARQUITETURA.md`. Existe agora um backend Google Apps Script e uma consola privada para equipamentos, intervenções e histórico. O botão «Abrir dados reais com Google» abre esse ambiente, limitado à conta Google proprietária. Os sete módulos do GitHub Pages continuam em demonstração local; ainda não usam automaticamente a base real. Qualquer pessoa com acesso ao URL público pode utilizar a demonstração. Não colocar informação de produção, credenciais ou PIN no frontend. Os registos locais não são partilhados entre dispositivos e podem ser perdidos ao limpar dados do navegador.

A conversa de origem foi consultada pelo identificador fornecido. Foram recuperados os pedidos sobre visual industrial, inteligência e ausência de APIs pagas. As respostas antigas surgem como marcadores sem texto e não há anexos disponíveis; requisitos adicionais dessas respostas não puderam ser recuperados. O âmbito implementado baseia-se no pedido atual e no conteúdo efetivamente acessível, sem presumir funcionalidades ou integrações concluídas.

## Ligação Google v0.2

Base própria criada e privada. Leitura e gravação confirmadas no Apps Script; registos temporários removidos depois da verificação. A consola privada permite adicionar equipamentos, registar intervenções e alterar estados com controlo de versão. Nenhum registo fictício foi migrado. A auditoria conserva as operações de verificação identificadas como temporárias.

Utilizador+PIN, SharePoint, Bovironda e a utilização da base real pelos sete módulos completos ainda não estão concluídos. O acesso privado Google é uma primeira etapa operacional; não substitui os perfis e sessões PIN planeados.

O código reutilizável do backend está em `backend/apps-script/`, sem o email proprietário ou identificador da folha. A configuração concreta está apenas no projeto Apps Script privado. A consola usa `google.script.run`, evitando expor uma API de escrita anónima. Limite atual de 10 000 linhas por separador; rever capacidade e quotas antes de uso alargado. Escritas e auditoria usam bloqueio de script, mas Google Sheets não oferece transações entre separadores; falhas parciais exigem revisão da auditoria. Alterações diretas na folha não são auditadas pelo código da aplicação.
