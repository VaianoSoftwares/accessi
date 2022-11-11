export default (
    () =>
    <T>(key: PropertyKey, obj: T): key is keyof T => key in obj
)();