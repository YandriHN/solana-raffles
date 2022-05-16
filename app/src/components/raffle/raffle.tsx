import { FC } from "react";
import styles from './raffle.module.scss';

const Raffle: FC = () => {
    return (
        <div className={styles.container}>
            <div className={styles.title}>
                My Raffle
            </div>
            <div className={styles.body}>
                Win 2 Solana Coin!!
            </div>
            <div className={styles.footer_button}>
                MORE INFO
            </div>
        </div>
    )

}

export default Raffle;
