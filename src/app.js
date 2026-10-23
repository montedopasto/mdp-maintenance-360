import {PublicClientApplication} from '@azure/msal-browser';
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
form.addEventListener('submit',event=>event.preventDefault());
function message(title,text){status.replaceChildren();const strong=document.createElement('strong');strong.textContent=title;const p=document.createElement('p');p.textContent=text;status.append(strong,p);}
function errorMessage(error){const code=error?.errorCode;if(code==='user_cancelled'||code==='access_denied')return 'A entrada foi cancelada. Pode tentar novamente.';if(code==='interaction_in_progress')return 'Já existe uma entrada em curso. Aguarde ou volte a abrir esta página.';return 'Não foi possível concluir a entrada Microsoft. Tente novamente. Se continuar, contacte o administrador.';}
async function start(){const client=new PublicClientApplication(config);await client.initialize();const result=await client.handleRedirectPromise();const account=chooseAccount(result,client.getActiveAccount());if(account){client.setActiveAccount(account);name.textContent=account.name||account.username||'Conta Microsoft';session.hidden=false;button.hidden=true;connect.hidden=false;message('Identidade Microsoft confirmada','A sessão Microsoft está iniciada. O acesso aos equipamentos e trabalhos aguarda a autorização para o SharePoint e a configuração dos perfis.');}else{message('Entrada Office 365 disponível','Pode identificar-se com a conta profissional da Monte do Pasto. A ligação aos dados e a entrada externa ainda estão em configuração.');button.disabled=false;}
button.addEventListener('click',async()=>{button.disabled=true;try{await client.loginRedirect(loginRequest);}catch(error){message('Entrada não concluída',errorMessage(error));button.disabled=false;}});
connect.addEventListener('click',async()=>{connect.disabled=true;storageStatus.textContent='A consultar o SharePoint…';try{const api=createSharePointClient(async()=>{const token=await client.acquireTokenSilent({account,scopes:graphScopes});return token.accessToken;});const data=await api.readStructure();storageStatus.textContent=`SharePoint ligado · ${data.MDP_Unidades.length} unidades · ${data.MDP_Equipamentos.length} equipamentos · ${data.MDP_Trabalhos.length} trabalhos`; }catch(error){storageStatus.textContent=error.name==='InteractionRequiredAuthError'?'A autorização Microsoft para este site ainda precisa de ser configurada.':error.message;}finally{connect.disabled=false;}});
signout.addEventListener('click',async()=>{signout.disabled=true;try{await client.logoutRedirect({account,postLogoutRedirectUri:config.auth.redirectUri});}catch(error){message('Saída não concluída',errorMessage(error));signout.disabled=false;}});
}
start().catch(()=>{message('Entrada Microsoft indisponível','Não foi possível preparar a entrada. Atualize a página para tentar novamente.');button.disabled=true;});
