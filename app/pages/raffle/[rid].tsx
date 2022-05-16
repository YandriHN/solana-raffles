import { WalletDisconnectButton, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Menu } from '../../src/components/menu/menu';
import styles from '../../styles/raffle.module.scss';

type Data = {
  name: string;
  id: string;
}

const Raffle: NextPage = () => {
  const router = useRouter();
  const { rid } = router.query;

  const [data, setData] = useState<Data>({name: 'Raffle', id: '1092092'});

  useEffect(() => {
    //fetch account data
    setData({
      name: 'My Raffle',
      id: rid as string
    })

  })

    return (
        <div className={styles.container}>
          
          <h2>{data && data.name}</h2>
     
          <button>hello</button>
          
    

        </div>
      
    );
};

export default Raffle;