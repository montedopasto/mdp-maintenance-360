import test from 'node:test';import assert from 'node:assert/strict';import{seed,equipment,insights,validate}from'../model.js';
test('demo exposes recurrence, anomaly and overdue maintenance',()=>{const all=insights(seed);assert.equal(all.filter(x=>x.kind==='Recorrência').length,1);assert.equal(all.filter(x=>x.kind==='Custo anormal').length,1);assert.equal(all.filter(x=>x.kind==='Preventiva').length,2)});
test('planned and future repairs cannot create recurrence',()=>{assert.equal(insights(seed.map(r=>({...r,status:'Planeada'})),[], '2026-10-21').length,0);assert.equal(insights(seed,[],'2026-01-01').length,0)});
test('recurrences outside 90 day window excluded',()=>assert.equal(insights(seed,[],'2027-10-21').filter(x=>x.kind==='Recorrência').length,0));
test('completed preventive updates next due date',()=>{const rows=[...seed,{...seed[2],equipment:'EQ-004',date:'2026-10-20'}];assert.equal(insights(rows).filter(x=>x.kind==='Preventiva'&&x.equipment==='EQ-004').length,0)});
test('validates costs and descriptions',()=>{assert(seed.every(validate));assert(!validate({...seed[0],cost:-1}));assert(!validate({...seed[0],description:' '}));assert(!validate({...seed[0],hours:NaN}))});
