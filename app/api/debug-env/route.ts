import { NextResponse } from 'next/server';

export async function GET() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const status = {
        supabase_url: url ? `Found (${url.substring(0, 10)}...)` : 'MISSING ❌',
        supabase_key: key ? `Found (${key.substring(0, 10)}...)` : 'MISSING ❌',
        node_env: process.env.NODE_ENV
    };

    const html = `
    <html>
      <body style="font-family: monospace; padding: 2rem; background: #f5f5f4; color: #1c1917;">
        <h1>🔑 Environment Check</h1>
        <div style="border: 1px solid #d6d3d1; padding: 2rem; background: white; border-radius: 8px;">
            <p><strong>URL:</strong> ${status.supabase_url}</p>
            <p><strong>KEY:</strong> ${status.supabase_key}</p>
            <hr style="opacity:0.2; margin: 2rem 0"/>
            ${(!url || !key)
            ? '<h2 style="color: #ef4444">⚠️ KEYS MISSING!</h2><p>You did not create the .env.local file correctly.</p>'
            : '<h2 style="color: #22c55e">✅ KEYS FOUND!</h2><p>Restart the server now.</p>'
        }
        </div>
      </body>
    </html>
    `;

    return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } });
}
