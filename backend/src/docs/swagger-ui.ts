import { Request, Response } from "express";
import { swaggerSpec } from "./swagger";

function renderSwaggerHtml() {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>API Docs</title>
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css"
    />
    <style>
      html, body {
        margin: 0;
        padding: 0;
        background: #faf7f2;
      }
      #swagger-ui {
        max-width: 1200px;
        margin: 0 auto;
      }
      .topbar {
        display: none;
      }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
    <script>
      window.onload = function () {
        window.ui = SwaggerUIBundle({
          url: "/api-docs.json",
          dom_id: "#swagger-ui",
          deepLinking: true,
          presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
          plugins: [SwaggerUIBundle.plugins.DownloadUrl],
          layout: "StandaloneLayout"
        });
      };
    </script>
  </body>
</html>`;
}

export function serveSwaggerUi(_req: Request, res: Response) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; img-src 'self' data: https:; font-src 'self' https://cdn.jsdelivr.net; connect-src 'self';"
  );
  res.type("html").send(renderSwaggerHtml());
}

export function serveSwaggerJson(_req: Request, res: Response) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.json(swaggerSpec);
}
