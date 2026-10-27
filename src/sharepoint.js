import {schema} from './schema.js';
import {workFields,equipmentFields,unitFields} from './records.js';
export const siteId='montedopastopt.sharepoint.com,f1a462c0-cd43-4a74-afcd-982432760474,ad66cacb-0a7e-443e-832b-85b99ae9bc4e';
export const graphScopes=['Sites.Selected'];
const graphRoot='https://graph.microsoft.com/v1.0';
export function createSharePointClient(getToken,fetcher=fetch){
 let lists;const root=`/v1.0/sites/${siteId}/`;
 async function request(path,init={}){const url=new URL(path,graphRoot);if(url.origin!=='https://graph.microsoft.com'||!url.pathname.startsWith(root))throw new Error('Pedido fora do site da manutenção.');const token=await getToken();const response=await fetcher(url.href,{...init,headers:{Authorization:`Bearer ${token}`,...(init.body?{'Content-Type':'application/json'}:{}),...init.headers}});if(!response.ok){const messages={403:'Sem permissão para esta operação no SharePoint.',401:'A sessão Microsoft precisa de ser renovada.',412:'O registo foi alterado por outra pessoa. Atualize antes de voltar a guardar.',409:'Já existe um registo com este identificador.'};const error=new Error(messages[response.status]||'Não foi possível concluir a operação no SharePoint.');error.status=response.status;throw error;}if(response.status===204)return null;return response.json();}
 async function all(path){const items=[];let next=path;const seen=new Set();while(next){if(seen.has(next))throw new Error('Paginação inválida.');seen.add(next);const page=await request(next);items.push(...(page.value||[]));next=page['@odata.nextLink'];}return items;}
 async function list(name){lists??=await all(`${root}lists?$select=id,displayName`);const found=lists.find(x=>x.displayName===name);if(!found)throw new Error(`Não foi encontrada a lista ${name}.`);return `${root}lists/${encodeURIComponent(found.id)}`;}
 async function items(name){return all(`${await list(name)}/items?$expand=fields&$top=200`);}
 async function create(name,fields){return request(`${await list(name)}/items`,{method:'POST',body:JSON.stringify({fields})});}
 async function columnsReady(name,required){const cols=await all(`${await list(name)}/columns?$select=name`);return required.every(name=>cols.some(c=>c.name===name));}
 return {
 async prepareSchema(){let created=0;for(const definition of [...schema.lists,...schema.libraries]){const path=await list(definition.name);const existing=await all(`${path}/columns?$select=name`);for(const column of definition.columns){if(existing.some(x=>x.name===column.name))continue;await request(`${path}/columns`,{method:'POST',body:JSON.stringify(column)});created++;}}return created;},
 async readStructure(){const result={};for(const name of ['MDP_Unidades','MDP_Equipamentos','MDP_Trabalhos'])result[name]=await items(name);return result;},
 async readiness(){return {units:await columnsReady('MDP_Unidades',['UnidadeSuperiorId','Ativo']),equipment:await columnsReady('MDP_Equipamentos',['UnidadeId','Estado','EliminadoEm']),work:await columnsReady('MDP_Trabalhos',['EquipamentoId','Descricao','DataTrabalho','TipoManutencao','EstadoTrabalho','ResponsavelId','ResponsavelNome','Horas','CustoEUR','Materiais','Observacoes','PeriodicidadeDias','ProximaData','PedidoId'])};},
 async createUnit(input){return create('MDP_Unidades',unitFields(input,await items('MDP_Unidades')));},
 async createEquipment(input){return create('MDP_Equipamentos',equipmentFields(input,await items('MDP_Unidades')));},
 async createWork(input,account){const fields=workFields(input,account,await items('MDP_Equipamentos'));const existing=(await items('MDP_Trabalhos')).find(x=>x.fields.PedidoId===fields.PedidoId);if(existing)return existing;return create('MDP_Trabalhos',fields);},
 async updateEquipment(id,input,etag){if(!etag)throw new Error('Atualize o registo antes de o alterar.');const fields=equipmentFields(input,await items('MDP_Unidades'));return request(`${await list('MDP_Equipamentos')}/items/${encodeURIComponent(id)}/fields`,{method:'PATCH',headers:{'If-Match':etag},body:JSON.stringify(fields)});},
 async archiveEquipment(id,etag){if(!etag)throw new Error('Atualize o registo antes de o eliminar.');return request(`${await list('MDP_Equipamentos')}/items/${encodeURIComponent(id)}/fields`,{method:'PATCH',headers:{'If-Match':etag},body:JSON.stringify({EliminadoEm:new Date().toISOString()})});}
 };
}
