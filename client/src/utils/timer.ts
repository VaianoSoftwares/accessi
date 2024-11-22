export function sleep(ms: number, timerInfo: { abort?: () => void } = {}) {
  return new Promise((resolve, reject) => {
    timerInfo.abort = reject;
    setTimeout(resolve, ms);
  });
}

export class Timer {
  id = -1;
  start: Promise<unknown>;
  abort = () => {};

  constructor(ms: number) {
    this.start = new Promise((resolve, reject) => {
      this.abort = () => {
        this.id = -1;
        reject();
      };
      this.id = +setTimeout(resolve, ms);
    });
  }
}
