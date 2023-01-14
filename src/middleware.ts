import { PLAYERS } from "config";
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest): NextResponse | void {
    const url = request.nextUrl.clone();
    if (url.pathname === "/" || url.pathname === "/player") {
        url.pathname = `/player/${
            PLAYERS[Math.floor(Math.random() * PLAYERS.length)]
        }`;
        return NextResponse.redirect(url);
    }
}
