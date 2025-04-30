import React, { useRef, useState } from "react";
import '../css/FileImport.css';
import deleteIcon from '../assets/delete.svg';
import { ReactComponent as UploadIcon } from '../assets/upload.svg';
import { toast } from 'react-toastify';

const FileImport = () => {
    const importRef = useRef();
    const [selectedFile, setSelectedFile] = useState(null);
    
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
            setSelectedFile(file);
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

