const LOGIN_LINK =
    'http://localhost:7070/oauth2/authorize' +
    `?response_type=${import.meta.env.VITE_OAUTH_RESPONSE_TYPE}` +
    `&client_id=${import.meta.env.VITE_OAUTH_CLIENT_ID}` +
    `&scope=${import.meta.env.VITE_OAUTH_SCOPE}` +
    `&redirect_uri=${import.meta.env.VITE_OAUTH_REDIRECT_URI}`;

console.log(LOGIN_LINK)
export { LOGIN_LINK };