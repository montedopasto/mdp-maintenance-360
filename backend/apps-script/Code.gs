/** MDP Maintenance 360. Implantar com acesso «Apenas eu». Sem acesso anónimo. */
const DATABASE_ID_ = 'CONFIGURAR_ID_DA_FOLHA';
const OWNER_EMAIL_ = 'CONFIGURAR_EMAIL_PROPRIETARIO';
const SCHEMA_ = {
 Equipamentos: ['id','name','zone','status','interval','last','version','updatedAt'],
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
function getSnapshot() {
 authorized_();return locked_(()=>{const db=database_();return {equipment:read_(db,'Equipamentos'),interventions:read_(db,'Intervencoes'),mode:'real',time:new Date().toISOString()};});
}
function createEquipment(input) {
 const actor=authorized_();
 const record={id:text_(input.requestId,'identificador do pedido',80),name:text_(input.name,'designação',120),zone:text_(input.zone,'localização',120),status:oneOf_(input.status,['Operacional','Em manutenção','Inativo']),interval:number_(input.interval,'intervalo',3650),last:date_(input.last,true),version:1,updatedAt:new Date().toISOString()};
 if(!Number.isInteger(record.interval)||record.interval<1)throw new Error('Intervalo deve ser um número inteiro de dias.');
 return locked_(()=>{const db=database_();const existing=read_(db,'Equipamentos').find(r=>r.id===record.id);if(existing)return existing;sheet_(db,'Auditoria');append_(db,'Equipamentos',record);audit_(db,actor,'create','Equipamentos',record.id,'');SpreadsheetApp.flush();return record;});
}
function createIntervention(input) {
 const actor=authorized_(),requestId=text_(input.requestId,'identificador do pedido',80);
 const record={id:Utilities.getUuid(),equipment:text_(input.equipment,'equipamento',80),date:date_(input.date),type:oneOf_(input.type,['Corretiva','Preventiva']),fault:text_(input.fault,'categoria',100),description:text_(input.description,'descrição',1500),cost:number_(input.cost,'custo',10000000),hours:number_(input.hours,'horas',10000),technician:text_(input.technician,'responsável',80),status:oneOf_(input.status,['Planeada','Em curso','Concluída']),version:1,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),requestId};
 return locked_(()=>{const db=database_();const rows=read_(db,'Intervencoes');const existing=rows.find(r=>r.requestId===requestId);if(existing)return existing;
 if(!read_(db,'Equipamentos').some(r=>r.id===record.equipment))throw new Error('Equipamento inexistente.');sheet_(db,'Auditoria');append_(db,'Intervencoes',record);audit_(db,actor,'create','Intervencoes',record.id,requestId);SpreadsheetApp.flush();return record;});
}
function updateInterventionStatus(input) {
 const actor=authorized_();const status=oneOf_(input.status,['Planeada','Em curso','Concluída']);
 return locked_(()=>{const db=database_(),s=sheet_(db,'Intervencoes');const found=read_(db,'Intervencoes').find(r=>r.id===input.id);if(!found)throw new Error('Intervenção inexistente.');if(Number(found.version)!==input.version)throw new Error('Registo alterado por outra sessão. Atualize os dados.');
 const values=s.getRange(2,1,s.getLastRow()-1,1).getValues();const index=values.findIndex(r=>r[0]===input.id)+2;
 found.status=status;found.version++;found.updatedAt=new Date().toISOString();sheet_(db,'Auditoria');s.getRange(index,1,1,SCHEMA_.Intervencoes.length).setValues([SCHEMA_.Intervencoes.map(k=>cell_(found[k]))]);audit_(db,actor,'status','Intervencoes',found.id,'');SpreadsheetApp.flush();return found;});
}
function doGet() {authorized_();return HtmlService.createHtmlOutput(consoleHtml_()).setTitle('MDP Maintenance 360 · Dados reais').addMetaTag('viewport','width=device-width, initial-scale=1');}
function consoleHtml_() {return CONSOLE_HTML_;}
