export const tenantId='ee417351-ea90-41e0-9147-5ea6ab38ea49';
export const config={auth:{clientId:'6153d512-a0ec-4af2-b449-ed2d0df148f4',authority:`https://login.microsoftonline.com/${tenantId}`,redirectUri:'https://montedopasto.github.io/mdp-maintenance-360/',navigateToLoginRequestUrl:false},cache:{cacheLocation:'sessionStorage'}};
export const loginRequest={scopes:['openid','profile'],prompt:'select_account'};
export function chooseAccount(result,active){const account=result?.account??active;return account?.tenantId===tenantId?account:null;}
