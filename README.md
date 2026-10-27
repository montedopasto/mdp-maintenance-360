# MDP Maintenance 360

Interface em português de Portugal no GitHub Pages, com entrada Microsoft e chamadas diretas ao Microsoft Graph em nome do utilizador. Segue o modelo das aplicações ISO Quality Control e Efetivo Bovinos existentes. Não depende de alojamento Azure, Google Sheets, Apps Script ou Bovironda.

## Estado verificado em 27/10/2026

- Site SharePoint privado criado: https://montedopastopt.sharepoint.com/sites/MDPMaintenance360
- Cinco listas e biblioteca MDP_Documentos criadas.
- 36 campos confirmados por consulta através da aplicação após criação administrativa.
- Login Office 365 e leitura das listas verificados no navegador.
- Sites.Selected delegada, com autorização write apenas para o site da manutenção.
- Formulários ligados ao Graph: criar unidades em cadeia; criar e alterar equipamentos; retirar equipamentos da lista ativa preservando histórico; registar trabalhos.
- Periodicidade opcional em dias pertence ao trabalho. O calendário acompanha a execução mais recente de cada série.
- Fotografias JPEG/PNG/WebP: até 5 por trabalho, 10 MB por ficheiro, biblioteca exclusiva e metadados de ligação. Implementação verificada com respostas simuladas; envio real de fotografias ainda não verificado.
- Importação de equipamentos CSV em UTF-8, com pré-visualização, criação das unidades em cadeia e omissão de repetidos. Não suporta XLSX nesta versão.
- Histórico/exportação CSV e conclusões de recorrência/custo calculados a partir dos registos existentes. Sem dados ou conclusões fictícias e sem APIs de IA.

## Limitações

O acesso externo e a criação/gestão de outros utilizadores continuam por configurar. Não existem contas externas nem credenciais em listas. O administrador inicial é o proprietário Microsoft que criou o site. A restrição visual da área administrativa não substitui as permissões do SharePoint: estas têm de ser configuradas para cada técnico antes de conceder acesso. Não foram importados equipamentos antigos nem criados registos de demonstração. Os percursos de gravação foram verificados com testes simulados; não foram criados trabalhos fictícios no ambiente real para os testar.

## Desenvolvimento

`npm ci`, `npm test`, `npm run build`. O ficheiro compilado app.js é produzido pelo workflow e não é a origem do código. `src/` contém a implementação. As chaves e palavras-passe nunca devem ser colocadas no repositório.
