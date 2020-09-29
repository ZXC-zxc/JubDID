import { fetchGetData } from "./fetchUtil"
import {Resolvable} from "did-jwt"

export class JubResolver implements Resolvable{
    url:string;
    constructor(url:string){
        this.url = url;
    }

    async resolve(didSubject:string):Promise <any>{
        const url = this.url + "/1.0/identifiers/" + didSubject;
        return new Promise((resolve, reject) => {
            fetchGetData(url).then(function (ret) {
                    return resolve(ret.didDocument);
                }).catch(function (error) {
                    return reject(error);
                });
            }); 
    }
}
