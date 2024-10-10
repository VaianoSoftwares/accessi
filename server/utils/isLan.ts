const LAN = [
  [0x0a000000, 0xff000000], // 10.0.0.0/8
  [0x64400000, 0xffc00000], // 100.64.0.0/10
  [0x7f000000, 0xff000000], // 127.0.0.0/8
  [0xa9fe0000, 0xffff0000], // 169.254.0.0/16
  [0xac100000, 0xfff00000], // 172.16.0.0/12
  [0xc0a80000, 0xffff0000], // 192.168.0.0/16
];

const OTHERS_LAN = ["localhost", "::1"];
const IPV6_LAN_PREFIX = "::ffff:";

function belongsToSubnet(host: string, list: number[][]) {
  const ipTokens = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!ipTokens) return false;

  const ipNum =
    0x1000000 * Number.parseInt(ipTokens[1]) +
    0x10000 * Number.parseInt(ipTokens[2]) +
    0x100 * Number.parseInt(ipTokens[3]) +
    Number.parseInt(ipTokens[4]);

  if (ipNum < list[0][0]) return false;

  // Binary search
  let x = 0,
    y = list.length;
  while (y - x > 1) {
    const middle = Math.floor((x + y) / 2);
    if (list[middle][0] < ipNum) x = middle;
    else y = middle;
  }

  // Match
  const masked = ipNum & list[x][1];
  return (masked ^ list[x][0]) == 0;
}

export default function isLan(host: string) {
  if (OTHERS_LAN.includes(host)) return true;
  const trimmedHost = host.startsWith(IPV6_LAN_PREFIX)
    ? host.substring(IPV6_LAN_PREFIX.length)
    : host;
  return belongsToSubnet(trimmedHost, LAN);
}
