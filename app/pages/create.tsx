import { useAnchorWallet } from "@solana/wallet-adapter-react";
import type { NextPage } from "next";
import { useContext, useState } from "react";
import { ContractContext } from "../src/context/contract";
import { createRaffle } from "../src/utils/instructions";
import styles from "../styles/create.module.scss";
import { Keypair, Transaction } from "@solana/web3.js";

const Create: NextPage = () => {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [token, setToken] = useState<string>("");
  const [fee, setFee] = useState<number>(0);

  const wallet = useAnchorWallet();
  const program = useContext(ContractContext);

  const handleCreate = async () => {
    try {
    console.log('Caught');
      if (!program) return console.log('No Program');
      if (!wallet) return console.log('No wallet connected');

      const ends: number = Date.now() + 300000;
      const raffle = Keypair.generate();
      const instruction = await createRaffle(
        program.program,
        fee,
        title,
        description,
        token,
        ends,
        wallet.publicKey,
        raffle.publicKey
      
      );

      const blockhash = await program.connection.getLatestBlockhash('confirmed');
      console.log(await (program.connection.getBalance(wallet.publicKey, 'finalized')));

      console.log('Blockhash:', blockhash.blockhash.toString())

      const transaction = new Transaction({
        feePayer: wallet.publicKey,
        recentBlockhash: blockhash.blockhash
      });
      
      transaction.add(instruction);
      transaction.sign(raffle);
      const signed = await wallet.signTransaction(transaction);
      const signature = await program.connection.sendRawTransaction(
        signed.serialize(),
        { skipPreflight: false }
      );
      await program.connection.confirmTransaction(signature, "single");
    } catch (err: any) {
      console.log("Error sending transaction");
      console.log(err);
    }
  };

  return (
    <div className={styles.container}>
      <h2>Create a Raffle</h2>
  
        <label>
          Title
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="My Whitelist Raffle" />
        </label>
        <label>
          Description:
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Raffle to win an awesome whitelist!" />
        </label>
        <label>
          End Date:
          <input type="date" />
        </label>
        <label>
          End Time UTC:
          <input type="time" />
        </label>
        <label>
          Fee Token Address:
          <input
            type="text"
            name="name"
            placeholder="Example: LUSTdLASZy86pR6V5VjMpXxW9oVtCQt8q3fJ9iHZtPY"
          />
        </label>
        <label>
          Entry Fee:
          <input type="number" placeholder="0.000" value={fee} onChange={(e) => setFee(e.target.valueAsNumber)} />
        </label>
        <input type="submit" value="Create Raffle" onClick={handleCreate}/>
  
    </div>
  );
};

export default Create;
