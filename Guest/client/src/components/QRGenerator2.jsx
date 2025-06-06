import { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "react-toastify";
import api from "../utils/axios";
import PropTypes from "prop-types";
import { FiUser, FiCalendar, FiDownload } from "react-icons/fi";

const QRGenerator = ({ value }) => {
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
      [name]: name === "age" ? Math.max(0, parseInt(value) || "") : value,
    }));
  };

  const generateQRCode = async () => {
    if (!formData.fullName || !formData.age || !formData.gender) {
      toast.error("Please fill out all fields");
      return;
    }

    if (formData.age < 0 || formData.age > 120) {
      toast.error("Please enter a valid age between 0 and 120");
      return;
    }

    try {
      const response = await api.post("/guests", {
        ...formData,
        roomCode: value.toUpperCase(),
      });
      setQrData(response.data);
      toast.success("QR Code generated successfully!");
      setFormData({
        fullName: "",
        age: "",
        gender: "Male",
      });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error generating QR Code";
      toast.error(errorMessage);
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
    <div className="w-full">
      <div className="space-y-6">
        <div>
          <label
            htmlFor="fullName"
            className="block text-sm font-medium text-gray-700"
          >
            Full Name
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiUser className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter full name"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="age"
            className="block text-sm font-medium text-gray-700"
          >
            Age
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiCalendar className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="number"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleInputChange}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter age"
            />
          </div>
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
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <button
          onClick={generateQRCode}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Generate QR Code
        </button>

        {qrData && (
          <div className="mt-6 space-y-4">
            <div
              ref={qrRef}
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
            >
              <QRCodeSVG
                value={formatQRValue(qrData)}
                size={256}
                level="H"
                includeMargin={true}
              />
            </div>
            <button
              onClick={downloadQRCode}
              className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <FiDownload className="mr-2 h-5 w-5" />
              Download QR Code
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

QRGenerator.propTypes = {
  value: PropTypes.string.isRequired,
};

export default QRGenerator;
