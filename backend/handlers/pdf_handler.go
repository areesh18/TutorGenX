package handlers

import (
	"io"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strings"

	"github.com/ledongthuc/pdf"
)

// Extract text from a PDF file
func extractText(path string) (string, error) {
	f, r, err := pdf.Open(path)
	if err != nil {
		return "", err
	}
	defer f.Close()

	var text string
	totalPage := r.NumPage()
	for pageIndex := 1; pageIndex <= totalPage; pageIndex++ {
		p := r.Page(pageIndex)
		if p.V.IsNull() {
			continue
		}

		// Extract text from each text element on the page
		texts := p.Content().Text
		for _, textObj := range texts {
			text += textObj.S + " "
		}
		text += "\n\n" // Add page separator
	}
	return text, nil
}

// Clean up extracted text by fixing spacing issues
func cleanExtractedText(text string) string {
	return fixCharacterSpacing(text)
}

// Fix character spacing using simple string replacement
func fixCharacterSpacing(text string) string {
	// First normalize all whitespace to single spaces
	text = regexp.MustCompile(`\s+`).ReplaceAllString(text, " ")
	
	// Replace common PDF artifacts
	text = strings.ReplaceAll(text, "�", " ")
	
	// Remove character spacing: replace "X Y Z" patterns where X, Y, Z are single chars
	for i := 0; i < 15; i++ {
		oldText := text
		text = regexp.MustCompile(`([a-zA-Z0-9])\s+([a-zA-Z0-9])`).ReplaceAllString(text, "$1$2")
		if text == oldText {
			break
		}
	}
	
	// Add strategic spaces for readability
	// Add space before capital letters that follow lowercase letters (CamelCase splitting)
	text = regexp.MustCompile(`([a-z])([A-Z])`).ReplaceAllString(text, "$1 $2")
	
	// Add spaces around numbers when they're adjacent to letters
	text = regexp.MustCompile(`([0-9])([a-zA-Z])`).ReplaceAllString(text, "$1 $2")
	text = regexp.MustCompile(`([a-zA-Z])([0-9])`).ReplaceAllString(text, "$1 $2")
	
	// Add spaces between lowercase and uppercase sequences
	text = regexp.MustCompile(`([a-z])([A-Z][A-Z]+)`).ReplaceAllString(text, "$1 $2")
	
	// Add spaces before common academic/technical terms
	text = regexp.MustCompile(`([a-z])(Abstract|Introduction|Conclusion|References|Keywords|Figure|Table|Section)`).ReplaceAllString(text, "$1 $2")
	
	// Fix common word boundaries - more comprehensive
	text = regexp.MustCompile(`([a-z])(of|and|the|in|for|with|to|from|by|at|on|as|is|are|be|or|an|a|should|be|addressed|to|this|that|which|can|has|have|will|would|could)([A-Z])`).ReplaceAllString(text, "$1 $2 $3")
	
	// Add space after periods when followed by capital letters
	text = regexp.MustCompile(`([.])([A-Z])`).ReplaceAllString(text, "$1 $2")
	
	// Add space after commas when followed by letters/numbers
	text = regexp.MustCompile(`([,])([a-zA-Z0-9])`).ReplaceAllString(text, "$1 $2")
	
	// Fix specific common merged words
	text = regexp.MustCompile(`([a-z])(Journal|Research|Engineering|Management|Department|University|Communication|Technology|System|Network|Article|Publication|Paper|Study|Field|Method|Approach|Analysis|Results|Discussion)`).ReplaceAllString(text, "$1 $2")
	
	// Add spaces before common prepositions and conjunctions when they're merged
	text = regexp.MustCompile(`([a-z])(Of|And|The|In|For|With|To|From|By|At|On|As|Is|Are|Be|Or|An|A|Should|This|That|Which|Can|Has|Have|Will|Would|Could)`).ReplaceAllString(text, "$1 $2")
	
	// Clean up multiple spaces
	text = regexp.MustCompile(`\s+`).ReplaceAllString(text, " ")
	
	return strings.TrimSpace(text)
}

// Upload handler with improved error handling
func UploadHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Parse form with size limit
	err := r.ParseMultipartForm(10 << 20) // 10 MB max
	if err != nil {
		http.Error(w, "Error parsing form: file too large or invalid", http.StatusBadRequest)
		return
	}

	// Get file from form
	file, handler, err := r.FormFile("pdf")
	if err != nil {
		http.Error(w, "Error retrieving file: ensure file field is named 'pdf'", http.StatusBadRequest)
		return
	}
	defer file.Close()

	// Validate file extension
	if filepath.Ext(handler.Filename) != ".pdf" {
		http.Error(w, "Only PDF files are allowed", http.StatusBadRequest)
		return
	}

	// Create temp file with better naming
	tempFile, err := os.CreateTemp("", "upload_*.pdf")
	if err != nil {
		http.Error(w, "Error creating temporary file", http.StatusInternalServerError)
		return
	}
	tempPath := tempFile.Name()
	defer func() {
		tempFile.Close()
		os.Remove(tempPath) // Clean up temp file
	}()

	// Copy uploaded file to temp file
	_, err = io.Copy(tempFile, file)
	if err != nil {
		http.Error(w, "Error writing file", http.StatusInternalServerError)
		return
	}

	// Close temp file before reading it
	tempFile.Close()

	// Extract text from PDF
	text, err := extractText(tempPath)
	if err != nil {
		http.Error(w, "Error extracting text from PDF: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Clean the extracted text
	cleanText := cleanExtractedText(text)

	// Send response
	w.Header().Set("Content-Type", "text/plain; charset=utf-8")
	w.Write([]byte(cleanText))
}