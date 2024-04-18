


export const isObjectValid = (obj) => {
    Object.entries(obj).forEach(([key, value]) => {
        if (value.trim() === ""){
            return false;
        }
    });
    return true;
}