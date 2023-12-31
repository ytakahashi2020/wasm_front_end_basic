'use client';

import Head from 'next/head'
import { Inter } from 'next/font/google'
import styles from '../../styles/Home.module.css'
import { ApiPromise, WsProvider } from '@polkadot/api';
import { ContractPromise } from '@polkadot/api-contract';
import { BN, BN_ONE } from "@polkadot/util";
import type { WeightV2 } from '@polkadot/types/interfaces'
import '@polkadot/api-augment'
import { useState, useEffect } from 'react'

// import metadata from "./metadata.json";
import metadata from "../../../contracts/flipper_test/contracts/flipper/target/ink/flipper.json";

type HumanOutput = {
  Ok?: boolean;
  [key: string]: any;
};

const ALICE = ""

const MAX_CALL_WEIGHT = new BN(5_000_000_000_000).isub(BN_ONE);
const PROOFSIZE = new BN(1_000_000);
const storageDepositLimit = null;


export default function Home() {
  const [api, setApi] = useState<ApiPromise | null>(null);
  const [contract, setContract] = useState<ContractPromise | null>(null);
  const [bool, setBool] = useState<boolean | ''>('');
  const [contractAddress, setContractAddress] = useState('');
  const [getContractResult, setGetContractResult] = useState("");

  async function getContract () {
    try{
      // Initialise the provider to connect to the local node
      const provider = new WsProvider('wss://rpc.shibuya.astar.network');
        
      const api = await ApiPromise.create({ provider});
      setApi(api);

      const contract = new ContractPromise(api, metadata, contractAddress)
      setContract(contract)
      console.log("contract", contract)
      setGetContractResult("OK");
    }catch (error) {
      console.error(error);
      // If there's an error, set getContractResult to the error message
      setGetContractResult("NG");
    }
    
  }
  async function getResult () {
    if (contract !== null) {

      const { output }  = await contract.query['get'](ALICE,
        {
          gasLimit: api?.registry.createType('WeightV2', {
            refTime: MAX_CALL_WEIGHT,
            proofSize: PROOFSIZE,
          }) as WeightV2,
          storageDepositLimit,
        },)

        const humanOutput = output?.toHuman() as HumanOutput;

console.log("humanOutput", humanOutput)

if (humanOutput?.Ok !== undefined) {
  setBool(humanOutput.Ok)
}
    
      
    }
  }

  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <h1 style={{marginBottom: "80px"}}>Get Your Contract Information(Flipper)</h1>
        <div className={styles.description}>
          <div>
            contractAddress:<input  style={{width: "400px"}} type="text" value={contractAddress} onChange={(e) => setContractAddress(e.target.value)} />
            <button className={styles.rotatebutton} onClick={getContract}>getContract</button>

            {getContractResult && <p>Get Contract result: {getContractResult}</p>}
            <button className={styles.rotatebutton} onClick={getResult}>get contract information</button>
            <p style={{marginBottom: "20px"}}>Result: {bool.toString()}</p>

          </div>
        </div>
      </main>
    </>
  )
}