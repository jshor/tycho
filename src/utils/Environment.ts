const environments = [
    {
        host: /^localhost(:[0-9]+)?$/i,
        cdn: 'http://localhost:3000'
    },
    {
        host: /^(www\.)?tycho\.io$/i,
        cdn: 'https://cdn.tycho.io'
    }
]

const env = (path) => {
    const windowHost = window.location.host;

    environments.forEach(({ host, cdn }) => {
        if (windowHost.match(host)) {
            // path = `${cdn}${path}`; // TODO: fix CloudFront CORS issue
        }
    });

    return path;
};

export { env };
