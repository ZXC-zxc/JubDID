debugger;

import { JubDID, KeyPair, JubRegistry, JubResolver, createHDKeyPair } from '../src/index';
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

    //setp 3 : Use DID registry to regist a DID
    const REGURL = "http://192.168.17.45:8480";
    const COSMOSURL = "http://192.168.17.96:1317";
    let jubDID = new JubDID(key);
    let registry = new JubRegistry(REGURL,COSMOSURL);
    response = await registry.registry(jubDID);
    console.log(response);

    //step 4 : resolve DID
    const RESOLVEURL = "http://192.168.17.45:8480";
    let resolver = new JubResolver(RESOLVEURL);
    let didDocument = await resolver.resolve(jubDID.getSubject());
    console.log(JSON.stringify(didDocument));


    //step 5 : update DID
    //step 6 : sign JWT
    //step 7 : verify JWT
    //step 8 : deactive DID
};

testDID();