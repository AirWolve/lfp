const buildType = process.env.REACT_APP_BUILD_TYPE;
const branch = process.env.REACT_APP_BRANCH;
// test 빌드인 경우 브랜치 이름을 basename으로 사용, 그렇지 않으면 기본 '/'
const basename = buildType === 'test' && branch ? `${branch}` : "";
const baseDir = buildType === 'test' ? '#/' : '/';

export const constPath = {
    home: baseDir,
    signUp: `${baseDir}SignUp`,
    signIn: `${baseDir}SignIn`,
    trialForGuest: `${baseDir}TrialForGuest`,
};

export const RouterType = buildType === 'test' ? HashRouter : BrowserRouter;

const config = { basename, constPath, RouterType };

export default config;