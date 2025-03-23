import { BrowserRouter, HashRouter } from 'react-router-dom';

const buildType = process.env.REACT_APP_BUILD_TYPE;
const baseDir = buildType === 'test' ? '#/' : '/';

export const constPath = {
    home: baseDir,
    signUp: `${baseDir}SignUp`,
    signIn: `${baseDir}SignIn`,
    trialForGuest: `${baseDir}TrialForGuest`,
    profile: `${baseDir}Profile`,
    dashboard: `${baseDir}Dashboard`,
};

export const RouterType = buildType === 'test' ? HashRouter : BrowserRouter;

const config = { buildType, constPath, RouterType };

export default config;