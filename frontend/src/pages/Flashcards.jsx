// frontend/src/pages/Flashcards.jsx
"use client";

import React,  { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  ChevronLeft,
  ChevronRight,
  RefreshCcw,
} from "lucide-react";

// Custom components
const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-sm border border-gray-100">
    <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-3" />
    <span className="text-gray-700 font-medium">Processing...</span>
    <span className="text-gray-500 text-sm">This may take a moment.</span>
  </div>
);

const FlashcardFromPDF = () => {
  const [file, setFile] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError(null);
    setFlashcards([]);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a PDF file first.");
      return;
    }

    setLoading(true);
    setError(null);
    setFlashcards([]);
    setCurrentCardIndex(0);
    setIsFlipped(false);

    try {
      // Step 1: Upload PDF -> get extracted text
      const formData = new FormData();
      formData.append("pdf", file);

      const textRes = await axios.post(
        "http://localhost:8080/pdftext",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const extractedText = textRes.data;

      // Step 2: Send extracted text -> get flashcards
      const flashcardRes = await axios.post(
        "http://localhost:8080/flashcards",
        { pdftext: extractedText, fileName: file.name },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setFlashcards(flashcardRes.data.flashcards || []);
    } catch (err) {
      console.error("Error generating flashcards:", err);
      setError(
        "Failed to generate flashcards. Please check the console for details."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev + 1) % flashcards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentCardIndex(
      (prev) => (prev - 1 + flashcards.length) % flashcards.length
    );
  };

  const currentCard = flashcards[currentCardIndex];

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-8 flex flex-col items-center justify-center">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="text-indigo-600" size={32} />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          PDF to Flashcards
        </h1>
        <p className="text-gray-600">
          Upload a PDF and generate study flashcards instantly
        </p>
      </motion.div>

      {/* Upload Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8"
      >
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-indigo-300 transition-colors">
          <div className="space-y-4">
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-600
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:bg-indigo-50 file:text-indigo-700
                hover:file:bg-indigo-100 file:cursor-pointer"
            />

            {file && (
              <div className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">
                Selected: <span className="font-medium">{file.name}</span>
              </div>
            )}

            <motion.button
              onClick={handleUpload}
              disabled={loading || !file}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <>
                  <RefreshCcw size={18} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload size={18} />
                  Generate Flashcards
                </>
              )}
            </motion.button>

            {error && (
              <div className="text-sm text-red-600 p-3 bg-red-50 rounded-lg">
                {error}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Loading */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LoadingSpinner />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Flashcards */}
      <AnimatePresence>
        {flashcards.length > 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-xl"
          >
            {/* Progress */}
            <div className="text-center mb-6">
              <span className="text-gray-600">
                {currentCardIndex + 1} of {flashcards.length}
              </span>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <motion.div
                  className="bg-indigo-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${
                      ((currentCardIndex + 1) / flashcards.length) * 100
                    }%`,
                  }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Card and Navigation */}
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={handlePrev}
                className="p-3 bg-white rounded-full shadow-sm hover:shadow-md border border-gray-200 hover:bg-gray-50"
              >
                <ChevronLeft size={24} className="text-gray-600" />
              </button>

              <div
                className="flex-1 h-80 sm:h-96 cursor-pointer"
                onClick={handleFlip}
                style={{ perspective: "1000px" }}
              >
                <motion.div
                  className="relative w-full h-full rounded-xl"
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.5 }}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {/* Both sides are now within this container */}
                  <div
                    className="absolute inset-0 bg-white rounded-xl p-6 sm:p-8 flex items-center justify-center text-center border border-gray-200 shadow-sm"
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-800 leading-relaxed">
                        {currentCard.front}
                      </h3>
                      <p className="text-gray-500 text-sm mt-4">
                        Click to reveal answer
                      </p>
                    </div>
                  </div>

                  <div
                    className="absolute inset-0 bg-blue-50 rounded-xl p-6 sm:p-8 flex items-center justify-center text-center border border-blue-200 shadow-sm"
                    style={{
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                    }}
                  >
                    <div>
                      <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                        {currentCard.back}
                      </p>
                      <p className="text-gray-500 text-sm mt-4">
                        Click to see question
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>

              <button
                onClick={handleNext}
                className="p-3 bg-white rounded-full shadow-sm hover:shadow-md border border-gray-200 hover:bg-gray-50"
              >
                <ChevronRight size={24} className="text-gray-600" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FlashcardFromPDF;