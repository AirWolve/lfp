import sys
import json
import Scenario
import os
import yaml

def main():
    try:
        # stdin에서 입력 받기
        input_str = sys.stdin.read()
        data = json.loads(input_str)
        userEmail = data.get('userEmail')
        scenarioData = data.get('scenarioData')
        if not userEmail or not scenarioData:
            print(json.dumps({"error": "userEmail and scenarioData are both required."}))
            sys.exit(1)

        # scenarioData가 string이면 YAML로 파싱
        if isinstance(scenarioData, str):
            scenarioData = yaml.safe_load(scenarioData)

        # Scenario 객체 생성
        scenario = Scenario.Scenario(scenarioData)
        # 사용자별 디렉토리 생성
        user_dir = os.path.join(os.path.dirname(__file__), 'scenario', userEmail)
        os.makedirs(user_dir, exist_ok=True)
        # 파일명 생성
        file_name = f"{userEmail}-{scenarioData['name']}.yaml"
        file_path = os.path.join(user_dir, file_name)
        # YAML로 저장
        Scenario.exportYAML(scenario)
        # 실제 저장 경로 반환
        print(json.dumps({"filePath": os.path.abspath(file_path)}))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
