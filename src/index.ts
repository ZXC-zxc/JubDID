import * as elliptic from "elliptic";
import {CosmosClient} from "./CosmosTx"
import { fetchGetData, fetchPostData } from "./fetchUtil";
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

    getRegistryStr() :string{
        let subject = this.getSubject();
        let json:any = {
            "authentication": [
                {
                    "type": "Secp256k1",
                    "publicKey": [
                        subject + "#key-1"
                    ]
                }
            ],
            "publicKey": [
                {
                    "id": subject + "#key-1",
                    "type": "Secp256k1",
                    "publicKeyHex": this.keyPair.pk
                }
            ]
        };

        return JSON.stringify(json);
    }
}

class JubRegistry{
    url : string;
    cosmosUrl : string;
    constructor(url:string,cosmosUrl:string){
        this.url = url ;
        this.cosmosUrl = cosmosUrl;
    }

    //create jubdid through Registry
    async registry(did:JubDID):Promise<string>{
        //setp 1 : sign a registry cosmos tx
        let cosmosClient = new CosmosClient(this.cosmosUrl);
        let signedTx = await cosmosClient.signRegisterTx(did);
        //setp 2 : use signedTx as data and post to registry
        let data = {"options":{"operateType":"register","txMsg":"","identifier": ""}};
        data["options"]["txMsg"] = signedTx;
        data["options"]["identifier"] = did.getSubject();

        let url = this.url + "/uni-registrar-web/1.0/register?driverId=driver-universalregistrar%2Fdriver-did-jub";
        let response = await fetchPostData(url,data);
        return response;
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
        let url = this.url + "/uni-resolver-web/1.0/identifiers/" + didSubject;
        return fetchGetData(url);
    }
}

export {JubDID,KeyPair,JubRegistry,JubResolver,createHDKeyPair};
export const Greeter = (name: string) => `Hello ${name}`;