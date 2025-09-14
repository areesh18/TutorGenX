// frontend/src/pages/FlashcardFromPDF.jsx
"use client"

import React, { useState } from "react"
import axios from "axios"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, FileText, ChevronLeft, ChevronRight, RefreshCcw } from 'lucide-react'

// Custom components
const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-xl border border-gray-200">
    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
    <span className="text-gray-900 font-medium text-lg">Processing...</span>
    <span className="text-gray-500 text-sm mt-1">This may take a moment.</span>
  </div>
)

const FlashcardFromPDF = () => {
  const [file, setFile] = useState(null)
  const [flashcards, setFlashcards] = useState([])
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
    setError(null)
    setFlashcards([])
  }

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a PDF file first.")
      return
    }

    setLoading(true)
    setError(null)
    setFlashcards([])
    setCurrentCardIndex(0)
    setIsFlipped(false)

    try {
      // Step 1: Upload PDF -> get extracted text
      const formData = new FormData()
      formData.append("pdf", file)

      const textRes = await axios.post("http://localhost:8080/pdftext", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      const extractedText = textRes.data

      // Step 2: Send extracted text -> get flashcards
      const flashcardRes = await axios.post(
        "http://localhost:8080/flashcards",
        { pdftext: extractedText },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      )
      setFlashcards(flashcardRes.data.flashcards || [])
    } catch (err) {
      console.error("Error generating flashcards:", err)
      setError("Failed to generate flashcards. Please check the console for details.")
    } finally {
      setLoading(false)
    }
  }

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  const handleNext = () => {
    setIsFlipped(false)
    setCurrentCardIndex((prev) => (prev + 1) % flashcards.length)
  }

  const handlePrev = () => {
    setIsFlipped(false)
    setCurrentCardIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length)
  }
  
  const currentCard = flashcards[currentCardIndex]

  return (
    <div className="min-h-screen bg-gray-50 px-2 sm:px-6 py-4 flex flex-col items-center justify-center font-sans text-gray-900">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg sm:max-w-2xl md:max-w-3xl lg:max-w-4xl p-4 sm:p-8 bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-lg space-y-6"
      >
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-indigo-600 text-white rounded-full mb-4 shadow-md">
            <FileText size={28} className="sm:size-32" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Create Flashcards from PDF</h2>
          <p className="text-gray-600 text-sm sm:text-base">Upload a PDF and let AI generate flashcards for you instantly.</p>
        </div>

        <div className="flex flex-col items-center justify-center p-4 sm:p-6 border-2 border-dashed border-gray-300 rounded-lg sm:rounded-xl bg-gray-50 w-full">
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
            <input 
              type="file" 
              accept="application/pdf" 
              onChange={handleFileChange} 
              className="block w-full text-xs sm:text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-xs sm:file:text-sm file:font-semibold
                file:bg-indigo-50 file:text-indigo-700
                hover:file:bg-indigo-100"
            />
            <motion.button
              onClick={handleUpload}
              disabled={loading || !file}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed w-full sm:w-auto"
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
          </div>
          {file && <p className="mt-4 text-xs sm:text-sm text-gray-600 break-all">Selected file: <span className="font-medium text-gray-800">{file.name}</span></p>}
          {error && <p className="mt-4 text-xs sm:text-sm text-red-600">{error}</p>}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            key="loading-spinner"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-6 sm:mt-8 w-full"
          >
            <LoadingSpinner />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {flashcards.length > 0 && !loading && (
          <motion.div
            key="flashcard-section"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-lg sm:max-w-2xl md:max-w-3xl lg:max-w-4xl mt-6 sm:mt-8 space-y-6"
          >
            {/* Use flex-row for arrows and card */}
            <div className="flex flex-row items-center justify-center gap-4 w-full">
              <motion.button
                onClick={handlePrev}
                className="p-3 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronLeft size={24} />
              </motion.button>
              
              <div
                className="relative flex-1 h-64 sm:h-80 perspective"
                onClick={handleFlip}
              >
                <motion.div
                  className="absolute w-full h-full rounded-2xl shadow-xl p-4 sm:p-8 flex items-center justify-center cursor-pointer"
                  initial={{ rotateY: 0 }}
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.6 }}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {/* Front Side */}
                  <div
                    className="absolute w-full h-full flex items-center justify-center text-center backface-hidden"
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <h3 className="text-lg sm:text-2xl font-bold text-gray-900 leading-snug break-words px-2">{currentCard.front}</h3>
                  </div>
                  {/* Back Side */}
                  <div
                    className="absolute w-full h-full flex items-center justify-center text-center backface-hidden"
                    style={{
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                    }}
                  >
                    <p className="text-base sm:text-xl text-gray-700 break-words px-2">{currentCard.back}</p>
                  </div>
                </motion.div>
              </div>

              <motion.button
                onClick={handleNext}
                className="p-3 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronRight size={24} />
              </motion.button>
            </div>
            
            <p className="text-center text-gray-500 mt-4 text-xs sm:text-base">
              Flashcard {currentCardIndex + 1} of {flashcards.length}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default FlashcardFromPDF