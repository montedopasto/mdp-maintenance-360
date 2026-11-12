const id=value=>String(value??'');
export function equipmentSelection(units,equipment,selectedId=''){
 let chain=[],selected='';
 const children=parent=>units.filter(u=>parent?id(u.fields.UnidadeSuperiorId)===id(parent):!u.fields.UnidadeSuperiorId||!units.some(p=>id(p.id)===id(u.fields.UnidadeSuperiorId))).sort((a,b)=>String(a.fields.Title).localeCompare(String(b.fields.Title),'pt-PT'));
 const options=depth=>children(depth?chain[depth-1]:null);
 const available=()=>chain.length?equipment.filter(e=>id(e.fields.UnidadeId)===id(chain.at(-1))).sort((a,b)=>String(a.fields.Title).localeCompare(String(b.fields.Title),'pt-PT')):[];
 function chooseUnit(depth,value){if(value&&!options(depth).some(u=>id(u.id)===id(value)))throw new Error('Unidade fora da localização escolhida.');chain=chain.slice(0,depth);if(value)chain.push(id(value));selected='';}
 function chooseEquipment(value){if(value&&!available().some(e=>id(e.id)===id(value)))throw new Error('Equipamento fora da unidade escolhida.');selected=id(value);}
 function prefill(value){chain=[];selected='';const item=equipment.find(e=>id(e.id)===id(value));if(!item)return;let unit=units.find(u=>id(u.id)===id(item.fields.UnidadeId));const seen=new Set();while(unit){if(seen.has(id(unit.id))){chain=[];return;}seen.add(id(unit.id));chain.unshift(id(unit.id));unit=units.find(u=>id(u.id)===id(unit.fields.UnidadeSuperiorId));}if(chain.length)selected=id(item.id);}
 prefill(selectedId);
 return {get chain(){return [...chain];},get selected(){return selected;},options,available,chooseUnit,chooseEquipment,prefill};
}
export function mountEquipmentPicker(container,{units,equipment,selectedId='',recentIds=[]}){
 const normalize=value=>String(value??'').normalize('NFD').replace(/\p{M}/gu,'').toLocaleLowerCase('pt-PT');
 const state=equipmentSelection(units,equipment);
 const titles=new Map(units.map(unit=>[id(unit.id),unit.fields.Title]));
 const catalog=equipment.flatMap(item=>{
  state.prefill(item.id);
  if(!state.selected)return [];
  const path=[...state.chain.map(key=>titles.get(key)),item.fields.Title].join(' › ');
  return [{item,path,search:normalize([path,item.fields.Codigo].join(' '))}];
 }).sort((a,b)=>a.path.localeCompare(b.path,'pt-PT'));
 const byId=new Map(catalog.map(entry=>[id(entry.item.id),entry]));
 const recent=[...new Set(recentIds.map(id))].map(key=>byId.get(key)).filter(Boolean).slice(0,5);
 container.innerHTML='<label>Pesquisar equipamento<input type="search" placeholder="Ex.: quadros monforte" autocomplete="off"></label><input type="hidden" name="EquipamentoId"><p class="equipment-selection-path" role="status"></p><div class="equipment-results"></div>';
 const search=container.querySelector('input[type=search]');
 const field=container.querySelector('[name=EquipamentoId]');
 const path=container.querySelector('.equipment-selection-path');
 const results=container.querySelector('.equipment-results');
 function select(value){
  const entry=byId.get(id(value));
  field.value=entry?id(value):'';
  path.textContent=entry?entry.path:'';
  search.value='';
  renderResults();
  field.dispatchEvent(new Event('change',{bubbles:true}));
 }
 function renderResults(){
  results.replaceChildren();
  const terms=normalize(search.value).trim().split(/\s+/).filter(Boolean);
  const matches=terms.length?catalog.filter(entry=>terms.every(term=>entry.search.includes(term))):field.value?[]:recent;
  if(terms.length||matches.length){
   const hint=document.createElement('p');
   hint.textContent=terms.length?(matches.length>12?'Mostram-se 12 resultados. Refine a pesquisa.':matches.length?'Resultados':'Nenhum equipamento encontrado.'):'Equipamentos recentes';
   results.append(hint);
  }
  for(const entry of matches.slice(0,12)){
   const button=document.createElement('button');
   button.type='button';
   button.textContent=[entry.path,entry.item.fields.Codigo].filter(Boolean).join(' · ');
   button.onclick=()=>{
    select(entry.item.id);
    container.closest('form')?.elements.namedItem('Descricao')?.focus();
   };
   results.append(button);
  }
 }
 search.addEventListener('input',renderResults);
 search.addEventListener('keydown',event=>{
  if(event.key!=='Enter')return;
  event.preventDefault();
  results.querySelector('button')?.focus();
 });
 select(selectedId);
 return {setEquipment:select};
}
