import { FC } from "react";
import styles from './raffle.module.scss';
import { PublicKey } from '@solana/web3.js';
import { useRouter } from "next/router";

type RaffleType = {
    account: {
        author: PublicKey;
        ends: number;
        title: string;
        description: string;
        fee: number;
    }
    publicKey: PublicKey
}
 
const Raffle: FC<RaffleType> = ({ account, publicKey }) => {

    const router = useRouter();

    return (
        <div className={styles.container}>
            <div className={styles.title}>
                {account.title}
            </div>
            <div className={styles.body}>
                {account.description}
            </div>
            <div className={styles.footer_button} onClick={() => router.push(`/raffle/${publicKey.toString()}`)}>
                MORE INFO
            </div>
        </div>
    )

}

export default Raffle;
