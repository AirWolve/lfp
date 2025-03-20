const buildType = process.env.REACT_APP_BUILD_TYPE;
const branch = process.env.REACT_APP_BRANCH;
// test 빌드인 경우 브랜치 이름을 basename으로 사용, 그렇지 않으면 기본 '/'
const basename = buildType === 'test' && branch ? `${branch}` : "";
export default basename;