function normalizeUrl(value) {
  return value?.trim().replace(/\/$/, "");
}

function resolveVercelUrl() {
  const productionUrl = normalizeUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL);

  if (productionUrl) {
    return productionUrl.startsWith("http") ? productionUrl : `https://${productionUrl}`;
  }

  const deploymentUrl = normalizeUrl(process.env.VERCEL_URL);

  if (deploymentUrl) {
    return deploymentUrl.startsWith("http") ? deploymentUrl : `https://${deploymentUrl}`;
  }

  return null;
}

export function getFrontendUrl() {
  return normalizeUrl(process.env.FRONTEND_URL) ?? resolveVercelUrl() ?? "http://localhost:5173";
}
