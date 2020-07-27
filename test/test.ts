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
    const FTURL = "http://39.102.46.62:9080";
    // let ftsafeProxy  = new FtsafeProxy(FTURL);
    // let response = await ftsafeProxy.createAccount(key.address,key.pk_bech32);

    //setp 3 : Use DID registry to regist a DID
    const REGURL = "http://39.102.46.62:9080";
    const COSMOSURL = "http://39.102.46.62:1317";
    let jubDID = new JubDID(key);
    // let registry = new JubRegistry(REGURL,COSMOSURL);
    // var response = await registry.registry(jubDID);
    // console.log(response);
    //step 4 : resolve DID
    const RESOLVEURL = "http://39.102.46.62:8080";
    let resolver = new JubResolver(RESOLVEURL);
    let oldDocument = await resolver.resolve(jubDID.getSubject());
    console.log("oldDocument:"+JSON.stringify(oldDocument));
    // step 5 : update DID
    // let updateKeyPair: KeyPair = createHDKeyPair(MNEMONIC, '44\'/118\'/0\'/0/1');
    // console.log("updateKeyPair: "+updateKeyPair.sk);
    // console.log("updateKeyPair: "+updateKeyPair.pk);
    // console.log("updateKeyPair: "+updateKeyPair.address);
    // console.log("updateKeyPair: "+updateKeyPair.pk_bech32);
    // var response = await registry.update(jubDID, updateKeyPair);
    // console.log(response);
    // var newDocument = await resolver.resolve(jubDID.getSubject());
    // console.log("newDocument:"+JSON.stringify(newDocument));
    //step 6 : sign JWT
    //step 7 : verify JWT
    //step 8 : deactivate DID
    // var response = await registry.deactivate(jubDID);
    // console.log(response);
    var deactivateDocument = await resolver.resolve(jubDID.getSubject());
    console.log("deactivateDocument:"+JSON.stringify(deactivateDocument));
};

testDID();