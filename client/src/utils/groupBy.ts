export default function groupBy<K, V, I>(list: Array<I>, keyGetter: (input: I) => K, valueGetter: (input: I) => V) {
    const map = new Map<K, Array<V>>();
    list.forEach((item) => {
         const key = keyGetter(item);
         const value = valueGetter(item);
         const collection = map.get(key);
         if (!collection) {
             map.set(key, [value]);
         } else {
             collection.push(value);
         }
    });
    return map;
}