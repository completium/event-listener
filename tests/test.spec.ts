import { BlockResponse, RpcClient } from '@taquito/rpc';
import { InMemorySigner } from '@taquito/signer';
import { TezosToolkit } from '@taquito/taquito';
import fs from 'fs';

import { run_listener } from '../src';
import { register_TestEvent, TestEvent } from './test_bindings_gen';

const endpoint = 'https://ghostnet.ecadinfra.com';

const Tezos = new TezosToolkit(endpoint);

Tezos.setProvider({
  signer: new InMemorySigner('edskS84iHsizjnkbgmW1RUvgaTx73ktsaNx7xfiD9GHf1EZULLw2PJkYehVhEvhMd9UfwAPV6PAm75MuEgAGCcBck9a53vuK5Q'),
});

let client = new RpcClient(endpoint);

const event_test_michelson = fs.readFileSync('./tests/contracts/testevent.tz').toString();

const anint = 12345
const astring = 'This is a string'

function handleTestEvent(e: TestEvent) {
  console.log(`Test Event detected with values '${e.ival}' and '${e.sval}'!`);
  if (e.ival.toNumber() !== anint || e.sval !== astring) {
    console.log('Failure')
    process.exit(-1)
  }
  console.log('Success')
  process.exit()
}

describe('Run test', async () => {
  const originationOp = await Tezos.contract.originate({
    code: event_test_michelson,
    storage: {}
  });
  console.log(`Waiting for confirmation of origination for ${originationOp.contractAddress}...`);
  const contract = await originationOp.contract();
  console.log(`Contract originated at ${contract.address}.`);
  register_TestEvent(contract.address, handleTestEvent);
  let bottomBlock: BlockResponse = await client.getBlock({ block: "head~4" });
  let bottom = bottomBlock.hash;
  console.log(`Bottom block hash is ${bottom}`);
  const op = await contract.methods.default(anint, astring).send();
  console.log("Calling contract...");
  await op.confirmation();
  run_listener({
    bottom: bottom,
    endpoint: endpoint,
    verbose: true
  });
})

