// src/components/FileExport.jsx
import React from "react";
import "./FileImport.css"; // FileImportExport와 동일한 스타일을 쓸 수 있습니다
import downloadIcon from '../assets/download.svg';

const FileExport = ({ exportData, fileName = "exported_data.json" }) => {
  const handleExport = () => {
    // 1) prop으로 전달된 데이터가 없으면 로컬 스토리지에서 읽어오기
    const data =
      exportData ||
      JSON.parse(localStorage.getItem("InvestmentTypes")) ||
      {};

    // 2) JSON → Blob
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });

    // 3) Blob URL 생성
    const url = URL.createObjectURL(blob);

    // 4) 임시 a 태그로 다운로드 트리거
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();

    // 5) 정리
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <button className="export-btn" onClick={handleExport}>
      <img src={downloadIcon} alt="download" style={{ width: 22, height: 22, marginRight: 8 }} />
      Export File
    </button>
  );
};

export default FileExport;
