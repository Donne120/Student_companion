
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { documentService, ProcessedDocument } from "@/services/documentService";
import { FileText, Trash2, File } from "lucide-react";
import { toast } from "sonner";
import { DocumentUploader } from "./DocumentUploader";

export const DocumentManager = () => {
  const [documents, setDocuments] = useState<ProcessedDocument[]>([]);
  
  useEffect(() => {
    // Load documents
    setDocuments(documentService.getAllDocuments());
  }, []);
  
  const handleDocumentProcessed = (doc: ProcessedDocument) => {
    setDocuments(prev => [...prev, doc]);
  };
  
  const handleDeleteDocument = (id: string) => {
    if (documentService.deleteDocument(id)) {
      setDocuments(prev => prev.filter(doc => doc.id !== id));
      toast.success("Document deleted");
    } else {
      toast.error("Failed to delete document");
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary to-[#D946EF] text-transparent bg-clip-text">
          Knowledge Base Management
        </h2>
        <p className="text-muted-foreground">
          Upload ALU documents to enhance the AI's knowledge and provide more accurate responses
        </p>
      </div>
      
      <DocumentUploader onDocumentProcessed={handleDocumentProcessed} />
      
      {documents.length > 0 ? (
        <div>
          <h3 className="font-medium mb-3">Uploaded Documents ({documents.length})</h3>
          <div className="space-y-3">
            {documents.map(doc => (
              <div 
                key={doc.id} 
                className="flex items-center justify-between p-3 rounded-lg border border-input bg-background/50 hover:bg-background/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium truncate max-w-[200px]">{doc.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      {new Date(doc.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleDeleteDocument(doc.id)}
                  title="Delete document"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-6 text-center">
          <File className="w-10 h-10 text-muted-foreground mb-2" />
          <h3 className="text-lg font-medium">No documents yet</h3>
          <p className="text-sm text-muted-foreground">
            Upload ALU documents to enhance the AI's knowledge
          </p>
        </div>
      )}
    </div>
  );
};
