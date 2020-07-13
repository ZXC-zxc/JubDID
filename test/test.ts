debugger;

import {JubDID,KeyPair,JubRegistry,JubResolver,createHDKeyPair} from '../src/index';


async function testDID() {
    //create
    const MNEMONIC = "gauge hole clog property soccer idea cycle stadium utility slice hold chief";
    let key:KeyPair = createHDKeyPair(MNEMONIC,'44\'/364\'/0\'/0/0');
    let jubDID = new JubDID(key);
    console.log(jubDID.keyPair.sk);
    console.log(jubDID.keyPair.pk);
    console.log(jubDID.getSubject());
    //registry
    let registry = new JubRegistry("http://did.jubiterwallet.com/registry");
    let rv = await registry.registry(jubDID);
    //change owner
    let newKey = createHDKeyPair(MNEMONIC,'44\'/364\'/0\'/0/1');
    rv = await registry.changeOwner(jubDID,newKey);

    //sign Jwt

    //verify Jwt
    let resolver = new JubResolver("http://did.jubiterwallet.com/resolver");

    //deactive
    rv = await registry.deactive(jubDID);
};

testDID();