import { useState } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';


const EXAMPLE_LINK_OBSIDIAN_BASE64 = "eyJjb25kaXRpb25zIjpbeyJjcmVhdGVkX2F0IjoiIiwiaWQiOiIiLCJsaW5rX2lkIjoiIiwidHlwZSI6InVybF9zdGFydCIsInZhbHVlIjoiaHR0cHM6Ly9vbGRzY2hvb2wucnVuZXNjYXBlLndpa2kvdy9Ub2t0ei14aWwtYWsifSx7ImNyZWF0ZWRfYXQiOiIiLCJpZCI6IiIsImxpbmtfaWQiOiIiLCJ0eXBlIjoieHBhdGhfZXhpc3RzIiwidmFsdWUiOiIvL2RpdltAaWQ9XCJtdy1jb250ZW50LXRleHRcIl0vZGl2WzFdL3BbMl0ifV0sImNyZWF0ZWRfYXQiOiIyMDI2LTA0LTIxVDIxOjUzOjQ1LjQ5MVoiLCJkaXNwbGF5X25hbWUiOiIiLCJocmVmX3BhdGhfZm9ybWF0Ijoid3d3Lmdvb2dsZS5jb20iLCJpY29uIjpudWxsLCJpZCI6ImxvY2FsLWZlOGY5YmMyLTI1ZjQtNDVmNS04ZGNmLTI2NDgxNzlhZThmNS02Yjg2ZjcwOC05OTA5LTQyODAtODg3ZC1mOTVmNmU1MzBiMzgiLCJuYW1lIjoiTGluayB0byBvYnNpZGlhbiIsIm9uX3NlbGVjdGVkX3RleHRfcmVnZXgiOiJvYnNpZGlhbiIsIm9uX3hwYXRoIjoiLy9kaXZbQGlkPVwibXctY29udGVudC10ZXh0XCJdL2RpdlsxXS9wWzJdIiwicG9zaXRpb24iOiJ1c2VyX2RlZmF1bHQiLCJ1cGRhdGVkX2F0IjoiMjAyNi0wNC0yMVQyMTo1Mzo0NS40OTFaIiwidXNlcl9pZCI6ImxvY2FsLWZlOGY5YmMyLTI1ZjQtNDVmNS04ZGNmLTI2NDgxNzlhZThmNSIsInZpc2liaWxpdHkiOiJwcml2YXRlIn0="

export default function DebugTab() {
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleImportLink = async () => {
    setSuccessMsg(null);
    setErrorMsg(null);
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    if (tabs[0]?.id) {
      await browser.tabs.sendMessage(tabs[0].id, {
        action: 'linkemImportLink',
        base64: EXAMPLE_LINK_OBSIDIAN_BASE64
      });
      setSuccessMsg('Browser message sent');
    } else {
      setErrorMsg('Failed to get tab id');
    }
  };

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label className="font-semibold text-gray-700">Import Link (Base64)</label>
      </div>

      <button
        onClick={handleImportLink}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-semibold transition-colors"
      >
        Import Hardcoded Link
      </button>

      {successMsg && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-md p-3 text-green-700">
          <CheckCircle size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-md p-3 text-red-700">
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
