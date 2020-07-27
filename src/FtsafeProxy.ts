import { fetchPostData } from  "./fetchUtil";

class FtsafeProxy {
    url:string;
    constructor(url:string){
        this.url = url;
    }

    async createAccount(address:string,pubKey:string) : Promise<any>{
        let url = this.url + "/1.0/register?driverId=driver-universalregistrar%2Fdriver-did-jub";
        let data = {
            "options":{
                "operateType":"create",
                "pubKey" : pubKey,
                "address": address
            }
        };
        return fetchPostData(url,data);
    } 

}

export {FtsafeProxy};