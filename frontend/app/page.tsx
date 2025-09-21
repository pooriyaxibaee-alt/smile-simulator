'use client';

    import { useState } from 'react';
    import axios from 'axios';

    export default function Home() {
      const [referenceImage, setReferenceImage] = useState<File | null>(null);
      const [patientImage, setPatientImage] = useState<File | null>(null);
      const [result, setResult] = useState<string | null>(null);
      const [error, setError] = useState<string | null>(null);

      const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!referenceImage || !patientImage) {
          setError('Please select both images');
          return;
        }

        const formData = new FormData();
        formData.append('images', referenceImage);
        formData.append('images', patientImage);

        setError(null); // ریست ارور قبل از درخواست
        setResult(null); // ریست نتیجه قبل از درخواست

        try {
          const response = await axios.post('http://localhost:5001/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 10000, // تایم‌اوت 10 ثانیه
          });
          if (response.data && typeof response.data.result === 'string') {
            setResult(response.data.result);
          } else {
            throw new Error('Unexpected response format');
          }
        } catch (err: any) {
          console.error('Axios error details:', err); // لگاریگ کامل ارور
          setError(
            err.response?.data?.message ||
            err.message ||
            'Failed to process images. Check server or network.'
          );
          setResult(null);
        }
      };

      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-white">
          <h1 className="text-3xl font-bold mb-6 text-black">Smile Simulator</h1>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-md">
            <div>
              <label className="block mb-1 text-gray-800">Reference Image:</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setReferenceImage(e.target.files?.[0] || null)}
                className="border p-2 rounded w-full text-gray-900"
              />
            </div>
            <div>
              <label className="block mb-1 text-gray-800">Patient Image:</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPatientImage(e.target.files?.[0] || null)}
                className="border p-2 rounded w-full text-gray-900"
              />
            </div>
            <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
              Process Images
            </button>
          </form>
          {result && (
            <div className="mt-4 p-4 bg-gray-100 rounded shadow w-full max-w-md">
              <h2 className="text-xl font-semibold text-black">Result:</h2>
              <pre className="text-gray-900">{result}</pre>
            </div>
          )}
          {error && (
            <div className="mt-4 p-4 bg-red-100 text-red-700 rounded w-full max-w-md">
              <h2 className="text-xl font-semibold">Error:</h2>
              <p>{error}</p>
            </div>
          )}
        </div>
      );
    }