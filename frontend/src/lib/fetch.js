import "whatwg-fetch";

const data = {};
const etags = {};

const eTagFetch = (url = null, options = { headers: {} }) => {
    /* eslint no-param-reassign:0 */
    url = url ? url : options.url
    if (options.method === 'GET' || !options.method) {
        const etag = etags[url]
        const cachedResponse = data[`${url}${etag}`] // ensure etag is for url
        if (etag) {
            options.headers['If-None-Match'] = etag
        }

        return fetch(url, options)
            .then((response) => {
                if (response.status === 304) {
                    return cachedResponse.clone()
                }

                if (response.status === 200) {
                    const responseEtag = response.headers.get('Etag')

                    if (responseEtag) {
                        data[`${url}${responseEtag}`] = response.clone()
                        etags[url] = responseEtag
                    }
                }

                return response
            })

    }
    // all other requests go straight to fetch
    // can't use apply(undefined, arguments) as babel uses _arguments which is different..
    return fetch.call(undefined, url, options)
};

const myFetch = (url, opts) => {
    return eTagFetch(url, opts).then(resp => resp.json()
        .then((data)=> {
            if (resp.status >= 200 && resp.status < 300) {
                return data;
            } else {
                return Promise.reject(data);
            }
        }));
};


export default myFetch;