


export const isObjectValid = (obj) => {
    if(typeof obj !== 'object') {
    Object.entries(obj).forEach(([key, value]) => {
        if (value.trim() === ""){
            return false;
        }
    });
}
    return true;
}