import React, { useRef, useState } from "react";
import '../css/FileImport.css';
import deleteIcon from '../assets/delete.svg';
import { ReactComponent as UploadIcon } from '../assets/upload.svg';
import { toast } from 'react-toastify';
import yaml from 'yaml';
import { useNavigate } from 'react-router-dom';

const REQUIRED_FIELDS = [
  'name', 'maritalStatus', 'birthYears', 'investmentTypes', 'investments', 'eventSeries'
];

const FileImport = () => {
    const importRef = useRef();
    const [selectedFile, setSelectedFile] = useState(null);
    const navigate = useNavigate();
    
    const handleOnChange = (event) => {
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];
            if (!file.name.toLowerCase().endsWith('.yaml')) {
                toast.error('Only .yaml files can be uploaded.');
                if (importRef.current) {
                    importRef.current.value = "";
                }
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const content = e.target.result;
                    const parsed = yaml.load(content);
                    const hasAllFields = REQUIRED_FIELDS.every(field => field in parsed);
                    if (!hasAllFields) {
                        toast.error('Invalid scenario YAML structure.');
                        if (importRef.current) importRef.current.value = "";
                        return;
                    }
                    const basicInfo = {
                        name: parsed.name,
                        maritalStatus: parsed.maritalStatus,
                        birthYears: parsed.birthYears,
                        lifeExpectancy: parsed.lifeExpectancy,
                    };
                    localStorage.setItem("basicInfo", JSON.stringify(basicInfo));
                    if (parsed.investmentTypes)
                        localStorage.setItem("InvestmentTypes", JSON.stringify(parsed.investmentTypes));
                    if (parsed.investments)
                        localStorage.setItem("Investments", JSON.stringify(parsed.investments));
                    if (parsed.eventSeries)
                        localStorage.setItem("EventSeries", JSON.stringify(parsed.eventSeries));
                    localStorage.setItem("ScenarioData", JSON.stringify(parsed));
                    localStorage.setItem("BasicSettings", JSON.stringify(parsed));
                    setSelectedFile(file);
                    toast.success('YAML import 및 데이터 반영 완료!');
                    setTimeout(() => {
                        navigate('/basicsetting');
                    }, 700);
                } catch (err) {
                    toast.error('YAML 파싱 실패 또는 구조 오류');
                    if (importRef.current) importRef.current.value = "";
                }
            };
            reader.readAsText(file);
        }
    };

    const onChooseFile = () => {
        importRef.current.click();
    };

    const removeFile = () => {
        setSelectedFile(null);
        if (importRef.current) {
            importRef.current.value = "";
        }
    }

    return (
        <div className="ImportContainer">
            <input type="file" ref={importRef} onChange={handleOnChange} style={{ display: "none" }} />
            <div className="upload-area" onClick={onChooseFile}>
                <div className="upload-icon">
                    <UploadIcon style={{ width: 32, height: 32, fill: "#7c3aed" }} />
                </div>
                <div className="upload-label">Upload File</div>
            </div>
            {selectedFile && (
                <div className="uploaded-file">
                    <span className="uploaded-file-name">{selectedFile.name}</span>
                    <button className="delete-btn" onClick={removeFile}>
                        <img alt="delete" src={deleteIcon} />
                    </button>
                </div>
            )}
        </div>
    );
}

export default FileImport;

