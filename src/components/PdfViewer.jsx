import { useEffect } from "react";

const PdfViewer = ({ file }) => {
  useEffect(() => {
    if (file && window.AdobeDC) {
      const adobeDCView = new window.AdobeDC.View({
        clientId: "14113d4c9b4246ab838b86bb4580859d", // replace with your key
        divId: "adobe-dc-view",
      });

      const reader = new FileReader();
      reader.onload = function (e) {
        adobeDCView.previewFile(
          {
            content: { promise: Promise.resolve(e.target.result) },
            metaData: { fileName: file.name },
          },
          {
            embedMode: "SIZED_CONTAINER",
            showDownloadPDF: true,
            showPrintPDF: true,
          }
        );
      };
      reader.readAsArrayBuffer(file);
    }
  }, [file]);

  return <div id="adobe-dc-view" className="w-full h-full"></div>;
};

export default PdfViewer;
