import * as React from "react";
import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
    return (
        <Html>
            <Head>
                <meta charSet="utf-8" />
                <link rel="icon" href="/favicon.ico" />
                <meta name="theme-color" content="#0e1821" />
                <meta
                    name="description"
                    content="Statistics tracking of DARWIN Discord custom games"
                />
                <link rel="manifest" href="/manifest.json" />
                <link
                    rel="preload"
                    href="/fonts/Tungsten-Bold/Tungsten-Bold.ttf"
                    as="font"
                    crossOrigin=""
                    type="font/ttf"
                />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
