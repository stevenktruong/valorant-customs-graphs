import { NextRequest, NextResponse } from "next/server";

import { PLAYERS } from "config";

export function middleware(request: NextRequest): NextResponse | void {
    const url = request.nextUrl.clone();
    if (url.pathname === "/player") {
        url.pathname = `/player/${
            PLAYERS[Math.floor(Math.random() * PLAYERS.length)]
        }`;
        return NextResponse.redirect(url);
    }
}
