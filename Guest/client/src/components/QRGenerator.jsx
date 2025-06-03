import { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "react-toastify";
import axios from "axios";

const QRGenerator = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    gender: "Male",
  });
  const [qrData, setQrData] = useState(null);
  const qrRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const generateQRCode = async () => {
    if (!formData.fullName || !formData.age || !formData.gender) {
      toast.error("Please fill out all fields");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3000/api/guests",
        formData
      );
      setQrData(response.data);
      toast.success("QR Code generated successfully!");
    } catch (error) {
      toast.error("Error generating QR Code");
      console.error("Error:", error);
    }
  };

  const downloadQRCode = () => {
    try {
      const canvas = document.createElement("canvas");
      const svg = qrRef.current.querySelector("svg");
      const svgData = new XMLSerializer().serializeToString(svg);
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        const link = document.createElement("a");
        link.download = `guest_qr_${formData.fullName.replace(
          /\s+/g,
          "_"
        )}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      };

      img.src =
        "data:image/svg+xml;base64," +
        btoa(unescape(encodeURIComponent(svgData)));
    } catch (error) {
      toast.error("Error downloading QR code");
      console.error("Download error:", error);
    }
  };

  const formatQRValue = (data) => {
    return `ID: ${data.id}, Name: ${data.fullName}, Age: ${data.age}, Gender: ${data.gender}`;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Guest QR Code Generator
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-700"
              >
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className="input-field mt-1"
                placeholder="Enter full name"
              />
            </div>

            <div>
              <label
                htmlFor="age"
                className="block text-sm font-medium text-gray-700"
              >
                Age
              </label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                className="input-field mt-1"
                placeholder="Enter age"
              />
            </div>

            <div>
              <label
                htmlFor="gender"
                className="block text-sm font-medium text-gray-700"
              >
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="select-field mt-1"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <button onClick={generateQRCode} className="btn-primary w-full">
              Generate QR Code
            </button>
          </div>

          <div className="flex flex-col items-center justify-center space-y-4">
            {qrData && (
              <>
                <div ref={qrRef} className="bg-white p-4 rounded-lg shadow">
                  <QRCodeSVG
                    value={formatQRValue(qrData)}
                    size={256}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                <button onClick={downloadQRCode} className="btn-primary">
                  Download QR Code
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRGenerator;
