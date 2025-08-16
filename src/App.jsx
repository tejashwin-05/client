import { useState, useEffect } from "react";
import { apiService } from "./services/api.js";
import PdfViewer from "./components/PdfViewer";
import Snippets from "./components/Snippets";
import toast, { Toaster } from "react-hot-toast";

function App() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedText, setSelectedText] = useState("");
  const [clusterId, setClusterId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  
  // New state for uploaded documents
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  const [documentError, setDocumentError] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [documentSections, setDocumentSections] = useState([]);
  const [isLoadingSections, setIsLoadingSections] = useState(false);
  
  // Snippets and semantic search state
  const [snippets, setSnippets] = useState([]);
  const [isSearchingSnippets, setIsSearchingSnippets] = useState(false);

  // Fetch uploaded documents on component mount
  useEffect(() => {
    fetchUploadedDocuments();
  }, []);

  // Fetch uploaded documents from backend
  const fetchUploadedDocuments = async () => {
    setIsLoadingDocuments(true);
    setDocumentError(null);
    
    try {
      const response = await apiService.getDocuments();
      setUploadedDocuments(response.documents || []);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
      setDocumentError(error.message);
    } finally {
      setIsLoadingDocuments(false);
    }
  };

  // Handle document selection from library
  const handleDocumentSelect = async (document) => {
    setSelectedDocument(document);
    setIsLoadingSections(true);
    
    try {
      const response = await apiService.getDocumentSections(document._id);
      setDocumentSections(response.sections || []);
    } catch (error) {
      console.error("Failed to fetch document sections:", error);
      setDocumentSections([]);
    } finally {
      setIsLoadingSections(false);
    }
  };

  // Handle text selection from PDF viewer
  const handleTextSelection = async (text) => {
    if (!text || text.trim().length < 10) {
      toast.error("Please select more text for better search results");
      return;
    }

    setSelectedText(text);
    setIsSearchingSnippets(true);
    setSnippets([]);

    try {
      const searchResults = await apiService.semanticSearch(text);
      setSnippets(searchResults.snippets || []);
      
      if (searchResults.snippets && searchResults.snippets.length > 0) {
        toast.success(`Found ${searchResults.snippets.length} relevant snippets`);
      } else {
        toast.info("No relevant snippets found for your selection");
      }
    } catch (error) {
      console.error("Semantic search failed:", error);
      toast.error("Failed to search for relevant snippets");
    } finally {
      setIsSearchingSnippets(false);
    }
  };

  // Handle snippet click to navigate to specific section
  const handleSnippetClick = async (snippet) => {
    try {
      // Find the document that contains this snippet
      const document = uploadedDocuments.find(doc => doc._id === snippet.document_id);
      if (!document) {
        toast.error("Document not found");
        return;
      }

      // Load the document and navigate to the specific section
      await handleDocumentSelect(document);
      
      // TODO: Implement goToLocation to navigate to specific page/section
      toast.success(`Navigated to ${document.filename} - ${snippet.section_title}`);
    } catch (error) {
      console.error("Failed to navigate to snippet:", error);
      toast.error("Failed to navigate to snippet");
    }
  };

  // Handle file upload
  const handleFileUpload = (event) => {
    const uploadedFiles = Array.from(event.target.files);
    setFiles((prev) => [...prev, ...uploadedFiles]);

    // Auto-select first file if none selected
    if (!selectedFile && uploadedFiles.length > 0) {
      setSelectedFile(uploadedFiles[0]);
    }
  };

  // Upload cluster to backend
  const handleUploadCluster = async () => {
    if (files.length === 0) {
      toast.error("Please select files to upload");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const result = await apiService.uploadCluster(files);
      console.log("Upload successful:", result);

      setClusterId(result.cluster_id);
      toast.success(
        `Successfully uploaded ${result.processed_files_count} files! Cluster ID: ${result.cluster_id}`
      );

      // ✅ Reset back to initial stage after successful upload
      setFiles([]);
      setSelectedFile(null);
      setSelectedText("");
      
      // Refresh the document library to show the newly uploaded documents
      await fetchUploadedDocuments();
    } catch (error) {
      console.error("Upload failed:", error);
      setUploadError(error.message);
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };


  // Remove file
  const handleRemoveFile = (fileToRemove) => {
    setFiles((prev) => prev.filter((file) => file !== fileToRemove));

    if (selectedFile === fileToRemove) {
      const remaining = files.filter((f) => f !== fileToRemove);
      setSelectedFile(remaining.length > 0 ? remaining[0] : null);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-red-50">
      {/* Notification */}
      <Toaster />
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
          {clusterId && (
            <span className="text-gray-600">Cluster: {clusterId}</span>
          )}
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

          {/* Upload Button */}
          <button
            onClick={handleUploadCluster}
            disabled={isUploading || files.length === 0}
            className={`w-full p-3 rounded-lg mb-4 font-medium ${
              isUploading || files.length === 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-red-600 text-white hover:bg-red-700"
            }`}
          >
            {isUploading
              ? "Uploading..."
              : `Upload Cluster (${files.length} files)`}
          </button>

          {uploadError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {uploadError}
            </div>
          )}

          {/* Document Library */}
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold">Document Library</h2>
            <button
              onClick={fetchUploadedDocuments}
              disabled={isLoadingDocuments}
              className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 disabled:bg-gray-300"
            >
              {isLoadingDocuments ? "🔄" : "🔄"}
            </button>
          </div>
          
          {isLoadingDocuments ? (
            <p className="text-sm text-gray-500 mb-4">Loading documents...</p>
          ) : documentError ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-4 text-xs">
              {documentError}
            </div>
          ) : uploadedDocuments.length === 0 ? (
            <p className="text-sm text-gray-500 mb-4">No documents uploaded</p>
          ) : (
            <ul className="space-y-2 mb-4">
              {uploadedDocuments.map((document, index) => (
                <li
                  key={document._id || index}
                  className={`flex items-center justify-between p-2 rounded border cursor-pointer ${
                    selectedDocument === document
                      ? "bg-red-100 border-red-400"
                      : "bg-white hover:bg-gray-100"
                  }`}
                  onClick={() => handleDocumentSelect(document)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-700 truncate">
                      {document.filename}
                    </div>
                    <div className="text-xs text-gray-500">
                      Cluster: {document.cluster_id?.slice(0, 8)}...
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 ml-2">
                    {document.total_sections} sections
                  </div>
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

        {/* Center PDF Viewer with Tabs */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          {/* Tabs */}
          {files.length > 0 && (
            <div className="flex border-b bg-gray-100">
              {files.map((file, index) => (
                <div
                  key={index}
                  className={`px-4 py-2 flex items-center gap-2 cursor-pointer border-r ${
                    selectedFile === file
                      ? "bg-white border-b-2 border-red-600 font-medium"
                      : "hover:bg-gray-200"
                  }`}
                  onClick={() => setSelectedFile(file)}
                >
                  <span className="truncate max-w-[150px]">{file.name}</span>
                  <button
                    className="text-red-500 hover:text-red-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile(file);
                    }}
                  >
                    ❌
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* PDF Area */}
          <div className="flex-1 overflow-auto">
            {selectedFile ? (
              <PdfViewer file={selectedFile} onTextSelection={handleTextSelection} />
            ) : selectedDocument ? (
              <div className="p-6">
                <div className="mb-4">
                  <h2 className="text-xl font-semibold mb-2">{selectedDocument.filename}</h2>
                  <p className="text-sm text-gray-600">Document from cluster: {selectedDocument.cluster_id}</p>
                </div>
                
                {isLoadingSections ? (
                  <div className="text-center py-8">
                    <div className="text-2xl mb-2">🔄</div>
                    <p>Loading document sections...</p>
                  </div>
                ) : documentSections.length > 0 ? (
                  <div className="space-y-4">
                    {documentSections.map((section, index) => (
                      <div key={section._id || index} className="bg-white border rounded-lg p-4 shadow-sm">
                        <h3 className="font-medium text-lg mb-2 text-gray-800">
                          {section.title || `Section ${index + 1}`}
                        </h3>
                        <div className="text-gray-700 leading-relaxed">
                          {section.content}
                        </div>
                        {section.page_number && (
                          <div className="text-xs text-gray-500 mt-2">
                            Page: {section.page_number}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-2xl mb-2">📄</div>
                    <p>No sections found for this document</p>
                  </div>
                )}
              </div>
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
        </div>

        {/* Right Sidebar */}
        <div className="w-96 border-l bg-red-50 p-4 overflow-y-auto">
          <h2 className="font-semibold mb-4">Connecting the Dots</h2>

          {/* Selected Document Info */}
          {selectedDocument && (
            <div className="bg-white rounded p-4 shadow mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">📄 Selected Document</h3>
                <button
                  onClick={() => {
                    setSelectedDocument(null);
                    setDocumentSections([]);
                  }}
                  className="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
                >
                  ✕
                </button>
              </div>
              <div className="text-sm text-gray-700">
                <p><strong>Filename:</strong> {selectedDocument.filename}</p>
                <p><strong>Cluster ID:</strong> {selectedDocument.cluster_id}</p>
                <p><strong>Sections:</strong> {selectedDocument.total_sections}</p>
                <p><strong>Document ID:</strong> {selectedDocument._id}</p>
              </div>
            </div>
          )}

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

          {/* Snippets */}
          <Snippets 
            snippets={snippets}
            selectedText={selectedText}
            onSnippetClick={handleSnippetClick}
            isLoading={isSearchingSnippets}
          />

          {/* Options */}
          <div className="flex gap-2 mb-4">
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
