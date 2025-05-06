import React, { useRef, useState } from "react";
import '../css/FileImport.css';
import deleteIcon from '../assets/delete.svg';
import { ReactComponent as UploadIcon } from '../assets/upload.svg';
import { toast } from 'react-toastify';
import yaml from 'yaml';

// Required fields for state tax YAML
const REQUIRED_TAX_FIELDS = [
  'name', 'socialsecurity', 'year', 'individual', 'couple'
];

const TaxFileImport = () => {
    const importRef = useRef();
    const [selectedFile, setSelectedFile] = useState(null);
    
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
                    const hasAllFields = REQUIRED_TAX_FIELDS.every(field => field in parsed);
                    if (!hasAllFields) {
                        toast.error('Invalid state tax YAML structure. Required fields: name, socialsecurity, year, individual, couple.');
                        if (importRef.current) importRef.current.value = "";
                        return;
                    }
                    // Optionally, further validate the structure of 'individual' and 'couple' fields
                    if (typeof parsed.individual !== 'object' || typeof parsed.couple !== 'object') {
                        toast.error('The fields "individual" and "couple" must be objects with tax brackets.');
                        if (importRef.current) importRef.current.value = "";
                        return;
                    }
                    // Save the tax file content to localStorage
                    localStorage.setItem("StateTaxFile", JSON.stringify(parsed));
                    setSelectedFile(file);
                    toast.success('State tax YAML import and data reflection completed!');
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
        localStorage.removeItem("StateTaxFile");
    }

    return (
        <div className="ImportContainer">
            <input type="file" ref={importRef} onChange={handleOnChange} style={{ display: "none" }} />
            <div className="upload-area" onClick={onChooseFile}>
                <div className="upload-icon">
                    <UploadIcon style={{ width: 32, height: 32, fill: "#7c3aed" }} />
                </div>
                <div className="upload-label">Upload State Tax File</div>
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

export default TaxFileImport; 