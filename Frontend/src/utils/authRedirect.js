const REDIRECT_KEY = "redirectAfterLogin";

const isAuthCallbackPath = (path) => path.startsWith("/login/oauth2/code/");

export const currentRedirectPath = () => {
  const path = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (!path || path === "/" || isAuthCallbackPath(window.location.pathname)) {
    return "/dashboard";
  }
  return path;
};

export const saveRedirectAfterLogin = (path = currentRedirectPath()) => {
  if (!path || isAuthCallbackPath(path)) return;
  sessionStorage.setItem(REDIRECT_KEY, path);
};

export const consumeRedirectAfterLogin = () => {
  const path = sessionStorage.getItem(REDIRECT_KEY);
  sessionStorage.removeItem(REDIRECT_KEY);
  return path || "/dashboard";
};
