import React, { useRef, useState } from "react";
import './FileImport.css';
import deleteIcon from '../assets/delete.svg';
import uploadIcon from '../assets/upload.svg';

const FileImport = () => {
    const importRef = useRef();
    const [selectedFile, setSelectedFile] = useState(null);
    
    const handleOnChange = (event) => {
        if (event.target.files && event.target.files.length > 0) {
            setSelectedFile(event.target.files[0]);
        }
    };

    const onChooseFile = () => {
        importRef.current.click();
    };

    const removeFile = () => {
        setSelectedFile(null);
    }

    return (
        <div className="ImportContainer">
            <input type="file" ref={importRef} onChange={handleOnChange} style={{ display: "none" }} />
            <div className="upload-area" onClick={onChooseFile}>
                <div className="upload-icon">
                    <img alt="upload" src={uploadIcon} style={{ width: "32px", height: "32px" }} />
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

