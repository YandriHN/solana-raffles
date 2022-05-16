import { WalletDisconnectButton, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import type { NextPage } from 'next';
import { Menu } from '../src/components/menu/menu';
import Raffle from '../src/components/raffle/raffle';
import styles from '../styles/home.module.scss';

const Home: NextPage = () => {
    return (
        <div className={styles.container}>
         
          <Raffle/>
       

        </div>
    );
};

export default Home;