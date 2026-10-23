export const siteId='montedopastopt.sharepoint.com,f1a462c0-cd43-4a74-afcd-982432760474,ad66cacb-0a7e-443e-832b-85b99ae9bc4e';
export const graphScopes=['Sites.Selected'];
const graphRoot='https://graph.microsoft.com/v1.0';
export function createSharePointClient(getToken,fetcher=fetch){
 async function request(path){
  const url=new URL(path,graphRoot);
  if(url.origin!=='https://graph.microsoft.com'||!url.pathname.startsWith(`/v1.0/sites/${siteId}/`))throw new Error('Pedido fora do site da manutenção.');
  const token=await getToken();const response=await fetcher(url.href,{headers:{Authorization:`Bearer ${token}`}});
  if(!response.ok){const error=new Error(response.status===403?'A aplicação ainda não tem permissão para aceder ao site da manutenção.':response.status===401?'A sessão Microsoft precisa de ser renovada.':'Não foi possível consultar o SharePoint.');error.status=response.status;throw error;}return response.json();
 }
 async function all(path){const items=[];let next=path;const seen=new Set();while(next){if(seen.has(next))throw new Error('Paginação inválida.');seen.add(next);const page=await request(next);items.push(...(page.value||[]));next=page['@odata.nextLink'];}return items;}
 return {async readStructure(){const lists=await all(`/v1.0/sites/${siteId}/lists?$select=id,displayName`);const names=['MDP_Unidades','MDP_Equipamentos','MDP_Trabalhos'];const result={};for(const name of names){const list=lists.find(x=>x.displayName===name);if(!list)throw new Error(`Não foi encontrada a lista ${name}.`);result[name]=await all(`/v1.0/sites/${siteId}/lists/${encodeURIComponent(list.id)}/items?$expand=fields&$top=200`);}return result;}};
}
