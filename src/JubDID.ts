import * as elliptic from "elliptic";
import { JwtCredentialPayload, createVerifiableCredentialJwt } from 'did-jwt-vc';
import { CosmosClient } from "./CosmosTx";
import { fetchGetData, fetchPostData } from "./fetchUtil";
const cosmos = require('@jswebfans/cosmos-lib');

export type KeyPair = {
    sk: string,
    pk: string,
    address: string,
    pk_bech32: string,
};


export function createHDKeyPair(Mnemoic: string, Path: string): KeyPair {
    const keys = cosmos.crypto.getKeysFromMnemonic(Mnemoic, Path);
    const key: KeyPair = {
        sk: Buffer.from(keys.privateKey).toString('hex'),
        pk: Buffer.from(keys.publicKey).toString('hex'),
        address: cosmos.address.getAddress(Buffer.from(keys.publicKey, "hex")),
        pk_bech32:cosmos.publicKey.getPublicKey(Buffer.from(keys.publicKey,"hex")),
    }

    return key;
}

export class JubDID {
    keyPair: KeyPair;
    constructor(Key: KeyPair) {
        this.keyPair = Key;
    }

    getSubject(): string {
        return `did:jub:${this.keyPair.address}`;
    }

    getRegistryStr(): string {
        const subject = this.getSubject();
        const json: any = {
            "authentication": [
                {
                    "type": "Secp256k1SignatureAuthentication2018",
                    "publicKey": [
                        subject + "#key-1"
                    ]
                }
            ],
            "publicKey": [
                {
                    "id": subject + "#key-1",
                    "type": "Secp256k1VerificationKey2018",
                    "publicKeyHex": this.keyPair.pk
                }
            ]
        };

        return JSON.stringify(json);
    }
    getUpdateStr(newKeyPair: KeyPair): string {
        const subject = `did:jub:${newKeyPair.address}`;
        const json: any = {
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
                    "publicKeyHex": newKeyPair.pk
                }
            ]
        };

        return JSON.stringify(json);
    }

    getVcPayload(): JwtCredentialPayload {
        const payload: JwtCredentialPayload = {
            sub: this.getSubject(),
            nbf: 1562950282,
            vc: {
                '@context': ['https://www.w3.org/2018/credentials/v1'],
                type: ['VerifiableCredential'],
                credentialSubject: {
                    degree: {
                        type: 'BachelorDegree',
                        name: 'Baccalauréat en musiques numériques'
                    }
                }
            }
        };

        return payload
    }
}