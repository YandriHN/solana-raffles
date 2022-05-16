import { BN, Program } from "@project-serum/anchor";
import { SolanaRaffles } from '../context/solana_raffles';
import { PublicKey, Keypair, SystemProgram } from '@solana/web3.js';

export const createRaffle = async (
    program: Program<SolanaRaffles>,
    fee: number,
    title: string,
    description: string,
    token: string,
    ends: number,
    authority: PublicKey,
    raffle: PublicKey
) => {
    return await program.methods
    .createRaffle(
        new BN(fee),
        new BN(ends),
        title,
        description
    )
    .accounts({
        raffle: raffle,
        authority: authority,
        systemProgram: SystemProgram.programId
    })
    .instruction();
}
