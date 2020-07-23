import * as elliptic from "elliptic";
import {CosmosClient} from "./CosmosTx"
const cosmos = require('@jswebfans/cosmos-lib');
const EC = elliptic.ec;
const secp256k1 = new EC('secp256k1')

//defines
const JUB_OK = 0;

type KeyPair = {
    sk:string,
    pk:string,
    address:string,
    pk_bech32:string
};


function createHDKeyPair(Mnemoic:string,Path:string):KeyPair{
    const keys = cosmos.crypto.getKeysFromMnemonic(Mnemoic,Path);
    let key:KeyPair = {
        sk:Buffer.from(keys.privateKey).toString('hex'),
        pk:Buffer.from(keys.publicKey).toString('hex'),
        address:cosmos.address.getAddress(Buffer.from(keys.publicKey,"hex")),
        pk_bech32:cosmos.publicKey.getPublicKey(Buffer.from(keys.publicKey,"hex"))
    }
    
   return key;
}

class JubDID {
    keyPair:KeyPair;
    constructor(Key:KeyPair){
        this.keyPair = Key;
    }

    getSubject() :string{
        return `did:jub:${this.keyPair.address}`;
    }
}

class JubRegistry{
    url:string;
    cosmosClient :CosmosClient;
    constructor(url:string,key:KeyPair){
        this.url = url;
        this.cosmosClient = new CosmosClient(key,"");
    }

    //create jubdid through Registry
    async registry(did:JubDID):Promise<Number>{
        return JUB_OK;
    }

    //update jubdid through Registry
    async changeOwner(did:JubDID,newKey:KeyPair):Promise<Number>{
        return JUB_OK;
    }

    //deactive jubdid through Registry
    async deactive(did:JubDID):Promise<Number>{
        return JUB_OK;
    }
}

class JubResolver{
    url:string;
    constructor(url:string){
        this.url = url;
    }

    async resolve(didSubject:string):Promise<string>{
        return  "";
    }
}

export {JubDID,KeyPair,JubRegistry,JubResolver,createHDKeyPair};
export const Greeter = (name: string) => `Hello ${name}`;