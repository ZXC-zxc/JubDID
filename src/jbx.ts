const WebSocket = require('ws');
const LOCAL_JBX_SERVER: string = "ws://localhost:9003";

interface JbxResponse<T> {
    id: number,
    code: number,
    message: string,
    data?: T,
}

export class JBX {
    url: string;
    counter: () => number;
    promisePool: { [key: number]: any };
    _websocket!: WebSocket;

    constructor(url?: string) {
        this.url = url || LOCAL_JBX_SERVER;

        // 计数器，处理req、resp的id用
        this.counter = ((count: number) => () => {
            // 留两个给设备插入、拔除用
            count %= 0xFFFE;
            count += 1;
            return count;
        })(0);
        // promise池
        this.promisePool = {};
    }

    async open(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (typeof this._websocket === 'undefined') {
                this._websocket = new WebSocket(this.url);
                this._websocket.onopen = (e) => resolve();
                this._websocket.onerror = (e) => {
                    reject(e);
                };
            }
            this._websocket.onmessage = (evt) => {
                try {
                    const resp = JSON.parse(evt.data);
                    const key = resp.id as number;
                    const code = resp.code;
                    const req = this.promisePool[key];
                    if (code === 0) {
                        if ("data" in resp) {
                            req.resolve(resp.data);
                        } else {
                            req.resolve();
                        }
                    } else {
                        req.reject(resp);
                    }
                    if (key !== 0xFFFF && key !== 0xFFFE) {
                        delete this.promisePool[key];
                    }
                } catch (e) {
                    reject(e);
                }
            };
        });
    }

    close() {
        this._websocket.close();
    }
    // token包含在content中
    async send(cmd: string, param: any): Promise<any> {
        return new Promise((resolve, reject) => {
            const key = this.counter();
            this.promisePool[key] = {
                resolve,
                reject
            };
            const req = JSON.stringify({
                "id": key,
                "op": cmd,
                "param": param
            });
            try {
                this._websocket.send(req);
            } catch(e) {
                delete this.promisePool[key];
                reject(e);
            }
        });
    }

    // 获取序列号
    async getSerialNumber(): Promise<string> {
        return this.send("getSerialNumber", {});
    }

    // 授权
    async authorize(hash: string, address: string): Promise<void> {
        return this.send("authorize", {
            "hash": hash,
            "address": address
        });
    }

    // 声明
    async statement(hash: string, address: string): Promise<void> {
        return this.send("statement", {
            hash,
            address
        });
    }
}
