import { BN, ProgramAccount } from '@project-serum/anchor';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import type { NextPage } from 'next';
import { useContext, useEffect, useState } from 'react';
import Raffle from '../src/components/raffle/raffle';
import { ContractContext } from '../src/context/contract';
import styles from '../styles/home.module.scss';

const Home: NextPage = () => {
  const [raffles, setRaffles] = useState<JSX.Element[]>([]);

  const program = useContext(ContractContext);

  const fetchRaffles = async () => {
    if(!program) return;

    const data = await program.program.account.raffle.all();
    console.log('Accounts: ', data);
    setRaffles(data.map(account => (
      <Raffle key={account.publicKey.toString()}
      account={{
        author: account.account.authority,
        title: account.account.title,
        description: account.account.description,
        fee: 0,
        ends: account.account.ends.toNumber()
      }}
      publicKey={account.publicKey}
      />
    )))
  };
  
  useEffect(() => {
    fetchRaffles();
  }, [program])

    return (
        <div className={styles.container}>
            {raffles && raffles}
        </div>
    );
};

export default Home;