/// <reference types="@cloudflare/workers-types" />

export const onRequestGet: PagesFunction = async () => {
  return new Response(
    JSON.stringify({
      ok: true,
      ts: new Date().toISOString(),
      runtime: 'cloudflare-pages-functions',
    }),
    {
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
      },
    },
  );
};
