/** MDP Maintenance 360. Implantar com acesso «Apenas eu». Sem acesso anónimo. */
const DATABASE_ID_ = 'CONFIGURAR_ID_DA_FOLHA';
const OWNER_EMAIL_ = 'CONFIGURAR_EMAIL_PROPRIETARIO';
const SCHEMA_ = {
 Tarefas: ['id','equipment','name','interval','nextDate','last','version','updatedAt'],
 Unidades: ['id','name','parentId','version','updatedAt'],
 Equipamentos: ['id','name','zone','status','interval','last','version','updatedAt','parentId','unitId','recordType'],
 Intervencoes: ['id','equipment','date','type','fault','description','cost','hours','technician','status','version','createdAt','updatedAt','requestId'],
 Auditoria: ['id','timestamp','actor','action','entity','entityId','requestId']
};
function authorized_() {
 const email = Session.getActiveUser().getEmail().toLowerCase();
 if (!email || email !== OWNER_EMAIL_) throw new Error('Acesso restrito à conta proprietária.');
 return email;
}
function database_() { return SpreadsheetApp.openById(DATABASE_ID_); }
function sheet_(db,name) {
 const sheet=db.getSheetByName(name);if(!sheet)throw new Error('Separador em falta: '+name);
 const expected=SCHEMA_[name];
 if(JSON.stringify(sheet.getRange(1,1,1,expected.length).getValues()[0])!==JSON.stringify(expected))throw new Error('Cabeçalhos inválidos em '+name);
 if(sheet.getLastRow()>10000)throw new Error('Limite operacional atingido; rever capacidade.');
 return sheet;
}
function read_(db,name) {
 const s=sheet_(db,name),headers=SCHEMA_[name];
 if(s.getLastRow()<2)return [];
 return s.getRange(2,1,s.getLastRow()-1,headers.length).getValues().filter(r=>r[0]).map(r=>Object.fromEntries(headers.map((h,i)=>[h,r[i] instanceof Date?Utilities.formatDate(r[i],'Europe/Lisbon',h==='date'||h==='last'?'yyyy-MM-dd':"yyyy-MM-dd'T'HH:mm:ssXXX"):r[i]])));
}
function text_(value,label,max) {
 if(typeof value!=='string'||!value.trim()||value.length>max)throw new Error('Campo inválido: '+label);
 return value.trim();
}
function date_(value,optional) {
 if(optional&&!value)return '';
 if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value)||!Number.isFinite(Date.parse(value))||new Date(value).toISOString().slice(0,10)!==value)throw new Error('Data inválida.');return value;
}
function number_(value,label,max) {
 if(typeof value!=='number'||!Number.isFinite(value)||value<0||value>max)throw new Error('Valor inválido: '+label);return value;
}
function oneOf_(value,list) {if(list.indexOf(value)<0)throw new Error('Opção inválida.');return value;}
function cell_(value) {return typeof value==='string'&&/^[=+@\-\t\r]/.test(value)?"'"+value:value;}
function append_(db,name,obj) {sheet_(db,name).appendRow(SCHEMA_[name].map(k=>cell_(obj[k]===undefined?'':obj[k])));}
function audit_(db,actor,action,entity,id,requestId) {append_(db,'Auditoria',{id:Utilities.getUuid(),timestamp:new Date().toISOString(),actor,action,entity,entityId:id,requestId:requestId||''});}
function locked_(fn) {const lock=LockService.getScriptLock();lock.waitLock(15000);try{return fn();}finally{lock.releaseLock();}}
function equipmentForUnits_(db,units) {
 const ids=new Set(units.map(r=>r.id));return read_(db,'Equipamentos').filter(r=>r.recordType!=='unit').map(r=>({...r,unitId:r.unitId||(ids.has(r.parentId)?r.parentId:'')}));
}
function getSnapshot() {
 authorized_();return locked_(()=>{const db=database_(),units=read_(db,'Unidades');return {units,equipment:equipmentForUnits_(db,units),interventions:read_(db,'Intervencoes'),tasks:read_(db,'Tarefas'),mode:'real',time:new Date().toISOString()};});
}
function requireUnit_(units,id){if(!units.some(r=>r.id===id))throw new Error('Selecione uma unidade existente para localizar o equipamento.');}
function unitPath_(units,id){const byId=new Map(units.map(r=>[r.id,r])),parts=[],seen=new Set();let cursor=id;while(cursor){if(seen.has(cursor))throw new Error('A hierarquia não pode conter ciclos.');seen.add(cursor);const row=byId.get(cursor);if(!row)throw new Error('Unidade inexistente.');parts.unshift(row.name);cursor=row.parentId||'';}return parts.join(' > ');}
function createEquipment(input) {
 const actor=authorized_();
 const record={id:text_(input.requestId,'identificador do pedido',80),name:text_(input.name,'designação',120),zone:'',status:oneOf_(input.status,['Operacional','Em manutenção','Inativo']),interval:'',last:'',parentId:'',unitId:text_(input.unitId,'unidade',80),recordType:'equipment',version:1,updatedAt:new Date().toISOString()};

 return locked_(()=>{const db=database_(),items=read_(db,'Equipamentos');const existing=items.find(r=>r.id===record.id);if(existing){if(existing.recordType==='unit')throw new Error('Identificador já usado por uma unidade.');return existing;}const units=read_(db,'Unidades');requireUnit_(units,record.unitId);record.zone=unitPath_(units,record.unitId);sheet_(db,'Auditoria');append_(db,'Equipamentos',record);audit_(db,actor,'create','Equipamentos',record.id,'');SpreadsheetApp.flush();return record;});
}
function createUnit(input){const actor=authorized_(),record={id:text_(input.requestId,'identificador do pedido',80),name:text_(input.name,'nome da unidade',120),parentId:input.parentId?text_(input.parentId,'unidade superior',80):'',version:1,updatedAt:new Date().toISOString()};return locked_(()=>{const db=database_(),units=read_(db,'Unidades'),existing=units.find(r=>r.id===record.id);if(existing)return existing;validateParent_(units,record.id,record.parentId);sheet_(db,'Auditoria');append_(db,'Unidades',record);audit_(db,actor,'create','Unidades',record.id,'');SpreadsheetApp.flush();return record;});}
function writeRecord_(db,name,record){const sheet=sheet_(db,name),ids=sheet.getRange(2,1,sheet.getLastRow()-1,1).getValues(),index=ids.findIndex(r=>r[0]===record.id)+2;if(index<2)throw new Error('Registo inexistente.');sheet.getRange(index,1,1,SCHEMA_[name].length).setValues([SCHEMA_[name].map(k=>cell_(record[k]===undefined?'':record[k]))]);}
function assignEquipmentUnit(input){const actor=authorized_(),unitId=text_(input.unitId,'unidade',80);return locked_(()=>{const db=database_(),units=read_(db,'Unidades'),record=read_(db,'Equipamentos').find(r=>r.id===input.id&&r.recordType!=='unit');if(!record)throw new Error('Equipamento inexistente.');if(Number(record.version)!==input.version)throw new Error('Registo alterado por outra sessão. Atualize os dados.');requireUnit_(units,unitId);record.unitId=unitId;record.zone=unitPath_(units,unitId);record.version++;record.updatedAt=new Date().toISOString();sheet_(db,'Auditoria');writeRecord_(db,'Equipamentos',record);audit_(db,actor,'assign_unit','Equipamentos',record.id,'');SpreadsheetApp.flush();return record;});}
function convertLegacyToUnit(input){const actor=authorized_(),parentId=input.parentId?text_(input.parentId,'unidade superior',80):'';return locked_(()=>{const db=database_(),rows=read_(db,'Equipamentos'),old=rows.find(r=>r.id===input.id),units=read_(db,'Unidades');if(!old)throw new Error('Registo anterior inexistente.');const existing=units.find(r=>r.id===old.id);if(old.recordType==='unit'&&existing)return existing;if(Number(old.version)!==input.version)throw new Error('Registo alterado por outra sessão. Atualize os dados.');if(old.unitId)throw new Error('Este registo já foi associado como equipamento.');if(read_(db,'Intervencoes').some(r=>r.equipment===old.id))throw new Error('Este registo tem intervenções e precisa de revisão antes de ser convertido.');validateParent_(units,old.id,parentId);sheet_(db,'Auditoria');const record={id:old.id,name:old.name,parentId,version:1,updatedAt:new Date().toISOString()};if(!existing)append_(db,'Unidades',record);old.recordType='unit';old.version++;old.updatedAt=record.updatedAt;writeRecord_(db,'Equipamentos',old);audit_(db,actor,'classify_unit','Equipamentos',old.id,'');SpreadsheetApp.flush();return existing||record;});}
function updateUnitParent(input){const actor=authorized_(),parentId=input.parentId?text_(input.parentId,'unidade superior',80):'';return locked_(()=>{const db=database_(),units=read_(db,'Unidades'),record=units.find(r=>r.id===input.id);if(!record)throw new Error('Unidade inexistente.');if(Number(record.version)!==input.version)throw new Error('Registo alterado por outra sessão. Atualize os dados.');validateParent_(units,record.id,parentId);record.parentId=parentId;record.version++;record.updatedAt=new Date().toISOString();sheet_(db,'Auditoria');writeRecord_(db,'Unidades',record);audit_(db,actor,'reparent','Unidades',record.id,'');SpreadsheetApp.flush();return record;});}
function createIntervention(input) {
 const actor=authorized_(),requestId=text_(input.requestId,'identificador do pedido',80);
 const record={id:Utilities.getUuid(),equipment:text_(input.equipment,'equipamento',80),date:date_(input.date),type:oneOf_(input.type,['Corretiva','Preventiva']),fault:text_(input.fault,'categoria',100),description:text_(input.description,'descrição',1500),cost:number_(input.cost,'custo',10000000),hours:number_(input.hours,'horas',10000),technician:text_(input.technician,'responsável',80),status:oneOf_(input.status,['Planeada','Em curso','Concluída']),version:1,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),requestId};
 return locked_(()=>{const db=database_();const rows=read_(db,'Intervencoes');const existing=rows.find(r=>r.requestId===requestId);if(existing)return existing;
 if(!equipmentForUnits_(db,read_(db,'Unidades')).some(r=>r.id===record.equipment&&r.unitId))throw new Error('Equipamento inexistente.');sheet_(db,'Auditoria');append_(db,'Intervencoes',record);audit_(db,actor,'create','Intervencoes',record.id,requestId);SpreadsheetApp.flush();return record;});
}
function updateInterventionStatus(input) {
 const actor=authorized_();const status=oneOf_(input.status,['Planeada','Em curso','Concluída']);
 return locked_(()=>{const db=database_(),s=sheet_(db,'Intervencoes');const found=read_(db,'Intervencoes').find(r=>r.id===input.id);if(!found)throw new Error('Intervenção inexistente.');if(Number(found.version)!==input.version)throw new Error('Registo alterado por outra sessão. Atualize os dados.');
 const values=s.getRange(2,1,s.getLastRow()-1,1).getValues();const index=values.findIndex(r=>r[0]===input.id)+2;
 found.status=status;found.version++;found.updatedAt=new Date().toISOString();sheet_(db,'Auditoria');s.getRange(index,1,1,SCHEMA_.Intervencoes.length).setValues([SCHEMA_.Intervencoes.map(k=>cell_(found[k]))]);audit_(db,actor,'status','Intervencoes',found.id,'');SpreadsheetApp.flush();return found;});
}
function doGet() {authorized_();return HtmlService.createHtmlOutput(consoleHtml_()).setTitle('MDP Maintenance 360 · Dados reais').addMetaTag('viewport','width=device-width, initial-scale=1');}
function consoleHtml_() {return CONSOLE_HTML_;}

function validateParent_(items,id,parentId) {
 const byId=new Map(items.map(r=>[r.id,r])),seen=new Set([id]);let cursor=parentId;
 while(cursor){if(seen.has(cursor))throw new Error('A hierarquia não pode conter ciclos.');seen.add(cursor);const parent=byId.get(cursor);if(!parent)throw new Error('Elemento superior inexistente.');cursor=parent.parentId||'';}
}
function updateEquipmentParent(){authorized_();throw new Error('Os equipamentos associam-se a unidades. Atualize a aplicação e use a seleção de unidade.');}

function createTask(input){const actor=authorized_(),interval=input.interval===''||input.interval===null||input.interval===undefined?'':number_(input.interval,'periodicidade',36500);if(interval!==''&&(!Number.isInteger(interval)||interval<1))throw new Error('Periodicidade deve ser um número inteiro positivo de dias.');const record={id:text_(input.requestId,'identificador',80),equipment:text_(input.equipment,'equipamento',80),name:text_(input.name,'tarefa',200),interval,nextDate:date_(input.nextDate),last:'',version:1,updatedAt:new Date().toISOString()};return locked_(()=>{const db=database_(),existing=read_(db,'Tarefas').find(r=>r.id===record.id);if(existing)return existing;if(!equipmentForUnits_(db,read_(db,'Unidades')).some(r=>r.id===record.equipment&&r.unitId))throw new Error('Equipamento inexistente.');sheet_(db,'Auditoria');append_(db,'Tarefas',record);audit_(db,actor,'create','Tarefas',record.id,'');SpreadsheetApp.flush();return record;});}
function completeTask(input){const actor=authorized_(),date=date_(input.date);if(date>new Date().toISOString().slice(0,10))throw new Error('A execução não pode ter data futura.');return locked_(()=>{const db=database_(),record=read_(db,'Tarefas').find(r=>r.id===input.id);if(!record)throw new Error('Tarefa inexistente.');if(Number(record.version)!==input.version)throw new Error('Registo alterado por outra sessão. Atualize os dados.');if(record.last&&date<record.last)throw new Error('A data não pode anteceder a última execução.');sheet_(db,'Auditoria');record.last=date;record.nextDate=record.interval?new Date(Date.parse(date)+Number(record.interval)*86400000).toISOString().slice(0,10):'';record.version++;record.updatedAt=new Date().toISOString();writeRecord_(db,'Tarefas',record);audit_(db,actor,'complete:'+date,'Tarefas',record.id,'');SpreadsheetApp.flush();return record;});}
