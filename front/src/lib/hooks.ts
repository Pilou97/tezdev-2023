import { useEffect } from "react";

const defaultOptions = {
    rpc: "https://rpc.tzkt.io/mainnet/monitor/heads/main"
};

/**
 * Execute the given callback on each new tezos block.
 * @param callback 
 */
const useBlock = (callback: any, options?: { rpc: String | undefined }) => {
    let rpc = options ? options.rpc ? defaultOptions.rpc : defaultOptions.rpc : defaultOptions.rpc;

    useEffect(() => {
        // start fetching
        const controller = new AbortController();
        const signal = controller.signal;
        fetch(rpc, { signal })
            .then(res => {
                if (res.body) {
                    return res.body
                }
                throw "Body is null";
            })
            .then(async body => {
                const reader = body.getReader();
                while (true) {
                    const { done } = await reader.read();
                    if (done) break;
                    callback();
                }
            })
        return () => {
            controller.abort();
        }
    }, [])
}

export { useBlock }