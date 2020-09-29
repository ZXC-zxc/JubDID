import {fetchGetData} from "./fetchUtil"

export class JubResolver{
    url:string;
    constructor(url:string){
        this.url = url;
    }

    async resolve(didSubject:string):Promise<string>{
        const url = this.url + "/1.0/identifiers/" + didSubject;
        return fetchGetData(url);
    }
}
