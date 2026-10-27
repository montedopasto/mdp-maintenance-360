import {mountWorkspace} from './workspace.js';
import {PublicClientApplication,InteractionRequiredAuthError} from '@azure/msal-browser';
import {config,loginRequest,chooseAccount} from './auth.js';
import {createSharePointClient,graphScopes} from './sharepoint.js';
const button=document.querySelector('#office-login');
const status=document.querySelector('#setup-status');
const form=document.querySelector('#external-login');
const session=document.querySelector('#identity-session');
const name=document.querySelector('#identity-name');
const signout=document.querySelector('#signout');
const connect=document.querySelector('#connect-sharepoint');
const storageStatus=document.querySelector('#storage-status');
let workspace,api;
let refresh;
form.addEventListener('submit',event=>event.preventDefault());
function message(title,text){status.replaceChildren();const strong=document.createElement('strong');strong.textContent=title;const p=document.createElement('p');p.textContent=text;status.append(strong,p);}
function errorMessage(error){const code=error?.errorCode;if(code==='user_cancelled'||code==='access_denied')return 'A entrada foi cancelada. Pode tentar novamente.';if(code==='interaction_in_progress')return 'Já existe uma entrada em curso. Aguarde ou volte a abrir esta página.';return 'Não foi possível concluir a entrada Microsoft. Tente novamente. Se continuar, contacte o administrador.';}
async function start(){const client=new PublicClientApplication(config);await client.initialize();const result=await client.handleRedirectPromise();const account=chooseAccount(result,client.getActiveAccount());if(account){client.setActiveAccount(account);name.textContent=account.name||account.username||'Conta Microsoft';session.hidden=false;button.hidden=true;connect.hidden=false;workspace=mountWorkspace({account,onReload:()=>refresh(),onSignout:()=>signout.click(),onSave:async(kind,input)=>{if(!api)throw new Error('Atualize os dados antes de guardar.');if(kind==='work')return api.createWork(input,account);if(account.localAccountId!=='0ecb1f68-b451-4787-b22b-268a9abf2d02')throw new Error('Operação reservada ao administrador.');if(kind==='schema')return api.prepareSchema();if(kind==='unit')return api.createUnit(input);if(kind==='equipment')return api.createEquipment(input);}});message('Identidade Microsoft confirmada','A sessão Microsoft está iniciada. O acesso aos equipamentos e trabalhos aguarda a autorização para o SharePoint e a configuração dos perfis.');}else{message('Entrada Office 365 disponível','Pode identificar-se com a conta profissional da Monte do Pasto. A ligação aos dados e a entrada externa ainda estão em configuração.');button.disabled=false;}
button.addEventListener('click',async()=>{button.disabled=true;try{await client.loginRedirect(loginRequest);}catch(error){message('Entrada não concluída',errorMessage(error));button.disabled=false;}});
refresh=async()=>{connect.disabled=true;storageStatus.textContent='A consultar o SharePoint…';try{api=createSharePointClient(async()=>{const token=await client.acquireTokenSilent({account,scopes:graphScopes});return token.accessToken;});const data=await api.readStructure();workspace?.setData(data,await api.readiness());storageStatus.textContent=`SharePoint ligado · ${data.MDP_Unidades.length} unidades · ${data.MDP_Equipamentos.length} equipamentos · ${data.MDP_Trabalhos.length} trabalhos`; }catch(error){if(error instanceof InteractionRequiredAuthError){sessionStorage.setItem('mdp-connect-pending','1');await client.acquireTokenRedirect({account,scopes:graphScopes});return;}workspace?.setError('Não foi possível carregar os dados. A ligação ao SharePoint precisa de autorização.');storageStatus.textContent=error.name==='InteractionRequiredAuthError'?'A autorização Microsoft para este site ainda precisa de ser configurada.':error.message;}finally{connect.disabled=false;}};connect.addEventListener('click',refresh);
if(account&&sessionStorage.getItem('mdp-connect-pending')){sessionStorage.removeItem('mdp-connect-pending');connect.click();}
signout.addEventListener('click',async()=>{signout.disabled=true;try{await client.logoutRedirect({account,postLogoutRedirectUri:config.auth.redirectUri});}catch(error){message('Saída não concluída',errorMessage(error));signout.disabled=false;}});
}
start().catch(()=>{message('Entrada Microsoft indisponível','Não foi possível preparar a entrada. Atualize a página para tentar novamente.');button.disabled=true;});
