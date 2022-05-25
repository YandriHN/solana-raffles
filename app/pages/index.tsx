import { BN, ProgramAccount } from "@project-serum/anchor";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import type { NextPage } from "next";
import Head from "next/head";
import { useContext, useEffect, useState } from "react";
import { ScaleLoader } from "react-spinners";
import Raffle from "../src/components/raffle/raffle";
import { ContractContext } from "../src/context/contract";
import styles from "../styles/home.module.scss";

const Home: NextPage = () => {
  const [raffles, setRaffles] = useState<JSX.Element[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const program = useContext(ContractContext);

  const fetchRaffles = async () => {
    if (!program) return;
    const data = await program.program.account.raffle.all();
    await new Promise((r) => setTimeout(r, 2000));
    console.log("Accounts: ", data);
    setRaffles(
      data.map((account) => (
        <Raffle
          key={account.publicKey.toString()}
          account={{
            author: account.account.authority,
            title: account.account.title,
            description: account.account.description,
            fee: 0,
            ends: account.account.ends.toNumber(),
            image: account.account.image,
          }}
          publicKey={account.publicKey}
        />
      ))
    );
    setLoading(false);
  };

  useEffect(() => {
    fetchRaffles();
  }, [program]);

  return (
    <div className={styles.container}>

      <Head>
        <title>DAOify Raffles</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <div className={styles.disclaimer}>
        <h3>Disclaimer</h3>
        <p>
          DAOify is providing a service to host raffles, we do not
          endorse any raffles hosted on this site - please use discretion when
          participating.
        </p>
      </div>

      <hr style={{ margin: "50px 0" }} />

      {loading ? (
        <div className={styles.loading}>
          {" "}
          <ScaleLoader color="white" loading={loading} />
        </div>
      ) : (
        raffles && raffles
      )}
    </div>
  );
};

export default Home;
