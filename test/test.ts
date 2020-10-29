debugger;

import { JubDID, KeyPair, JubRegistry, JubResolver, createHDKeyPair,generateRandomMnemonic ,verifyCredential} from '../src/index';
import { FtsafeProxy } from '../src/FtsafeProxy';

var response: any;
const FTURL = "http://39.102.40.227/registrar";
const REGURL = "http://39.102.40.227/registrar";
const COSMOSURL = "http://39.102.40.227/blockchain";
const RESOLVEURL = "http://39.102.40.227/resolver";
const FTSAFE_PROXY  = new FtsafeProxy(FTURL);
const REGISTRY  = new JubRegistry(REGURL,COSMOSURL);
const RESOLVER = new JubResolver(RESOLVEURL);

// Create Key Pair
// console.log("generateRandomMnemonic:"+generateRandomMnemonic(128));
const MNEMONIC = "mind crop lazy bid wing eager wash mountain trick galaxy earth broken";
const KEY_DEFAULT: KeyPair = createHDKeyPair(MNEMONIC, '44\'/118\'/0\'/0/0');
console.log("default key [address]: "+KEY_DEFAULT.address);
console.log("default key [pk_bech32]: "+KEY_DEFAULT.pk_bech32);
const JUB_DID = new JubDID(KEY_DEFAULT);

{
    // createAccount();
    // registryDID();
    // resolveDID();
    // signJWT();
    // verifyJWT();
}
// Use ftsafe proxy to create a new cosmos account
async function createAccount() {
    response = await FTSAFE_PROXY.createAccount(KEY_DEFAULT.address, KEY_DEFAULT.pk_bech32);
    console.log("createAccount:"+JSON.stringify(response));
};
// Use DID registry to regist a DID
async function registryDID() {
    response = await REGISTRY.registry(JUB_DID);
    console.log("registryDID:"+JSON.stringify(response));
};
// resolve DID
async function resolveDID() {
    const oldDocument = await RESOLVER.resolve(JUB_DID.getSubject());
    console.log("resolveDID:"+JSON.stringify(oldDocument));
};
// sign JWT
async function signJWT() {
    const signedVC = await REGISTRY.signvc(JUB_DID);
    console.log("signJWT:"+signedVC);
};
// verify JWT
async function verifyJWT() {
    const signedVC = await REGISTRY.signvc(JUB_DID)
    const verifyJWTInfo = await verifyCredential(signedVC, RESOLVER);
    console.log("verifyJWT:"+JSON.stringify(verifyJWTInfo));
};
//  update DID
async function updateDID() {
    const mnemonic = generateRandomMnemonic(128);
    console.log("updateDID[mnemonic]: "+ mnemonic);
    let updateKeyPair: KeyPair = createHDKeyPair(mnemonic, '44\'/118\'/0\'/0/1');
    console.log("updateKeyPair[address]: "+updateKeyPair.address);
    console.log("updateKeyPair[pk_bech32]: "+updateKeyPair.pk_bech32);
    response = await REGISTRY.update(JUB_DID, updateKeyPair);
    console.log("updateDID"+JSON.stringify(response));
    var newDocument = await RESOLVER.resolve(JUB_DID.getSubject());
    console.log("newDocument:"+JSON.stringify(newDocument));
};
// // deactivate DID
async function deactivateDID() {
    response = await REGISTRY.deactivate(JUB_DID);
    console.log("deactivateDID response"+JSON.stringify(response));
    const deactivateDocument = await RESOLVER.resolve(JUB_DID.getSubject());
    console.log("deactivateDID :"+JSON.stringify(deactivateDocument));
};