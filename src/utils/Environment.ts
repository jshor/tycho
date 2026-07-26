interface EnvironmentEntry {
  host: RegExp
  cdn: string
}

const environments: EnvironmentEntry[] = [
  {
    host: /^localhost(:[0-9]+)?$/i,
    cdn: 'http://localhost:3000'
  },
  {
    host: /^(www\.)?tycho\.io$/i,
    cdn: 'https://cdn.tycho.io'
  }
]

export const env = (path: string): string => {
  const windowHost = window.location.host

  environments.forEach(({ host, cdn }) => {
    if (windowHost.match(host)) {
      // path = `${cdn}${path}`; // TODO: fix CloudFront CORS issue
    }
  })

  return path
}
