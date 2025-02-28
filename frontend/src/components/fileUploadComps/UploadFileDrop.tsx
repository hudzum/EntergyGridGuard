import React, { useRef } from "react";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";
import { Button } from "../ui/button";
export default function UploadFileDrop(onUpload: any) {
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const handleUpload = () => {
    onUpload()
  };

  const { getRootProps, getInputProps, open, acceptedFiles } = useDropzone({
    onDrop: (incomingFiles: File[]) => {
      if (hiddenInputRef.current) {
        const dataTransfer = new DataTransfer();
        incomingFiles.forEach((v) => {
          dataTransfer.items.add(v);
        });
        hiddenInputRef.current.files = dataTransfer.files;
      }
   
    },
    multiple: true,
    onDragEnter: () => {},
    onDragOver: () => {},
    onDragLeave: () => {},
    maxFiles: 20,
    accept: {
      "image/*": [".png", ".jpeg", ".jpg"],
    },
  });

  const files = acceptedFiles.map((file) => (
    <li key={file.path} className="text-sm text-gray-700">
      📄 {file.path} - {(file.size / 1024).toFixed(2)} KB
    </li>
  ));

  return (
    <div className="container">
      <div
        {...getRootProps({ className: "dropzone",
          onClick: open
         })}
        className="border-2 border-dashed border-blue-500 rounded-lg p-6 text-center cursor-pointer hover:bg-blue-50"
      >
       
        <Upload className="w-15 mb-4  h-15  mx-auto text-gray-600" />
        <input {...getInputProps()} ref={hiddenInputRef} />
        <p className="text-gray-600">
          Drag & drop some files here or{" "}
          <span className="text-blue-500 underline">click to select</span>.
        </p>
       
      </div>
      {acceptedFiles.length > 0 && (
        <aside className="mt-4">
          <h4 className="text-lg font-semibold text-gray-800">
            Uploaded Files
          </h4>

          <ul className="list-disc pl-5 mt-1">{files}</ul>
        </aside>
      )}
      <Button onClick={handleUpload}>Process Files</Button>
    </div>
  );
}
