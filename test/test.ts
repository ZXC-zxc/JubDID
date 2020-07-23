debugger;

import { JubDID, KeyPair, JubRegistry, JubResolver, createHDKeyPair } from '../src/index';
import { CosmosClient } from '../src/CosmosTx';
import { FtsafeProxy } from '../src/FtsafeProxy';


async function testDID() {
    //step 1 : Create Key Pair
    const MNEMONIC = "gauge hole clog property soccer idea cycle stadium utility slice hold chief";
    let key: KeyPair = createHDKeyPair(MNEMONIC, '44\'/118\'/0\'/0/0');
    console.log(key.sk);
    console.log(key.pk);
    console.log(key.address);
    console.log(key.pk_bech32);

    //step 2 : Use ftsafe proxy to create a new cosmos account
    const FTURL = "http://192.168.17.45:8480";
    let ftsafeProxy  = new FtsafeProxy(FTURL);
    let response = await ftsafeProxy.createAccount(key.address,key.pk_bech32);
    console.log(response);

    //setp 3 : Use 


    let jubDID = new JubDID(key);

    //registry
    let registry = new JubRegistry("http://did.jubiterwallet.com/registry",key);
    let rv = await registry.registry(jubDID);
    //change owner
    let newKey = createHDKeyPair(MNEMONIC, '44\'/118\'/0\'/0/1');
    rv = await registry.changeOwner(jubDID, newKey);

    //sign Jwt

    //verify Jwt
    let resolver = new JubResolver("http://did.jubiterwallet.com/resolver");

    //deactive
    rv = await registry.deactive(jubDID);
};

testDID();