const OAUTH_BASE_URL = import.meta.env.VITE_API_LOGIN || "http://localhost:7070";
const OAUTH_RESPONSE_TYPE = import.meta.env.VITE_OAUTH_RESPONSE_TYPE || "code";
const OAUTH_CLIENT_ID = import.meta.env.VITE_OAUTH_CLIENT_ID || "volunteerhub-client";
const OAUTH_SCOPE = import.meta.env.VITE_OAUTH_SCOPE || "openid profile email";
const OAUTH_REDIRECT_URI =
    import.meta.env.VITE_OAUTH_REDIRECT_URI ||
    "http://localhost:3000/login/oauth2/code/volunteerhub";

const LOGIN_LINK =
    `${OAUTH_BASE_URL}/oauth2/authorize` +
    `?response_type=${encodeURIComponent(OAUTH_RESPONSE_TYPE)}` +
    `&client_id=${encodeURIComponent(OAUTH_CLIENT_ID)}` +
    `&scope=${encodeURIComponent(OAUTH_SCOPE)}` +
    `&redirect_uri=${encodeURIComponent(OAUTH_REDIRECT_URI)}`;

export { LOGIN_LINK };
