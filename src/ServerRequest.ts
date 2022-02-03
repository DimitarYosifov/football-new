import { config } from "./configs/MainGameConfig";

export function ServerRequest(name: string, data: any = {}, method: string = "GET") {
    const headers = {}
    const url = `${config.APIEndPoint}${name}`;
    return new Promise<void>((resolve, reject) => {
        fetch(url, {
            method: method,
            headers: headers
        })
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
