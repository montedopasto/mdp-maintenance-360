# Estado da arquitetura · v0.2

Implementado: Google Sheets próprio e privado, Apps Script associado e consola Google privada com criação de equipamentos, registo de intervenções, leitura e alteração de estado. A publicação GitHub Pages abre essa consola por ligação explícita e conserva os registos demo separados. Não existe API anónima nem segredo no frontend público.

Ainda planeado: ligar os sete módulos completos à fonte real, utilizador+PIN e perfis, SharePoint e sincronização bidirecional Bovironda. A consola privada cobre a primeira etapa Sheets/Apps Script.

# Contrato de evolução proposto

Frontend GitHub Pages → serviço backend autenticado → Google Sheets próprio via Google Apps Script. O mesmo backend medeia o SharePoint e o Bovironda. Nenhuma credencial ou segredo é incluído no código estático. Não se usa Supabase nem API de IA paga.

## Modelo de dados sugerido

- Equipamentos: id, designação, localização, estado, intervalo preventivo, última preventiva, versão.
- Intervenções: id UUID, equipamentoId, data, tipo, estado, categoriaAvaria, descrição, custoEUR, duraçãoHoras, responsávelId, criadoEm, atualizadoEm, versão, origem, externalId.
- Utilizadores: id, nome, perfil (admin/técnico/consulta), hash do PIN com salt e função apropriada, ativo. Nunca PIN em texto simples.
- Anexos: id, intervençãoId, identificador SharePoint, nome, MIME, tamanho, criadoPor.
- Auditoria: ator, ação, entidade, data, resultado; sem segredos.
- Sincronização: origem, externalId, internalId, versão externa, estado, tentativas, último erro, data.

## Operações a implementar

POST /session (utilizador + PIN), DELETE /session; GET /equipment; GET/POST /interventions; PATCH /interventions/:id com controlo de versão; POST /attachments; GET /reports; POST /sync/bovironda reservado a serviço autorizado.

Autenticar e autorizar cada operação no servidor; restringir tentativas de PIN, duração de sessão e permissões por perfil. Evitar tokens persistentes em localStorage. A seleção de cookie/sessão e o tratamento entre origens devem ser validados com os domínios finais do GitHub Pages e do backend. Validar esquemas, tamanhos, tipos e limites no servidor. Apps Script deve permanecer atrás da fronteira autenticada ou validar tokens de serviço; nunca disponibilizar escrita anónima na folha.

Google Sheets: criar folha própria, definir proprietário e acesso; Apps Script com operações restritas, validação, bloqueios para escrita concorrente e idempotência; confirmar quotas, volumes e política de cópias de segurança antes de produção.

SharePoint: aplicação autorizada com permissões mínimas e biblioteca definida. Backend valida ficheiros, guarda identificadores e verifica autorização antes de devolver acesso temporário. Não expor segredos Microsoft nem ligações abertas permanentes. A escolha do backend depende da infraestrutura disponível; custos de alojamento/licenciamento devem ser confirmados.

Bovironda: obter documentação real da API e ambiente de testes. Definir campos, direção por campo, fonte de verdade, versões e resolução de conflitos. Usar fila idempotente, identificadores externos estáveis, tentativas com espera e auditoria; conflitos ficam para revisão. Só considerar bidirecional concluído depois de testes criar/alterar em ambos os lados, reenvio sem duplicação, falha parcial e conflito. Não inventar endpoints da plataforma.

## Sequência para integração real

1. Confirmar requisitos inacessíveis da conversa e validar campos, marca e perfis.
2. Criar Sheets próprio e Apps Script em ambiente de teste.
3. Implementar backend, sessões utilizador+PIN e autorização; testes de isolamento e concorrência.
4. Ligar frontend por adaptador remoto explícito; retirar modo demo apenas com configuração verificada. Não misturar dados demo com reais.
5. Validar SharePoint com ficheiros de teste.
6. Implementar e validar contrato Bovironda e estratégia de conflitos.
7. Ensaio operacional, auditoria, cópias de segurança e validação humana das regras inteligentes.
