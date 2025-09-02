const fs = require('fs').promises;
const path = require('path');
const pdfParse = require('pdf-parse');
const csvParser = require('csv-parser');
const { Readable } = require('stream');

const processFile = async (fileId, filePath, fileType) => {
  try {
    console.log(`Processing file: ${filePath} (Type: ${fileType})`);

    let result;
    
    switch (fileType) {
      case 'pdf':
        result = await processPDF(filePath);
        break;
      case 'csv':
        result = await processCSV(filePath);
        break;
      default:
        throw new Error(`Unsupported file type: ${fileType}`);
    }

    return {
      success: true,
      extractedText: result.text,
      metadata: result.metadata
    };

  } catch (error) {
    console.error(`File processing error for ${filePath}:`, error);
    return {
      success: false,
      error: error.message
    };
  }
};

const processPDF = async (filePath) => {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdfParse(dataBuffer);

    const metadata = {
      pages: data.numpages,
      info: data.info,
      version: data.pdfInfo?.PDFFormatVersion,
      language: detectLanguage(data.text)
    };

    return {
      text: data.text,
      metadata
    };

  } catch (error) {
    throw new Error(`PDF processing failed: ${error.message}`);
  }
};

const processCSV = async (filePath) => {
  return new Promise((resolve, reject) => {
    try {
      const results = [];
      const columns = [];
      let rowCount = 0;

      const stream = fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('data', (data) => {
          if (rowCount === 0) {
            columns.push(...Object.keys(data));
          }
          results.push(data);
          rowCount++;
        })
        .on('end', () => {
          const text = convertCSVToText(results, columns);
          const metadata = {
            rows: rowCount,
            columns,
            encoding: 'utf-8',
            language: detectLanguage(text)
          };

          resolve({
            text,
            metadata
          });
        })
        .on('error', (error) => {
          reject(new Error(`CSV processing failed: ${error.message}`));
        });

    } catch (error) {
      reject(new Error(`CSV processing failed: ${error.message}`));
    }
  });
};

const convertCSVToText = (data, columns) => {
  if (!data || data.length === 0) {
    return 'Empty CSV file';
  }

  let text = `CSV Data with ${columns.length} columns and ${data.length} rows:\n\n`;
  text += `Columns: ${columns.join(', ')}\n\n`;
  const sampleRows = data.slice(0, 5);
  sampleRows.forEach((row, index) => {
    text += `Row ${index + 1}: ${columns.map(col => `${col}: ${row[col]}`).join(', ')}\n`;
  });

  if (data.length > 5) {
    text += `\n... and ${data.length - 5} more rows`;
  }

  return text;
};

const detectLanguage = (text) => {
  if (!text || text.length < 10) return 'unknown';
  const patterns = {
    english: /[a-zA-Z]/g,
    chinese: /[\u4e00-\u9fff]/g,
    japanese: /[\u3040-\u309f\u30a0-\u30ff]/g,
    korean: /[\uac00-\ud7af]/g,
    arabic: /[\u0600-\u06ff]/g,
    cyrillic: /[\u0400-\u04ff]/g
  };

  const scores = {};
  
  Object.entries(patterns).forEach(([lang, pattern]) => {
    const matches = text.match(pattern);
    scores[lang] = matches ? matches.length : 0;
  });

  const detectedLang = Object.entries(scores).reduce((a, b) => 
    scores[a[0]] > scores[b[0]] ? a : b
  )[0];

  return scores[detectedLang] > text.length * 0.1 ? detectedLang : 'unknown';
};

const cleanupOldFiles = async (directory, maxAge = 24 * 60 * 60 * 1000) => {
  try {
    const files = await fs.readdir(directory);
    const now = Date.now();
    let deletedCount = 0;

    for (const file of files) {
      const filePath = path.join(directory, file);
      const stats = await fs.stat(filePath);
      const age = now - stats.mtime.getTime();

      if (age > maxAge) {
        try {
          await fs.unlink(filePath);
          deletedCount++;
          console.log(`Deleted old file: ${file}`);
        } catch (error) {
          console.warn(`Could not delete file ${file}:`, error.message);
        }
      }
    }

    if (deletedCount > 0) {
      console.log(`Cleanup completed: ${deletedCount} files deleted`);
    }

    return deletedCount;

  } catch (error) {
    console.error('File cleanup error:', error);
    return 0;
  }
};

const getFileStats = async (directory) => {
  try {
    const files = await fs.readdir(directory);
    const stats = {
      totalFiles: files.length,
      totalSize: 0,
      fileTypes: {},
      oldestFile: null,
      newestFile: null
    };

    let oldestTime = Date.now();
    let newestTime = 0;

    for (const file of files) {
      const filePath = path.join(directory, file);
      const fileStats = await fs.stat(filePath);
      
      stats.totalSize += fileStats.size;
      
      const ext = path.extname(file).toLowerCase();
      stats.fileTypes[ext] = (stats.fileTypes[ext] || 0) + 1;

      if (fileStats.mtime.getTime() < oldestTime) {
        oldestTime = fileStats.mtime.getTime();
        stats.oldestFile = file;
      }

      if (fileStats.mtime.getTime() > newestTime) {
        newestTime = fileStats.mtime.getTime();
        stats.newestFile = file;
      }
    }

    stats.totalSizeFormatted = formatBytes(stats.totalSize);
    stats.oldestFileAge = oldestTime !== Date.now() ? Date.now() - oldestTime : 0;
    stats.newestFileAge = newestTime !== 0 ? Date.now() - newestTime : 0;

    return stats;

  } catch (error) {
    console.error('File stats error:', error);
    return null;
  }
};

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const validateFileType = (filename, allowedTypes = ['pdf', 'csv']) => {
  const ext = path.extname(filename).toLowerCase().substring(1);
  return allowedTypes.includes(ext);
};

const getFileMetadata = async (filePath) => {
  try {
    const stats = await fs.stat(filePath);
    const ext = path.extname(filePath).toLowerCase();
    
    return {
      size: stats.size,
      sizeFormatted: formatBytes(stats.size),
      extension: ext,
      created: stats.birthtime,
      modified: stats.mtime,
      isFile: stats.isFile(),
      isDirectory: stats.isDirectory()
    };
  } catch (error) {
    throw new Error(`Could not read file metadata: ${error.message}`);
  }
};

module.exports = {
  processFile,
  processPDF,
  processCSV,
  detectLanguage,
  cleanupOldFiles,
  getFileStats,
  formatBytes,
  validateFileType,
  getFileMetadata
};
