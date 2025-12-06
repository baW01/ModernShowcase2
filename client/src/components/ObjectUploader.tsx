import { useState } from "react";
import type { ReactNode } from "react";
import Uppy from "@uppy/core";
import { DashboardModal } from "@uppy/react";
import "@uppy/core/dist/style.min.css";
import "@uppy/dashboard/dist/style.min.css";
import AwsS3 from "@uppy/aws-s3";
import type { UploadResult } from "@uppy/core";
import { Button } from "@/components/ui/button";

interface ObjectUploaderProps {
  maxNumberOfFiles?: number;
  maxFileSize?: number;
  onGetUploadParameters: () => Promise<{
    method: "PUT";
    url: string;
  }>;
  onComplete?: (
    result: UploadResult<Record<string, unknown>, Record<string, unknown>>
  ) => void;
  buttonClassName?: string;
  children: ReactNode;
}

/**
 * A file upload component that renders as a button and provides a modal interface for
 * file management with automatic image compression.
 * 
 * Features:
 * - Renders as a customizable button that opens a file upload modal
 * - Automatic image compression before upload
 * - Provides a modal interface for file selection, preview, and upload progress
 * - Optimized for performance with size limits
 */
export function ObjectUploader({
  maxNumberOfFiles = 5,
  maxFileSize = 2 * 1024 * 1024, // 2MB default - much smaller than before
  onGetUploadParameters,
  onComplete,
  buttonClassName,
  children,
}: ObjectUploaderProps) {
  const [showModal, setShowModal] = useState(false);
  const [uppy] = useState(() =>
    new Uppy({
      restrictions: {
        maxNumberOfFiles,
        maxFileSize,
        allowedFileTypes: ['image/*'], // Only images for better performance
      },
      autoProceed: false,
    })
      .use(AwsS3, {
        shouldUseMultipart: false,
        getUploadParameters: onGetUploadParameters,
      })
      .on("complete", (result) => {
        setShowModal(false);
        onComplete?.(result);
      })
  );

  return (
    <div>
      <Button onClick={() => setShowModal(true)} className={buttonClassName}>
        {children}
      </Button>

      <DashboardModal
        uppy={uppy}
        open={showModal}
        onRequestClose={() => setShowModal(false)}
        proudlyDisplayPoweredByUppy={false}
        locale={{
          strings: {
            dropPasteFiles: 'Przeciągnij pliki tutaj lub %{browseFiles}',
            browseFiles: 'wybierz',
            uploadComplete: 'Przesyłanie zakończone',
            addMoreFiles: 'Dodaj więcej plików',
            removeFile: 'Usuń plik',
            editFile: 'Edytuj plik',
            cancel: 'Anuluj',
            done: 'Gotowe',
          },
        } as any}
      />
    </div>
  );
}
