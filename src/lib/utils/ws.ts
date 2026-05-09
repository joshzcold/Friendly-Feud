export const getWebSocketUrl = (path = "/api/ws") => {
  if (typeof window === "undefined") {
    return `ws://localhost${path}`;
  }

  const protocol = window.location.protocol === "https:" ? "wss" : "ws";

  return `${protocol}://${window.location.host}${path}`;
};
