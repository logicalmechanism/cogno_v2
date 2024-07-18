import "../styles/globals.css";
import type { AppProps } from "next/app";
import { MeshProvider } from "@meshsdk/react";
import Head from "next/head";

function Cogno({ Component, pageProps }: AppProps) {
  return (
    <>
    <Head>
      <title>Cogno Forum</title>
      <meta property="og:title" content="Cogno Forum" key="og:title" />
      <meta name="description" content="A fully on-chain social media platform built on the Cardano blockchain." />
      <meta property="og:description" content="A fully on-chain social media platform built on the Cardano blockchain." key="og:description" />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://www.cogno.forum/" />
      <meta property="og:image" content="/og-image.png" />
    </Head>
    <MeshProvider>
      <Component {...pageProps} />
    </MeshProvider>
    </>
  );
}

export default Cogno;