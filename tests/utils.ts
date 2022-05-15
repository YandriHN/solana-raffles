import * as anchor from "@project-serum/anchor";

export const airdrop = async (
  wallet: anchor.web3.PublicKey,
  connection: anchor.web3.Connection
) => {
  let tx = await connection.requestAirdrop(
    wallet,
    2 * anchor.web3.LAMPORTS_PER_SOL
  );
  await connection.confirmTransaction(tx, "confirmed");
};

export const log = (message: string, color: "red" | "green" | "blue") => {
  let colors = {
    red: "\x1b[31m",
    green: "\x1b[32m",
    blue: "\x1b[34m",
  };
  console.log(colors[color], message, "\x1b[0m");
};
