
export const calculateFileSize = (bytes:number,decimals = 2)=>{
    if(bytes === 0){
        return null;
    }

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes','KB','MB','GB']

    const i = Math.floor(Math.log(bytes)/Math.log(k))

    if(i === 0){
        return `${bytes} ${sizes[i]}`;
    }

    return `${parseFloat((bytes / Math.pow(k,i)).toFixed(dm))} ${sizes[i]}`
}

