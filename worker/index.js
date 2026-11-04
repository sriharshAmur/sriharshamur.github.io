export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    let response;

    if (url.hostname === "www.sriharsh.com" || url.protocol !== "https:") {
      url.hostname = "sriharsh.com";
      url.protocol = "https:";
      response = Response.redirect(url.toString(), 308);
    } else if (url.pathname.startsWith("/long-exposure")) {
      // The more specific Cloudflare route belongs to the timeline Worker.
      // Fail closed if that route is ever removed, rather than serving portfolio content.
      response = new Response("Not found", { status: 404 });
    } else {
      response = await env.ASSETS.fetch(request);
    }

    const headers = new Headers(response.headers);
    headers.set("Strict-Transport-Security", "max-age=31536000");
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("X-Frame-Options", "DENY");
    headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
};
