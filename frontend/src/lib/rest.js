import "whatwg-fetch";

const backendUrl = "http://localhost:8080/api";

const checkStatusAndParseJson = (response) => {
    if (response.status >= 200 && response.status < 300) {
        return response.json();
    } else {
        const error = new Error(response.statusText);
        error.response = response;
        throw error;
    }
};

export const getJson = (path) =>
    fetch(backendUrl + path)
    .then(checkStatusAndParseJson);

export const postJson = (path, data) =>
    fetch(backendUrl + path, {
        method: 'POST',
        body: JSON.stringify(data)
    })
    .then(checkStatusAndParseJson);
