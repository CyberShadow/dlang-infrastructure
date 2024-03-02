// Improved the script from this blog https://www.grahn.io/posts/2020-02-08-s3-vs-b2-static-web-hosting/
// Backblaze Url
const baseURL = BACKBLAZE_BASE_URL

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event))
})

async function handleRequest(event) {
  // only allow get requests
  if (event.request.method !== 'GET') {
    return new Response('Method not allowed', {
        status: 405,
        headers: { 'allow': 'GET' }
    })
  }
  // return a cached response if we have one
  const cache = caches.default
  let cachedResponse = await cache.match(event.request)
  if (cachedResponse) {
    return cachedResponse
  }

  const headers = event.request.headers
  const parsedUrl = new URL(event.request.url)
  let path = parsedUrl.pathname
  const lastSegment = path.substring(path.lastIndexOf('/'))
  // insert index page when path has a trailing slash
  if (path.endsWith('/')) {
    path += 'index.html'
  }

  // fetch content from B2
  const response = await b2Fetch(path, headers)
  // all is well, return the response
  if (response.status < 400) {
    // cache the response, does not block/await.
    if (response.status != 206) {
      event.waitUntil(cache.put(event.request, response.clone()))
    }
    return response
  }
  else if (response.status == 404 && !lastSegment.endsWith('/')) {
    // file doesn't exist, check if it's really a folder
    const fallback = await b2Fetch(path + '/index.html', headers)
    if (fallback.status < 400) {
      // Don't return found content, instead redirect
      return Response.redirect('https://' + parsedUrl.hostname + path + '/', 301)
    }
  }
  if (response.status > 399) {
    // return minimal error page
    return new Response(response.statusText, { status: response.status })
  }
}

async function b2Fetch(path, headers) {
  const b2Response = await fetch(`${baseURL}${path}`, { headers })
  return new Response(b2Response.body, { ...b2Response })
}
