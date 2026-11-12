export async function workDraft(accountId, operation, value){
 const db=await new Promise((resolve,reject)=>{
  const request=indexedDB.open('mdp-work-drafts',1);
  request.onupgradeneeded=()=>request.result.createObjectStore('work');
  request.onsuccess=()=>resolve(request.result);
  request.onerror=()=>reject(request.error);
 });
 try{
  return await new Promise((resolve,reject)=>{
   const transaction=db.transaction('work',operation==='get'?'readonly':'readwrite');
   const drafts=transaction.objectStore('work');
   const request=operation==='get'?drafts.get(accountId):operation==='delete'?drafts.delete(accountId):drafts.put(value,accountId);
   transaction.oncomplete=()=>resolve(request.result);
   transaction.onabort=()=>reject(transaction.error);
  });
 }finally{db.close();}
}
