// eslint-disable-next-line import/no-anonymous-default-export
export default <T extends object>(array: T[], elem: T, predicate: (x: T) => boolean) => {
    const elemIndex = array.findIndex(predicate);
    if(elemIndex < 0) return array;
    
    let arrayCopy = array;
    arrayCopy.splice(elemIndex, 1);
    return arrayCopy;
};