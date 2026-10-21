# MDP Maintenance 360 · v0.1

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

Não foi criado nem publicado um repositório GitHub nesta entrega. Não foram fornecidos repositório de destino, contas ou credenciais. A integração real depende da configuração abaixo. As fontes Google Fonts são opcionais; sem rede são usadas fontes locais.

## Arquitetura planeada e limites

Consultar `backend/ARQUITETURA.md`. Não existe backend ou autenticação real nesta entrega. Qualquer pessoa com acesso ao URL pode utilizar a demonstração. Não colocar informação de produção, credenciais ou PIN no frontend. Os registos locais não são partilhados entre dispositivos e podem ser perdidos ao limpar dados do navegador.

A conversa de origem foi consultada pelo identificador fornecido. Foram recuperados os pedidos sobre visual industrial, inteligência e ausência de APIs pagas. As respostas antigas surgem como marcadores sem texto e não há anexos disponíveis; requisitos adicionais dessas respostas não puderam ser recuperados. O âmbito implementado baseia-se no pedido atual e no conteúdo efetivamente acessível, sem presumir funcionalidades ou integrações concluídas.
