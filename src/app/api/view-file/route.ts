import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const fileUrl = searchParams.get('url');

    if (!fileUrl) {
        return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    try {
        const response = await fetch(fileUrl);

        if (!response.ok) {
            throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
        }

        const blob = await response.blob();
        const headers = new Headers();

        // Pass through original content type
        const contentType = response.headers.get('content-type') || 'application/pdf';
        headers.set('Content-Type', contentType);

        // Suggest a filename if possible
        const filename = fileUrl.split('/').pop() || 'document.pdf';
        headers.set('Content-Disposition', `inline; filename="${filename}"`);

        return new NextResponse(blob, {
            status: 200,
            headers,
        });
    } catch (error: any) {
        console.error('Proxy error:', error);
        return NextResponse.json({ error: 'Failed to proxy file', message: error.message }, { status: 500 });
    }
}
