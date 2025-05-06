import React, { useRef, useState } from "react";
import '../css/FileImport.css';
import deleteIcon from '../assets/delete.svg';
import { ReactComponent as UploadIcon } from '../assets/upload.svg';
import { toast } from 'react-toastify';
import yaml from 'yaml';
import { useNavigate } from 'react-router-dom';

/* 
    Import the scenario from the YAML file
    Use the handleOnChange to handle the file change
    Use the onChooseFile to choose the file
    Use the removeFile to remove the file
*/

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
            // Check if the file is a YAML file
            if (!file.name.toLowerCase().endsWith('.yaml')) {
                toast.error('Only .yaml files can be uploaded.');
                if (importRef.current) {
                    importRef.current.value = "";
                }
                return;
            }
            // Read the file
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    // Parse the file
                    const content = e.target.result;
                    const parsed = yaml.parse(content);
                    // Check if all required fields are present
                    const hasAllFields = REQUIRED_FIELDS.every(field => field in parsed);
                    if (!hasAllFields) {
                        toast.error('Invalid scenario YAML structure.');
                        if (importRef.current) importRef.current.value = "";
                        return;
                    }
                    // Set the basic information
                    const basicInfo = {
                        name: parsed.name,
                        maritalStatus: parsed.maritalStatus,
                        birthYears: parsed.birthYears,
                        lifeExpectancy: parsed.lifeExpectancy,
                    };
                    localStorage.setItem("basicInfo", JSON.stringify(basicInfo));
                    // Set the investment types
                    if (parsed.investmentTypes)
                        localStorage.setItem("InvestmentTypes", JSON.stringify(parsed.investmentTypes));
                    // Set the investments
                    if (parsed.investments)
                        localStorage.setItem("Investments", JSON.stringify(parsed.investments));
                    // Set the event series
                    if (parsed.eventSeries)
                        localStorage.setItem("EventSeries", JSON.stringify(parsed.eventSeries));
                    // Set the scenario data
                    localStorage.setItem("ScenarioData", JSON.stringify(parsed));
                    localStorage.setItem("BasicSettings", JSON.stringify(parsed));
                    setSelectedFile(file);
                    toast.success('YAML import and data reflection completed!');
                    setTimeout(() => {
                        navigate('/basicsetting');
                    }, 700);
                } catch (err) {
                    toast.error('Failed to parse YAML or structure error');
                    console.error(err);
                    if (importRef.current) importRef.current.value = "";
                }
            };
            reader.readAsText(file);
        }
    };

    const onChooseFile = () => {
        // Click the file input
        importRef.current.click();
    };

    const removeFile = () => {
        // Remove the file
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
                // Show the uploaded file
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

