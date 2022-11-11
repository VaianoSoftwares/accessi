export default function errCheck(error: unknown, msg?: string) {
    if(error instanceof Error) {
        console.error(msg, error.name, error.message, error.stack);
        return { error: error.message };
    }
    else if(typeof error === "string") {
        console.error(msg, error);
        return { error };
    }
    else {
        console.error(msg, error);
        return { error: error as string };
    }
}