import {KeyPair , JubDID} from "./index"
const cosmos = require('@jswebfans/cosmos-lib');
import { fetchGetData } from  "./fetchUtil";

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

type AccountInfo = {
    accountNumber:string;
    sequence:string;
};

class CosmosClient {

    url:string;
    constructor(url:string){
        this.url = url;
    }

    async getAccountInfo(account:string) : Promise<AccountInfo>{
        let url = this.url + "/auth/accounts/" + account;
        let response = await fetchGetData(url);

        let info :AccountInfo = {
            accountNumber: response["result"]["value"]["account_number"].toString(),
            sequence: response["result"]["value"]["sequence"].toString()
        };

        return info;
    }

    async signRegisterTx(jubDID : JubDID) : Promise<any>{
        //step 1 : Get accountNumber,sequence from Cosmos Server
        let info = await this.getAccountInfo(jubDID.keyPair.address);
        console.log(`accountNumber : ${info.accountNumber}`);
        console.log(`sequence: ${info.sequence}`);

        //step 2 : Build unsigned registry tx
        let didRegistryStr = jubDID.getRegistryStr();
        let b64RegistryStr = Buffer.from(didRegistryStr).toString('base64');
        let unsignedTx = this.buildRigistryTx(info.accountNumber,info.sequence,b64RegistryStr,jubDID.keyPair.address);
        let signedTx = await this.signTx(jubDID.keyPair,unsignedTx);
        return signedTx;  
    }
    async signUpdateTx(jubDID : JubDID,updateKeyPair:KeyPair) : Promise<any>{
        //step 1 : Get accountNumber,sequence from Cosmos Server
        let info = await this.getAccountInfo(jubDID.keyPair.address);
        console.log(`accountNumber : ${info.accountNumber}`);
        console.log(`sequence: ${info.sequence}`);
        //step 2 : Build unsigned update tx
        let didUpdateStr = jubDID.getUpdateStr(updateKeyPair);
        let b64UpdateStr = Buffer.from(didUpdateStr).toString('base64');
        let unsignedTx = this.buildUpdateTx(info.accountNumber,info.sequence,b64UpdateStr,jubDID.keyPair.address);
        let signedTx = await this.signTx(jubDID.keyPair,unsignedTx);
        return signedTx;  
    }

    async signDeactivateTx(jubDID : JubDID) : Promise<any>{
        //step 1 : Get accountNumber,sequence from Cosmos Server
        let info = await this.getAccountInfo(jubDID.keyPair.address);
        console.log(`accountNumber : ${info.accountNumber}`);
        console.log(`sequence: ${info.sequence}`);
        //step 2 : Build unsigned deactive tx
        let unsignedTx = this.buildDeactivateTx(info.accountNumber,info.sequence,jubDID.keyPair.address);
        let signedTx = await this.signTx(jubDID.keyPair,unsignedTx);
        return signedTx;  
    }

    buildRigistryTx(accountNumber:string,sequence:string,didRegistry:string,actor:string):any{
        const msgRigistry = {"type":"did/AddAttribute","value":{"type":"jubiterDID","value":"","actor":""}};
        msgRigistry["value"]["value"] = didRegistry;
        msgRigistry["value"]["actor"] = actor;
        return this.buildMsg(accountNumber,sequence,[msgRigistry]);;
    }

    buildUpdateTx(accountNumber:string,sequence:string,didUpdate:string,actor:string):any{
        const msgUpdate = {"type":"did/UpdateAttribute","value":{"type":"jubiterDID","value":"","actor":""}};
        msgUpdate["value"]["value"] = didUpdate;
        msgUpdate["value"]["actor"] = actor;
        return this.buildMsg(accountNumber,sequence,[msgUpdate]);
    }

    buildDeactivateTx(accountNumber:string,sequence:string,actor:string):any{
        const msgDeactive = {"type":"did/DeleteAttribute","value":{"type":"jubiterDID","actor":""}};
        msgDeactive["value"]["actor"] = actor;
        return this.buildMsg(accountNumber,sequence,[msgDeactive]);
    }
    private buildMsg(accountNumber: string, sequence: string, msgs: any): any{
        const baseTxStr:string = '{"chain_id":"Jubiter-did","fee":{"amount":[],"gas":"200000"},"memo":"","msgs":[]}';
        const json = JSON.parse(baseTxStr);
        json["account_number"] = accountNumber;
        json["sequence"] = sequence;
        json["msgs"] = msgs;
        return json;
    }
    async signTx(keyPair: KeyPair, unsingedTx: any): Promise<string>{
        
        let signature = cosmos.crypto.signJson(sortObject(unsingedTx), Buffer.from(keyPair.sk,'hex'));
        let verify = cosmos.crypto.verifyJson(sortObject(unsingedTx), signature, Buffer.from(keyPair.pk,"hex"));
    
        if (!verify) {
            throw 'Cant verify signature';
        }
    
        let b64PubKey = Buffer.from(keyPair.pk,'hex').toString('base64');
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