import { SimpleSigner } from "did-jwt";
import { createVerifiableCredentialJwt } from 'did-jwt-vc';
import { CosmosClient } from "./CosmosTx";
import { fetchPostData } from "./fetchUtil";
import { JubDID, KeyPair } from "./JubDID";
import { JBX } from "./jbx";

export class JubRegistry {
    url: string;
    client: CosmosClient;
    constructor(url: string, cosmosUrl: string) {
        this.url = url;
        this.client = new CosmosClient(cosmosUrl);
    }

    // create jubdid through Registry
    async registry(did: JubDID): Promise<string> {
        // setp 1 : sign a registry cosmos tx
        // const tx = await this.client.addAttrTx(did, "jubiterDID", did.getRegistryStr());
        // // setp 2 : use signedTx as data and post to registry
        // const data = this.buildPostData("register", tx, did)
        // const url = this.url + "/1.0/register?driverId=driver-universalregistrar%2Fdriver-did-jub";
        // const response = await fetchPostData(url, data);
        // return response;
        // setp 1 : sign a registry cosmos tx
        let signedTx = await this.client.signRegisterTx(did);
        //setp 2 : use signedTx as data and post to registry
        let data = this.buildPostData("register",signedTx, did)
        let url = this.url + "/1.0/register?driverId=driver-universalregistrar%2Fdriver-did-jub";
        let response = await fetchPostData(url,data);
        return response;
    }
    // update jubdid through Registry
    async update(did: JubDID, updateKeyPair: KeyPair): Promise<Number> {
        // setp 1 : sign a registry cosmos tx
        const tx = await this.client.updateAttrTx(did, "jubiterDID", did.getUpdateStr(did.keyPair));
        // setp 2 : use signedTx as data and post to registry
        const data = this.buildPostData("update", tx, did)
        const url = this.url + "/1.0/update?driverId=driver-universalregistrar%2Fdriver-did-jub";
        const response = await fetchPostData(url, data);
        return response;
    }
    // deactivate jubdid through Registry
    async deactivate(did: JubDID): Promise<Number> {
        // setp 1 : sign a registry cosmos tx
        const tx = await this.client.deleteAttrTx(did, "jubiterDID");
        // setp 2 : use signedTx as data and post to deactivate
        const data = this.buildPostData("deactivate", tx, did)
        const url = this.url + "/1.0/deactivate?driverId=driver-universalregistrar%2Fdriver-did-jub";
        const response = await fetchPostData(url, data);
        return response;
    }

    async signvc(did: JubDID): Promise<any> {
        // get vc payload
        //TODO  GET Schemo 
        const vc = did.getVcPayload();
        
        // show msg on key
        // const student = vc.sub as string;
        // const vcType = (vc.vc.type as string[])[0];
        // const jbx = new JBX()
        // await jbx.open();
        // await jbx.authorize(Buffer.from(vcType).toString('hex'), student);
        // const resp = await jbx.authorize("0202020202020202020202020202020202020202020202020202020202020202", "hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh");
        // sign payload
        const signer = SimpleSigner(did.keyPair.sk);
        // const vcJwt = await createVerifiableCredentialJwt(vc, { did: did.getSubject(), signer });
        const vcJwt = await createVerifiableCredentialJwt(vc, { signer: signer, alg: 'ES256K',did: did.getSubject() });
        // on-chain
        // const key = "jubiter#vc#" + vc.vc.type + vc.sub;
        // const tx = await this.client.addAttrTx(did, key, vcJwt);

        // setp 2 : use signedTx as data and post to register
        // shoud't put credential on chain
        // const data = this.buildPostData("register", tx, did)
        // const url = this.url + "/1.0/register?driverId=driver-universalregistrar%2Fdriver-did-jub";
        // const response = await fetchPostData(url, data);
        // return response;
        return new Promise((resolve, reject) => {
            resolve(vcJwt);
        });
    }

    private buildPostData(operateType: string, signedTx: any, did: JubDID): any {
        const data = { "options": { "operateType": "", "txMsg": "", "identifier": "" } };
        if (operateType === "register" || operateType === "update" || operateType === "deactivate") {
            data.options.operateType = operateType;
        } else {
            data.options.operateType = "";
        }
        data.options.txMsg = signedTx;
        data.options.identifier = did.getSubject();
        return data;
    }
}
