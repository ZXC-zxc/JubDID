import { KeyPair, JubDID } from "./JubDID"
const cosmos = require('@jswebfans/cosmos-lib');
import { fetchGetData } from "./fetchUtil";

function sortObject(obj: any): any {
    if (obj === null) return null;
    if (typeof obj !== "object") return obj;
    if (Array.isArray(obj)) return obj.map(sortObject);
    const sortedKeys = Object.keys(obj).sort();
    const result: any = {};
    sortedKeys.forEach(key => {
        result[key] = sortObject(obj[key])
    });
    return result;
}

type AccountInfo = {
    address: string,
    accountNumber: string,
    sequence: string,
};

enum AttrOperation {
    OpAdd = "AddAttribute",
    OpDelete = "DeleteAttribute",
    OpUpdate = "UpdateAttribute",
}

// CosmosClient a client of cosmos server
class CosmosClient {
    url: string;

    constructor(url: string) {
        this.url = url;
    }

    async getAccountInfo(account: string): Promise<AccountInfo> {
        const url = this.url + "/auth/accounts/" + account;
        const response = await fetchGetData(url);

        const info: AccountInfo = {
            address: response.result.value.address,
            accountNumber: response.result.value.account_number.toString(),
            sequence: response.result.value.sequence.toString(),
        };

        return info;
    }

    /**
     * signedTx sign special tx msg
     */
    async signedTx(did: JubDID, op: AttrOperation, key: string, value?: any): Promise<string> {
        const account = await this.getAccountInfo(did.keyPair.address);
        const msg = this.buildAttrMsg(op, account, key, value);
        return this.signTx(did.keyPair, msg)
    }


    /**
     * addAttrTx build tx for add attribute to did
     */
    addAttrTx = async (did: JubDID, key: string, value?: any): Promise<string> => this.signedTx(did, AttrOperation.OpAdd, key, value);

    /**
     * deleteAttrTx build tx for delete attribute to did
     */
    deleteAttrTx = async (did: JubDID, key: string, value?: any): Promise<string> => this.signedTx(did, AttrOperation.OpDelete, key, value)

    /**
     * updateAttrTx build tx for update attribute to did
     */
    updateAttrTx = async (did: JubDID, key: string, value?: any): Promise<string> => this.signedTx(did, AttrOperation.OpUpdate, key, value)


    /**
     * buildAttrMsg build attribute msg for send did chain
     */
    buildAttrMsg(op: AttrOperation, account: AccountInfo, key: string, value?: any): any {
        // build operation special msg
        const opMsg = {
            "type": `did/${op}`,
            value: {
                "type": key,
                actor: account.address,
                value,
            },
        }

        // build tx msg
        const msg = {
            chain_id: "Jubiter-did",
            fee: {
                amount: [],
                gase: "200000",
            },
            memo: "",
            account_number: account.accountNumber,
            sequence: account.sequence,
            msgs: opMsg,
        }

        return msg;
    }

    /**
     * addAttrMsg build add attribute operation msg
     */
    addAttrMsg = (account: AccountInfo, key: string, value?: any): any => this.buildAttrMsg(AttrOperation.OpAdd, account, key, value);

    /**
     * updateAttrMsg build update attribute operation msg
     */
    updateAttrMsg = (account: AccountInfo, key: string, value?: any): any => this.buildAttrMsg(AttrOperation.OpUpdate, account, key, value);

    /**
     * addAttrMsg build delete attribute operation msg
     */
    deleteAttrMsg = (account: AccountInfo, key: string, value?: any): any => this.buildAttrMsg(AttrOperation.OpDelete, account, key, value);


    async signRegisterTx(jubDID: JubDID): Promise<any> {
        // step 1 : Get accountNumber,sequence from Cosmos Server
        const info = await this.getAccountInfo(jubDID.keyPair.address);

        // step 2 : Build unsigned registry tx
        const didRegistryStr = jubDID.getRegistryStr();
        const b64RegistryStr = Buffer.from(didRegistryStr).toString('base64');
        const unsignedTx = this.buildRigistryTx(info.accountNumber, info.sequence, b64RegistryStr, jubDID.keyPair.address);
        const signedTx = await this.signTx(jubDID.keyPair, unsignedTx);
        return signedTx;
    }
    async signUpdateTx(jubDID: JubDID, updateKeyPair: KeyPair): Promise<any> {
        // step 1 : Get accountNumber,sequence from Cosmos Server
        const info = await this.getAccountInfo(jubDID.keyPair.address);
        // step 2 : Build unsigned update tx
        const didUpdateStr = jubDID.getUpdateStr(updateKeyPair);
        const b64UpdateStr = Buffer.from(didUpdateStr).toString('base64');
        const unsignedTx = this.buildUpdateTx(info.accountNumber, info.sequence, b64UpdateStr, jubDID.keyPair.address);
        const signedTx = await this.signTx(jubDID.keyPair, unsignedTx);
        return signedTx;
    }

    async signDeactivateTx(jubDID: JubDID): Promise<any> {
        // step 1 : Get accountNumber,sequence from Cosmos Server
        const info = await this.getAccountInfo(jubDID.keyPair.address);
        console.log(`accountNumber : ${info.accountNumber}`);
        console.log(`sequence: ${info.sequence}`);
        // step 2 : Build unsigned deactive tx
        const unsignedTx = this.buildDeactivateTx(info.accountNumber, info.sequence, jubDID.keyPair.address);
        const signedTx = await this.signTx(jubDID.keyPair, unsignedTx);
        return signedTx;
    }

    buildRigistryTx(accountNumber: string, sequence: string, didRegistry: string, actor: string): any {
        const msgRigistry = { "type": "did/AddAttribute", "value": { "type": "jubiterDID", "value": "", "actor": "" } };
        msgRigistry.value.value = didRegistry;
        msgRigistry.value.actor = actor;
        return this.buildMsg(accountNumber, sequence, [msgRigistry]);;
    }

    buildUpdateTx(accountNumber: string, sequence: string, didUpdate: string, actor: string): any {
        const msgUpdate = { "type": "did/UpdateAttribute", "value": { "type": "jubiterDID", "value": "", "actor": "" } };
        msgUpdate.value.value = didUpdate;
        msgUpdate.value.actor = actor;
        return this.buildMsg(accountNumber, sequence, [msgUpdate]);
    }

    buildDeactivateTx(accountNumber: string, sequence: string, actor: string): any {
        const msgDeactive = { "type": "did/DeleteAttribute", "value": { "type": "jubiterDID", "actor": "" } };
        msgDeactive.value.actor = actor;
        return this.buildMsg(accountNumber, sequence, [msgDeactive]);
    }
    private buildMsg(accountNumber: string, sequence: string, msgs: any): any {
        const baseTxStr: string = '{"chain_id":"Jubiter-did","fee":{"amount":[],"gas":"200000"},"memo":"","msgs":[]}';
        const json = JSON.parse(baseTxStr);
        json.account_number = accountNumber;
        json.sequence = sequence;
        json.msgs = msgs;
        return json;
    }

    signTx(keyPair: KeyPair, unsingedTx: any): string {

        const signature = cosmos.crypto.signJson(sortObject(unsingedTx), Buffer.from(keyPair.sk, 'hex'));
        const verify = cosmos.crypto.verifyJson(sortObject(unsingedTx), signature, Buffer.from(keyPair.pk, "hex"));

        if (!verify) {
            throw new Error('Cant verify signature');
        }

        const b64PubKey = Buffer.from(keyPair.pk, 'hex').toString('base64');
        const b64Signature = Buffer.from(signature).toString('base64');

        unsingedTx.signatures = [{
            "pub_key": {
                "type": "tendermint/PubKeySecp256k1",
                "value": b64PubKey
            },
            "signature": b64Signature
        }];
        unsingedTx.type = "cosmos-sdk/StdTx";
        unsingedTx.msg = unsingedTx.msgs;
        delete unsingedTx.msgs;
        delete unsingedTx.chain_id;
        delete unsingedTx.account_number;
        delete unsingedTx.sequence;

        const signedTx = { "tx": unsingedTx, "mode": "block" };
        const signedStr = JSON.stringify(sortObject(signedTx));

        return signedStr;
    }
}

export { CosmosClient };
