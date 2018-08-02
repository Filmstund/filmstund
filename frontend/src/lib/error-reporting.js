import Rollbar from 'rollbar';

const isProduction = window.location.href.indexOf("sefilm.bio") !== -1;

const rollbarConfig = {
    accessToken: process.env.REACT_APP_ROLLBAR_ACCESS_TOKEN,
    captureUncaught: true,
    captureUnhandledRejections: true,
    enabled: isProduction,
    payload: {
        environment: isProduction ? "production" : "development"
    }
};


export const rollbar = new Rollbar(rollbarConfig);