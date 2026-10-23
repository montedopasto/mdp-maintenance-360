# MDP Maintenance 360 — nova base Microsoft

Arquitetura aprovada: interface no GitHub Pages, site SharePoint novo e exclusivo para os dados e documentos, entrada Office 365 e entrada externa com contas geridas pelo administrador na mesma aplicação. Sem Bovironda, Google Sheets ou Apps Script.

## SharePoint criado

- Nome: MDP Maintenance 360
- Endereço: https://montedopastopt.sharepoint.com/sites/MDPMaintenance360
- Privacidade: privado
- Idioma escolhido na criação: Português (Portugal)
- Criador/proprietário: conta Microsoft Monte do Pasto autenticada no navegador
- Não foram adicionados outros membros durante a criação.

## Modelo

`sharepoint/schema.json` define o esquema pretendido, incluindo campos que ainda precisam de ser aplicados às listas. A existência de uma lista vazia não significa que o esquema completo ou a integração da aplicação já estejam concluídos.

- Unidades: hierarquia arbitrária de localização. Não são equipamentos.
- Equipamentos: designação e unidade obrigatórias, estado e características. Não têm periodicidade preventiva.
- Trabalhos: criados pelo técnico ao selecionar um equipamento. Data, tipo de manutenção, estado, responsável, descrição, horas, custo, peças/materiais, observações e periodicidade opcional em dias.
- Documentos: fotografias e anexos ligados ao equipamento e, quando aplicável, ao trabalho.
- Utilizadores: apenas identidade, nome, fornecedor de entrada e perfil/permissões. Sem palavras-passe, PIN ou hashes de credenciais nas listas.
- Auditoria: ator, data, ação e registo afetado.

Não há criação prévia obrigatória de tarefas. Se um trabalho for recorrente, o registo e as execuções seguintes partilham `TrabalhoOrigemId`; só a execução relevante mais recente determina a próxima data.

## Acesso

A aplicação pública não pode conter segredos nem credenciais do SharePoint. O servidor valida tokens e permissões de ambos os tipos de entrada e acede apenas ao novo site. Técnicos externos não são adicionados automaticamente como membros do SharePoint. As contas externas devem ser geridas num fornecedor de identidade protegido, através das ações administrativas da aplicação.

Os registos Microsoft, fornecedor de identidade externa, serviço de servidor e autorizações ainda não estão configurados. Nenhuma integração é apresentada como concluída.

## Reinício

A estrutura anterior não foi importada. O código anterior tem uma cópia de recuperação local na pasta de trabalho. Não foram apagados os dados do Google nem o SharePoint existente.
