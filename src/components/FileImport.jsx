import React, { useRef, useState } from "react";
import './FileImport.css'

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
                <span class="material-symbols-rounded">upload</span> Upload File
            </button>

            {selectedFile && <div className="selectFile">
                <p>{selectedFile.name}</p>

                <button onClick={removeFile}>
                    <span class="material-symbols-rounded" onChange>delete</span>
                </button>
            </div>}
        </div>
    );
}

export default FileImport;

