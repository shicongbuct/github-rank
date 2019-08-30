export async function sleep(t:number) {
    return new Promise((resolve) => {
        setTimeout(function() {
            return resolve();
        }, t * 1000)
    });
}

