import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { SolanaRaffles, IDL } from "../target/types/solana_raffles";
import { airdrop, log } from "./utils";
import idl from '../target/idl/solana_raffles.json';

describe("solana-raffles", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());
  const program =  new Program<SolanaRaffles>(IDL, new anchor.web3.PublicKey(idl.metadata.address));

  let authority = anchor.web3.Keypair.generate();
  let participant = anchor.web3.Keypair.generate();

  before("initialize client", async () => {
    await airdrop(authority.publicKey, program.provider.connection);
    await airdrop(participant.publicKey, program.provider.connection);

    log(
      `
    Authority: ${authority.publicKey.toString()}
    Participant: ${participant.publicKey.toString()}
    `,
      "blue"
    );
  });

  it("create raffle", async () => {
    let raffle = anchor.web3.Keypair.generate();

    let ticket_price = new anchor.BN(0.1 * anchor.web3.LAMPORTS_PER_SOL);
    let ends = new anchor.BN(Date.now() / 1000 + 5); // ends in 5 seconds
    
    let title = 'Okay Bears Giveaway 🎉';
    let description = 'Giving away 1 okay bears, join our discord to enter.';
    let image = 'https://i.ibb.co/w04Prt6/c1f64245afb2.gif';

    let winners = 1;


    const instruction = await program.methods
      .createRaffle(ticket_price, ends, title, description, image, winners)
      .accounts({
        raffle: raffle.publicKey,
        authority: authority.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .instruction();

    const transaction = new anchor.web3.Transaction();
    transaction.add(instruction);

    const tx = await program.provider.sendAndConfirm(transaction, [
      authority,
      raffle,
    ]);

    log(
      `
    Created Raffle
    Signature: ${tx}
    Raffle ID: ${raffle.publicKey.toString()}
    `,
      "blue"
    );
  });

  it("purchase ticket", async () => {
    let ticket = anchor.web3.Keypair.generate();
    let raffle = (await program.account.raffle.all())[0];

    const instruction = await program.methods
      .purchaseTicket()
      .accounts({
        raffle: raffle.publicKey,
        ticket: ticket.publicKey,
        participant: participant.publicKey,
        authority: authority.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .instruction();

    const transaction = new anchor.web3.Transaction();
    transaction.add(instruction);

    const tx = await program.provider.sendAndConfirm(transaction, [
      authority,
      ticket,
      participant,
    ]);

    log(
      `
    Created Ticket
    Signature: ${tx}
    Ticket ID: ${ticket.publicKey.toString()}
    `,
      "blue"
    );
  });

  it("delete raffle", async () => {
    let raffle = (await program.account.raffle.all())[0];
    let ticket = (await program.account.ticket.all())[0];

    log(
      `
    Winner: ${ticket.account.participant.toString()}
    Raffle ID: ${raffle.publicKey.toString()}
    `,
      "blue"
    );

    const instruction = await program.methods
      .endRaffle()
      .accounts({
        raffle: raffle.publicKey,
        authority: authority.publicKey,
      })
      .instruction();

    const transaction = new anchor.web3.Transaction();
    transaction.add(instruction);

    const tx = await program.provider.sendAndConfirm(transaction, [authority]);

    log(
      `
    Deleted Raffle
    Signature: ${tx}
    Raffle ID: ${raffle.publicKey.toString()}
    `,
      "blue"
    );
  });
});
