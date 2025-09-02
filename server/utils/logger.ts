const red = "\x1b[31m";
const yellow = "\x1b[33m";
const reset = "\x1b[0m";

export function setupGlobalLogger() {
  if (process.env.NODE_ENV != "development") return;

  process.on("uncaughtException", (err: unknown) => {
    console.error(`${red}Uncaught error:${reset}`);
    if (err instanceof Error) {
      console.error(`${yellow}Message:${reset}`, err.message);
      console.error(`${yellow}Stack trace:${reset}`, err.stack);
    } else {
      console.error(`${yellow}Non standard thrown object:${reset}`, err);
    }
  });

  process.on(
    "unhandledRejection",
    (reason: unknown, promise: Promise<unknown>) => {
      console.error(`${red}Refused unhandled promise:${reset}`);
      if (reason instanceof Error) {
        console.error(`${yellow}Message:${reset}`, reason.message);
        console.error(`${yellow}Stack trace:${reset}`, reason.stack);
      } else {
        console.error(`${yellow}Non standard thrown object:${reset}`, reason);
      }
    }
  );
}
