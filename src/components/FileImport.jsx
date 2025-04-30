import React, { useRef, useState } from "react";
import './FileImport.css';
import deleteIcon from '../assets/delete.svg';
import uploadIcon from '../assets/upload.svg';

const FileImport = () => {
    const importFef = useRef();
    const [selectedFile, setSelectedFile] = useState(null);
    
    const handleOnChange = (event) => {
        if (event.target.files && event.target.files.length > 0) {
            setSelectedFile(event.target.files[0]);
        }
    };

    const onChooseFile = () => {
        importFef.current.click();
    };

    const removeFile = () => {
        setSelectedFile(null);
    }

    return (
        <div className="ImportContainer">
            <input type="file" ref={importFef} onChange={handleOnChange} style={{ display: "none" }} />
            <button className="fileButton" onClick={onChooseFile}>
                <img alt="upload" src={uploadIcon} style={{ width: "1em", height: "1em", verticalAlign: "middle"}}/> Upload File
            </button>

            {selectedFile && <div className="selectFile">
                <p>{selectedFile.name}</p>

                <button onClick={removeFile}>
                    <img alt="delete" src={deleteIcon} style={{ width: "1em", height: "1em", verticalAlign: "middle"}}/>
                </button>
            </div>}
        </div>
    );
}

export default FileImport;

