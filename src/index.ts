import * as elliptic from "elliptic";
const cosmos = require('@jswebfans/cosmos-lib');
const EC = elliptic.ec;
const secp256k1 = new EC('secp256k1')

//defines
const JUB_OK = 0;

type KeyPair = {
    sk:string,
    pk:string
};

function sortObject(obj:any):any {
	if (obj === null) return null;
	if (typeof obj !== "object") return obj;
	if (Array.isArray(obj)) return obj.map(sortObject);
	const sortedKeys = Object.keys(obj).sort();
	const result:any = {};
	sortedKeys.forEach(key => {
		result[key] = sortObject(obj[key])
	});
	return result;
}

function createHDKeyPair(Mnemoic:string,Path:string):KeyPair{
    const keys = cosmos.crypto.getKeysFromMnemonic(Mnemoic,Path);
    //test sign cosmos tx
    const jsonStr = '{"chain_id":"Jubiter","fee":{"amount":[],"gas":"200000"},"memo":"","msgs":[{"type":"/credential/AddCredential","value":{"hash":"c46532aa8d83a453ab0cfc4c247c3f75c1d7a9724bf3db034c9ddca5cf732cc6","name":"c46532aa8d83a453ab0cfc4c247c3f75c1d7a9724bf3db034c9ddca5cf732cc6","owner":"ftsafe1d3wjggvjhf79q72m92qyaddh0fhjhjvpyzcwgy","path":"url is null","time":"1594706001510"}}]}';
    const json = JSON.parse(jsonStr);
    json["account_number"] = "12";
    json["sequence"] = "4";

    let jj = sortObject(json);
    let ss = JSON.stringify(jj);

    let signature = cosmos.crypto.signJson(sortObject(json), keys.privateKey);
    let verify = cosmos.crypto.verifyJson(sortObject(json), signature, keys.publicKey);

    if (!verify) {
        throw 'Cant verify signature';
    }

    let b64PubKey = Buffer.from(keys.publicKey).toString('base64');
    let b64Signature = Buffer.from(signature).toString('base64');

    json["signatures"] = [{
        "pub_key" :{
            "type": "tendermint/PubKeySecp256k1",
            "value":b64PubKey
        },
        "signature":b64Signature
    }];
    json["type"] = "cosmos-sdk/StdTx";
    json["msg"] = json["msgs"];
    delete json["msgs"];
    delete json["chain_id"];
    delete json["account_number"];
    delete json["sequence"];

    let signedTx = {"tx":json,"mode":"block"};
    


    let signedStr = JSON.stringify(sortObject(signedTx));
    console.log(signedStr);


    let key:KeyPair = {
        sk:Buffer.from(keys.privateKey).toString('hex'),
        pk:Buffer.from(keys.publicKey).toString('hex')
    }
    
   return key;
}

class JubDID {
    keyPair:KeyPair;
    constructor(Key:KeyPair){
        this.keyPair = Key;
    }

    getBech32Address():string{
       return cosmos.address.getAddress(Buffer.from(this.keyPair.pk,"hex")); 
    }

    getSubject() :string{
        return `did:jub:${this.getBech32Address()}`;
    }
}

class JubRegistry{
    url:string;
    constructor(url:string){
        this.url = url;
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