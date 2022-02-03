import { config } from "./configs/MainGameConfig";

export function ServerRequest(name: string, data: any = {}, method: string = "GET") {

    let headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }

    const url = `${config.APIEndPoint}${name}`;

    let params = {
        method: method,
        headers: headers,
        body: data
    }

    if (method === "GET") delete params.body;
    
    return new Promise<void>((resolve, reject) => {
        fetch(url, params)
            .then((response) => {
                return response.json();
            })
            .then(data => {
                console.log(data);
                resolve(data);
            })
            .catch(function (error) {
                console.log(error);
                reject(null);
            });
    })
}
