import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import { ContractContext } from "../../src/context/contract";
import { PublicKey, Keypair, Transaction } from "@solana/web3.js";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { closeRaffle, purchaseTicket } from "../../src/utils/instructions";
import styles from "../../styles/raffle.module.scss";

type LocalRaffleInformation = {
  purchasedTickets: number;
  setAt: number;
}

type RaffleType = {
  authority: PublicKey;
  title: string;
  description: string;
  ends: number;
};

const Raffle: NextPage = () => {
  const program = useContext(ContractContext);
  const wallet = useAnchorWallet();
  const router = useRouter();

  const { rid } = router.query;

  const [data, setData] = useState<RaffleType | null>();
  const [loading, setLoading] = useState<boolean>(true);

  const [selectedTickets, setSelectedTickets] = useState<number>(1);
  const [purchasedTickets, setPurchasedTickets] = useState<number>(0);

  const [drawn, setDrawn] = useState<boolean>(false);
  const [winners, setWinners] = useState<JSX.Element[]>();


  const getAndSetPurchasedTickets = async () => {
    if(!program || !rid || !wallet) return;
    const allTickets = await program.program.account.ticket.all();
    const onChain = allTickets.filter(ticket => ticket.account.raffle.toString() == rid && ticket.account.participant.toString() == wallet.publicKey.toString()).length;
    const data = JSON.stringify({
      rid: rid,
      owner: wallet.publicKey.toString(),
    });
    const local = window.localStorage.getItem(data);
    if(!local) return setPurchasedTickets(onChain);
    const localData: LocalRaffleInformation  = JSON.parse(local);
    if(Date.now() - localData.setAt > 60000) return setPurchasedTickets(onChain);
    setPurchasedTickets(localData.purchasedTickets);
  }

  const setRaffle = async () => {
    if (!program || !rid) return;
    const raffle = await program.program.account.raffle.fetch(
      new PublicKey(rid)
    );
    setData({
      authority: raffle.authority,
      title: raffle.title,
      description: raffle.description,
      ends: raffle.ends.toNumber(),
    });
    setLoading(false);
  };

  const handleDraw = async () => {
    if(!program || !wallet || !rid) return;
    setDrawn(false);
    const tickets = (await program.program.account.ticket.all()).filter(ticket => ticket.account.raffle.toString() == rid).sort(() => Math.random() - Math.random()).slice(0, 5);

    setWinners(
      tickets.map(ticket => (
        <div className={styles.winner}>
            {ticket.account.participant.toString()}
        </div>
      ))
    );
    setDrawn(true);

  };

  const handlePurchaseTickets = async (amount: number) => {
    if(amount == 0) return alert('Please select at least one ticket');
    if(amount > 25) return alert('Maximum of 25 tickets per transaction');
      try {
        if (!program) return console.log('No Program');
        if (!wallet) return console.log('No wallet connected');
        if (!data) return console.log('Raffle data not loaded');
        if (!rid) return console.log('Raffle does not exist');

        const blockhash = await program.connection.getLatestBlockhash('finalized');
  
        const transaction = new Transaction({
          lastValidBlockHeight: blockhash.lastValidBlockHeight,
          blockhash: blockhash.blockhash,
          feePayer: wallet.publicKey
        });
        
        for (let i = 0; i < amount; i++) {
          let ticket = Keypair.generate();
          let instruction = await purchaseTicket(
            program.program,
            data.authority,
            wallet.publicKey,
            new PublicKey(rid),
            ticket.publicKey
          );
          transaction.add(instruction);
          transaction.sign(ticket);
        }

        const signed = await wallet.signTransaction(transaction);

        const signature = await program.connection.sendRawTransaction(signed.serialize());
  
        await program.connection.confirmTransaction({
          blockhash: blockhash.blockhash,
          lastValidBlockHeight: blockhash.lastValidBlockHeight,
          signature: signature
        }, 'single');

        setPurchasedTickets(purchasedTickets + amount);
        setSelectedTickets(0);

        window.localStorage.setItem(
          JSON.stringify({
            rid: rid,
            owner: wallet.publicKey.toString(),
          }),
          JSON.stringify({
            purchasedTickets: purchasedTickets + amount,
            setAt: Date.now()
          })
        );

        alert('Ticket purchased');
  
      } catch (err: any) {
        console.log("Error sending transaction");
        console.log(err);
      }
    };

  const handleClose = async () => {
    try {
      console.log("Caught");
      if (!program) return console.log("No Program");
      if (loading) return console.log("Currently Loading");
      if (!wallet) return console.log("Must be connected");
      if (!rid) return console.log("Invalid RID");

      const instruction = await closeRaffle(
        program.program,
        wallet.publicKey,
        new PublicKey(rid)
      );

      const blockhash = await program.connection.getLatestBlockhash(
        "finalized"
      );

      const transaction = new Transaction({
        lastValidBlockHeight: blockhash.lastValidBlockHeight,
        blockhash: blockhash.blockhash,
        feePayer: wallet.publicKey,
      });

      transaction.add(instruction);
      const signed = await wallet.signTransaction(transaction);
      const signature = await program.connection.sendRawTransaction(
        signed.serialize()
      );

      await program.connection.confirmTransaction({
        blockhash: blockhash.blockhash,
        lastValidBlockHeight: blockhash.lastValidBlockHeight,
        signature: signature,
      });
    } catch (err: any) {
      console.log("Error sending transaction");
      console.log(err);
    }
  };

  useEffect(() => {
    setRaffle();
    getAndSetPurchasedTickets();
  }, [program, wallet]);

  return loading ? (
    <h2>Loading...</h2>
  ) : data ? (
    <div className={styles.container}>
      <h1>{data.title}</h1>

      {data.authority &&
        wallet &&
        data.authority.toString() == wallet.publicKey.toString() && (
          <div className={styles.tools}>
            <button onClick={() => handleDraw()}>Draw Raffle</button>
            <button onClick={() => handleClose()}>Close Raffle</button>
          </div>
        )}

      <hr />


      <div className={styles.content}>

      {data.authority &&
        wallet &&
        data.authority.toString() == wallet.publicKey.toString() && (
          <div className={`${styles.draw} ${drawn && styles.full}`}>
            <h3>Drawed Winner/s: </h3>
            {winners && winners}
            <hr/>
          </div>
      
        )}
        <div className={styles.actions}>

          <h2>Purchase Tickets</h2>
          <p>Current Tickets: &nbsp; <b>{purchasedTickets}</b></p>
          <div className={styles.selector}>
            <button
            disabled
              onClick={() => {
                setSelectedTickets(selectedTickets - 1);
              }}
            >
              −
            </button>
            <h3>{selectedTickets.toString()}</h3>

            <button
            disabled
              onClick={() => {
                setSelectedTickets(selectedTickets + 1);
              }}
            >
              +
            </button>
          </div>
          <button style={{ width: "100%" }} onClick={() => handlePurchaseTickets(selectedTickets)}>Purchase Tickets</button>

        </div>

        <div className={styles.description}>
          <p>{data.description}</p>
        </div>
    </div>

    </div>
  ) : (
    <h2>404</h2>
  );
};

export default Raffle;
