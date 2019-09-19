export async function timeoutFor(ms: number): Promise<void> {
    return new Promise<void>((resolve): void => {
        setTimeout(() => {
            resolve();
        },         ms);
    });
}
