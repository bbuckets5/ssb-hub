// app/api/proxy/route.js

import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const targetUrl = searchParams.get('url');

        if (!targetUrl) {
            return NextResponse.json({ message: 'URL parameter is required.' }, { status: 400 });
        }

        // Security: Only allow proxying for Kick's video domain
        const allowedDomain = "kick.com";
        const urlObject = new URL(targetUrl);
        if (!urlObject.hostname.endsWith(allowedDomain)) {
             return NextResponse.json({ message: 'Proxying for this domain is not allowed.' }, { status: 403 });
        }

        const response = await fetch(targetUrl);

        if (!response.ok) {
            return NextResponse.json({ message: 'Failed to fetch the resource from the target URL.'}, { status: response.status });
        }

        // Stream the response back to the client
        return new Response(response.body, {
            headers: {
                'Content-Type': response.headers.get('Content-Type') || 'application/octet-stream',
            },
        });

    } catch (error) {
        console.error("Proxy error:", error);
        return NextResponse.json({ message: 'Server error in proxy.' }, { status: 500 });
    }
}
