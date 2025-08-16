import { useState } from "react";
import PdfViewer from "./components/PDFViewer";

function App() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedText, setSelectedText] = useState("");

  // Handle file upload
  const handleFileUpload = (event) => {
    const uploadedFiles = Array.from(event.target.files);
    setFiles((prev) => [...prev, ...uploadedFiles]);
    if (!selectedFile && uploadedFiles.length > 0) {
      setSelectedFile(uploadedFiles[0]);
    }
  };

  // Remove a file from library
  const handleRemoveFile = (fileToRemove) => {
    setFiles((prev) => prev.filter((file) => file !== fileToRemove));
    if (selectedFile === fileToRemove) {
      setSelectedFile(null);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-red-50">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b bg-red-50">
        <h1 className="text-xl font-bold flex items-center gap-2 text-gray-800">
          <span className="bg-red-600 text-white p-2 rounded">📑</span>
          Document Insight Engine
        </h1>
        <div className="flex gap-4 items-center">
          <button className="bg-yellow-500 text-white px-3 py-1 rounded">
            Adobe India Hackathon
          </button>
          <span className="text-gray-600">Cluster: demo_cluster</span>
          <button>⚙️</button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-72 border-r bg-red-50 p-4 overflow-y-auto">
          <h2 className="font-semibold mb-2">Upload Documents</h2>

          {/* File Input */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-4 bg-white">
            <input
              type="file"
              accept="application/pdf"
              multiple
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-700 cursor-pointer"
            />
            <p className="text-gray-500 text-xs mt-2">
              Upload multiple PDFs to analyze connections
            </p>
          </div>

          {/* Document Library */}
          <h2 className="font-semibold mb-2">Document Library</h2>
          {files.length === 0 ? (
            <p className="text-sm text-gray-500 mb-4">No documents uploaded</p>
          ) : (
            <ul className="space-y-2 mb-4">
              {files.map((file, index) => (
                <li
                  key={index}
                  className={`flex items-center justify-between p-2 rounded border cursor-pointer ${
                    selectedFile === file
                      ? "bg-red-100 border-red-400"
                      : "bg-white hover:bg-gray-100"
                  }`}
                  onClick={() => setSelectedFile(file)}
                >
                  <span className="text-sm text-gray-700 truncate w-40">
                    {file.name}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile(file);
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    ❌
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Sidebar Buttons */}
          <button className="w-full p-2 bg-white rounded border text-left mb-2">
            ⚡ Generate Insights
          </button>
          <button className="w-full p-2 bg-white rounded border text-left mb-2">
            🎙️ Podcast Mode
          </button>
          <button className="w-full p-2 bg-white rounded border text-left">
            🔍 Concept Explorer
          </button>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 bg-white overflow-auto">
          {selectedFile ? (
            <PdfViewer file={selectedFile} />
          ) : (
            <div className="text-center text-gray-600 flex flex-col items-center justify-center h-full">
              <div className="text-5xl mb-4">📄</div>
              <h2 className="text-lg font-semibold">PDF Preview</h2>
              <p className="text-sm text-gray-500">
                Upload and select a document to view
              </p>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="w-96 border-l bg-red-50 p-4 overflow-y-auto">
          <h2 className="font-semibold mb-4">Connecting the Dots</h2>

          {/* Selected Text */}
          <div className="bg-white rounded p-4 shadow mb-4">
            <h3 className="font-medium mb-2">⭐ Selected Text</h3>
            {selectedText ? (
              <blockquote className="border-l-4 border-red-500 pl-3 italic text-gray-700">
                {selectedText}
              </blockquote>
            ) : (
              <p className="text-sm text-gray-500">No text selected</p>
            )}
          </div>

          {/* Options */}
          <div className="flex gap-2 mb-4">
            <button className="flex-1 p-2 border rounded bg-white">
              📄 Snippets
            </button>
            <button className="flex-1 p-2 border rounded bg-white">
              💡 Insights
            </button>
            <button className="flex-1 p-2 border rounded bg-white">
              🎙️ Podcast
            </button>
          </div>

          {/* Podcast Mode */}
          <h3 className="font-medium mb-2">Podcast Mode</h3>
          <button className="bg-red-600 text-white px-4 py-2 rounded mb-3">
            Generate
          </button>
          <div className="bg-white rounded p-6 text-center border">
            <div className="text-4xl mb-2">🎙️</div>
            <p className="text-sm text-gray-600">
              Generate an AI podcast from your selected text and related
              snippets. Click "Generate" to create your personalized podcast.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
