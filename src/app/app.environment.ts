export const isDev = false; //TRUE = DESENVOLVIMENTO, FALSE = PRODUÇÃO

export const host = isDev ? 'dev' : 'prod';
export const config = {
    firebaseConfig: {
        dev: {
            apiKey: "XXXXXXXXXXXXXXXXXXXXXXXXXXX",
            authDomain: "XXXXXXXXXXXXXXXXXXXXXXXXXXX",
            databaseURL: "XXXXXXXXXXXXXXXXXXXXXXXXXXX",
            projectId: "XXXXXXXXXXXXXXXXXXXXXXXXXXX",
            storageBucket: "XXXXXXXXXXXXXXXXXXXXXXXXXXX",
            messagingSenderId: "XXXXXXXXXXXXXXXXXXXXXXXXXXX"
        },
        dev: {
            apiKey: "XXXXXXXXXXXXXXXXXXXXXXXXXXX",
            authDomain: "XXXXXXXXXXXXXXXXXXXXXXXXXXX",
            databaseURL: "XXXXXXXXXXXXXXXXXXXXXXXXXXX",
            projectId: "XXXXXXXXXXXXXXXXXXXXXXXXXXX",
            storageBucket: "XXXXXXXXXXXXXXXXXXXXXXXXXXX",
            messagingSenderId: "XXXXXXXXXXXXXXXXXXXXXXXXXXX"
        }
    }, 
    baseUrl: {
        dev: "https://xxxx/api",
        prod: "https://xxxx/api",
    },
    baseUrlFirabase: {
        dev: "https://xxx",
        prod: "https://xxx"
    },
}

//################################################
//################VERSIONAMENTO###################
//################################################
export const devVersion = '1.0.43'; //DESENVOLVIMENTO
export const prodVersion = '1.0.16'; //PRODUÇÃO
//################################################
//################################################
//################################################
export const version: string = isDev ? devVersion : prodVersion;
