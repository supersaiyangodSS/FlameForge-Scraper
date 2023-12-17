import fs from 'fs/promises';

const saveFile = async (data, filePath) => {


  try {
    const jsonData = Array.isArray(data) ? JSON.stringify(data, null, 2) : JSON.stringify(data, null, 2);
    await fs.writeFile(filePath, jsonData, 'utf-8');
    console.log('JSON file saved successfully');
  }
  catch (error) {
    console.error('Error writing JSON file:', error);
  }
};

export default saveFile;
