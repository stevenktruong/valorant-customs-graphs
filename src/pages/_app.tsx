import * as React from "react";
import Head from "next/head";
import App from "next/app";

import "styles/global.scss";

export default class MyApp extends App {
    render(): JSX.Element {
        const { Component, pageProps } = this.props;
        return (
            <>
                <Head>
                    <title>VALORANT Customs Stats</title>
                    <meta
                        name="viewport"
                        content="width=device-width, initial-scale=1"
                    />
                </Head>
                <Component {...pageProps} />
            </>
        );
    }
}
