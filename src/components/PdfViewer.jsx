import { useEffect, useState } from "react";

const PdfViewer = ({ file, onTextSelection }) => {
  const [showTextInput, setShowTextInput] = useState(false);
  const [selectedText, setSelectedText] = useState("");

  useEffect(() => {
    if (file && window.AdobeDC && window.AdobeDC.View) {
      try {
        console.log("Initializing Adobe PDF Embed API...");
        const adobeDCView = new window.AdobeDC.View({
          clientId: "6b8884d4185c4fcf89ed8b94fcba77e0", // replace with your key
          divId: "adobe-dc-view",
        });

        const reader = new FileReader();
        reader.onload = function (e) {
          console.log("Loading PDF file...");
          adobeDCView.previewFile(
            {
              content: { promise: Promise.resolve(e.target.result) },
              metaData: { fileName: file.name },
            },
            {
              embedMode: "SIZED_CONTAINER",
              showDownloadPDF: true,
              showPrintPDF: true,
              enableFormFilling: false,
            }
          );
        };
        reader.readAsArrayBuffer(file);

        // Add a button for manual text selection
        const addSelectionButton = () => {
          console.log("Adding search button...");
          // Remove existing button if it exists
          const existingButton = document.getElementById('pdf-search-button');
          if (existingButton) {
            existingButton.remove();
          }

          const button = document.createElement('button');
          button.id = 'pdf-search-button';
          button.textContent = '🔍 Search Text';
          button.className = 'fixed top-4 right-4 z-50 bg-blue-500 text-white px-4 py-2 rounded shadow-lg hover:bg-blue-600 transition-colors cursor-pointer';
          button.style.zIndex = '9999';
          button.onclick = () => {
            setShowTextInput(true);
          };
          
          document.body.appendChild(button);
          console.log("Search button added successfully");
        };

        // Add the selection button after a short delay
        setTimeout(addSelectionButton, 2000);

      } catch (error) {
        console.error("Error initializing Adobe PDF Embed API:", error);
      }
    } else {
      console.warn("Adobe PDF Embed API not available");
      console.log("window.AdobeDC:", window.AdobeDC);
      console.log("window.AdobeDC.View:", window.AdobeDC?.View);
    }

    // Cleanup function to remove button when component unmounts
    return () => {
      const button = document.getElementById('pdf-search-button');
      if (button) {
        button.remove();
      }
    };
  }, [file, onTextSelection]);

  const handleSearch = () => {
    if (selectedText.trim()) {
      console.log("Searching for text:", selectedText);
      if (onTextSelection) {
        onTextSelection(selectedText);
      }
      setShowTextInput(false);
      setSelectedText("");
    } else {
      alert("Please enter some text to search for.");
    }
  };

  return (
    <div className="relative w-full h-full">
      <div id="adobe-dc-view" className="w-full h-full"></div>
      
      {/* Text Input Modal */}
      {showTextInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000]">
          <div className="bg-white rounded-lg p-6 w-96 max-w-[90vw]">
            <h3 className="text-lg font-semibold mb-4">Search for Text</h3>
            <p className="text-sm text-gray-600 mb-4">
              Select text from the PDF, copy it, and paste it here to search for related content across your documents.
            </p>
            
            <textarea
              value={selectedText}
              onChange={(e) => setSelectedText(e.target.value)}
              placeholder="Paste your selected text here..."
              className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleSearch}
                className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                🔍 Search
              </button>
              <button
                onClick={() => {
                  setShowTextInput(false);
                  setSelectedText("");
                }}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PdfViewer;
