debugger;

import { JubDID, KeyPair, JubRegistry, JubResolver, createHDKeyPair } from '../src/index';


async function testDID() {
    //create
    const MNEMONIC = "wolf thumb intact fantasy cave lonely barely setup dress life invest kingdom potato apple iron sentence sense paddle then ability minimum attract pottery glue";
    let key: KeyPair = createHDKeyPair(MNEMONIC, '44\'/118\'/0\'/0/0');
    let jubDID = new JubDID(key);
    console.log(jubDID.keyPair.sk);
    console.log(jubDID.keyPair.pk);
    console.log(jubDID.getSubject());

    //registry
    let registry = new JubRegistry("http://did.jubiterwallet.com/registry");
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