import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('../backend/apps-script/Code.gs',import.meta.url),'utf8').replace('CONFIGURAR_EMAIL_PROPRIETARIO','owner@example.invalid');
function env(){
 let user='owner@example.invalid',seq=0,released=0;
 const data={Equipamentos:[['id','name','zone','status','interval','last','version','updatedAt']],Intervencoes:[['id','equipment','date','type','fault','description','cost','hours','technician','status','version','createdAt','updatedAt','requestId']],Auditoria:[['id','timestamp','actor','action','entity','entityId','requestId']]};
 const sheet=name=>({getLastRow:()=>data[name].length,getRange:(r,c,h,w)=>({getValues:()=>data[name].slice(r-1,r-1+h).map(a=>a.slice(c-1,c-1+w)),setValues:rows=>{for(let i=0;i<h;i++)data[name][r-1+i]=rows[i];}}),appendRow:row=>data[name].push(row)});
 const context=vm.createContext({Session:{getActiveUser:()=>({getEmail:()=>user})},SpreadsheetApp:{openById:()=>({getSheetByName:sheet}),flush:()=>{}},LockService:{getScriptLock:()=>({waitLock:()=>{},releaseLock:()=>released++})},Utilities:{getUuid:()=>`uuid-${++seq}`},Date,console});
 vm.runInContext(source,context);
 return {context,data,setUser:u=>user=u,released:()=>released};
}
const equipment=()=>({name:'Bomba real',zone:'Setor real',status:'Operacional',interval:30,last:'2026-10-01',requestId:'eq-request-1'});
const intervention=id=>({equipment:id,date:'2026-10-21',type:'Corretiva',fault:'Fuga',description:'Substituição do vedante',cost:12.5,hours:1,technician:'Operador',status:'Concluída',requestId:'int-request-1'});
test('backend rejects unknown and missing identities',()=>{const e=env();for(const user of ['', 'other@example.invalid']){e.setUser(user);assert.throws(()=>e.context.getSnapshot(),/Acesso restrito/);}assert.equal(e.data.Equipamentos.length,1);});
test('real snapshot has no seeded demo records',()=>{const e=env(),s=e.context.getSnapshot();assert.equal(s.equipment.length,0);assert.equal(s.interventions.length,0);assert.equal(s.mode,'real');});
test('equipment writes and retries are idempotent',()=>{const e=env();const a=e.context.createEquipment(equipment()),b=e.context.createEquipment(equipment());assert.equal(a.id,b.id);assert.equal(e.data.Equipamentos.length,2);assert.equal(e.data.Auditoria.length,2);});
test('interventions require an existing equipment',()=>{const e=env();assert.throws(()=>e.context.createIntervention(intervention('missing')),/inexistente/);assert.equal(e.data.Intervencoes.length,1);assert.equal(e.released(),1);});
test('interventions preserve numeric values, audit and deduplicate retries',()=>{const e=env();const a=e.context.createEquipment(equipment());const r=e.context.createIntervention(intervention(a.id)),again=e.context.createIntervention(intervention(a.id));assert.equal(r.id,again.id);assert.equal(e.data.Intervencoes.length,2);assert.equal(r.cost,12.5);assert.equal(e.data.Auditoria.length,3);});
test('version conflict prevents stale updates',()=>{const e=env(),a=e.context.createEquipment(equipment()),r=e.context.createIntervention(intervention(a.id));const next=e.context.updateInterventionStatus({id:r.id,version:1,status:'Em curso'});assert.equal(next.version,2);assert.throws(()=>e.context.updateInterventionStatus({id:r.id,version:1,status:'Planeada'}),/outra sessão/);assert.equal(e.data.Intervencoes[1][9],'Em curso');});
test('rejects invalid numbers, dates, options and fractional intervals',()=>{const e=env();for(const patch of [{cost:-1},{hours:Infinity},{date:'2026-02-30'},{status:'Inválida'}])assert.throws(()=>e.context.createIntervention({...intervention('missing'),...patch}),/inválid/);assert.throws(()=>e.context.createEquipment({...equipment(),interval:1.5}),/inteiro/);});
test('spreadsheet formula injection is stored as literal text',()=>{const e=env();e.context.createEquipment({...equipment(),name:'=IMPORTXML("x")'});assert.equal(e.data.Equipamentos[1][1],"'=IMPORTXML(\"x\")");});
