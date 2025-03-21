import { NextRequest, NextResponse } from 'next/server';

/**
 * デバッグ情報を提供するAPI
 * GET /api/debug
 */
export async function GET(request: NextRequest) {
  // クライアントサイドのストレージ情報は取得できないため、
  // このAPIはサーバー側の情報のみを提供

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    message: 'デバッグAPIは正常に動作しています。サーバー側の情報のみ提供可能です。',
    requestHeaders: Object.fromEntries(request.headers.entries()),
    url: request.url,
    method: request.method,
  });
}
