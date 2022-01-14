// eslint-disable-next-line import/no-anonymous-default-export
export default <T extends unknown>(array: T[], elem: T) => array.filter((x) => x !== elem);