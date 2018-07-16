export const isDev = false; //TRUE = DESENVOLVIMENTO, FALSE = PRODUÇÃO

export const host = isDev ? 'dev' : 'prod';
export const config = {
    firebaseConfig: {
        dev: {
            apiKey: "AIzaSyA-sQybfPBtnYdBX573Tnzuta7IA6sMqEk",
            authDomain: "pagalee-dev.firebaseapp.com",
            databaseURL: "https://pagalee-dev.firebaseio.com",
            projectId: "pagalee-dev",
            storageBucket: "pagalee-dev.appspot.com",
            messagingSenderId: "130050332013"
        },
        prod: {
            apiKey: "AIzaSyBo19pBYIuu-RkbHBUv3uRJpd34qsDEAJ0",
            authDomain: "pagalee-app.firebaseapp.com",
            databaseURL: "https://pagalee-app.firebaseio.com",
            projectId: "pagalee-app",
            storageBucket: "pagalee-app.appspot.com",
            messagingSenderId: "779366756124"
        }
    }, 
    baseUrl: {
        dev: "https://api-dev.pagalee.com/api",
        prod: "https://api-app.pagalee.com/api",
    },
    baseUrlFirabase: {
        dev: "https://api-dev.pagalee.com",
        prod: "https://api-app.pagalee.com"
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