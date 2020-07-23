import {KeyPair} from "./index"
const cosmos = require('@jswebfans/cosmos-lib');

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

class CosmosClient {
    keyPair:KeyPair;
    url:string;
    constructor(Key:KeyPair,url:string){
        this.keyPair = Key;
        this.url = url;
    }

    async buildRigistryTx(accountNumber:string,sequence:string ):Promise<any>{
        //need rigistry json
        const jsonStr = '{"chain_id":"Jubiter","fee":{"amount":[],"gas":"200000"},"memo":"","msgs":[{"type":"/credential/AddCredential","value":{"hash":"c46532aa8d83a453ab0cfc4c247c3f75c1d7a9724bf3db034c9ddca5cf732cc6","name":"c46532aa8d83a453ab0cfc4c247c3f75c1d7a9724bf3db034c9ddca5cf732cc6","owner":"ftsafe1d3wjggvjhf79q72m92qyaddh0fhjhjvpyzcwgy","path":"url is null","time":"1594706001510"}}]}';
        const json = JSON.parse(jsonStr);
        json["account_number"] = accountNumber;
        json["sequence"] = sequence;
        return json;
    }

    async signTx(unsingedTx:any):Promise<string>{
        let signature = cosmos.crypto.signJson(sortObject(unsingedTx), Buffer.from(this.keyPair.sk,'hex'));
        let verify = cosmos.crypto.verifyJson(sortObject(unsingedTx), signature, Buffer.from(this.keyPair.pk,"hex"));
    
        if (!verify) {
            throw 'Cant verify signature';
        }
    
        let b64PubKey = Buffer.from(this.keyPair.pk).toString('base64');
        let b64Signature = Buffer.from(signature).toString('base64');
    
        unsingedTx["signatures"] = [{
            "pub_key" :{
                "type": "tendermint/PubKeySecp256k1",
                "value":b64PubKey
            },
            "signature":b64Signature
        }];
        unsingedTx["type"] = "cosmos-sdk/StdTx";
        unsingedTx["msg"] = unsingedTx["msgs"];
        delete unsingedTx["msgs"];
        delete unsingedTx["chain_id"];
        delete unsingedTx["account_number"];
        delete unsingedTx["sequence"];
    
        let signedTx = {"tx":unsingedTx,"mode":"block"};
        let signedStr = JSON.stringify(sortObject(signedTx));
        console.log(signedStr);
        return signedStr;
    }

    async broadcastTx(tx:string):Promise<Number>{
        return 0 ;
    }

}

export {CosmosClient};