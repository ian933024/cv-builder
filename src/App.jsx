import { useEffect, useState, useRef } from 'react';

import { nanoid } from 'nanoid';

import Editor from './components/editors/Editor';
import Preview from './components/preview/Preview';

function App() {
  const [formData, setFormData] = useState(
    JSON.parse(localStorage.getItem('cvFormData')) || {
      basicInfo: {
        firstName: '',
        lastName: '',
        age: '',
        occupation: '',
        selfSummary: '',
      },
      contactInfo: {
        email: '',
        phoneNumber: '',
        location: '',
        website: '',
      },
      educationInfo: [],
      experienceInfo: [],
      skillsInfo: [],
      otherInfo: [],
    },
  );

  const [previewVisible, setPreviewVisibility] = useState(true);
  const previewRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('cvFormData', JSON.stringify(formData));
  }, [formData]);

  const togglePreview = () => {
    setPreviewVisibility((prevState) => !prevState);
  };

  const printPreview = () => {
    window.print();
  };

  const downloadPdf = async () => {
    try {
      // Get the preview container
      const element = document.querySelector('.preview__printable');
      
      // Check if element exists
      if (!element) {
        console.error('Preview element not found');
        return;
      }

      // PDF filename - use first and last name if available
      const firstName = formData.basicInfo.firstName || 'CV';
      const lastName = formData.basicInfo.lastName || 'Resume';
      const fileName = `${firstName}_${lastName}.pdf`;

      // Create a clone of the element to avoid modifying the original
      const clone = element.cloneNode(true);
      
      // Temporarily append to body but hide it
      clone.style.position = 'absolute';
      clone.style.left = '-9999px';
      document.body.appendChild(clone);

      // PDF options
      const options = {
        margin: [10, 10, 10, 10],
        filename: fileName,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true,
          logging: false, // Disable logging
          letterRendering: true // Improve text quality
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait',
          compress: true
        }
      };

      // Generate PDF
      await window.html2pdf().set(options).from(clone).save();
      
      // Clean up
      document.body.removeChild(clone);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };
  
  // Save CV data to a file
  const saveToFile = () => {
    try {
      // Get all CV data
      const data = {
        formData,
        // Include any other data that's stored in localStorage
        educationInfo: JSON.parse(localStorage.getItem('cvEducationInfo')) || {},
        experienceInfo: JSON.parse(localStorage.getItem('cvExperienceInfo')) || {},
        skillsInfo: JSON.parse(localStorage.getItem('cvskillsInfo')) || {},
        otherInfo: JSON.parse(localStorage.getItem('cvotherInfo')) || {},
        isDarkMode: JSON.parse(localStorage.getItem('isDarkMode')) || false
      };
      
      // Convert to JSON string
      const jsonData = JSON.stringify(data, null, 2);
      
      // Create blob and download link
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create file name
      const firstName = formData.basicInfo.firstName || 'CV';
      const lastName = formData.basicInfo.lastName || 'Data';
      const fileName = `${firstName}_${lastName}_data.json`;
      
      // Create download link and trigger click
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      // eslint-disable-next-line no-alert
      alert(`Error saving CV data: ${error.message}`);
    }
  };
  
  // Load CV data from a file
  const loadFromFile = (event) => {
    try {
      const file = event.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          
          // Update form data
          if (data.formData) {
            setFormData(data.formData);
          }
          
          // Update other localStorage items
          if (data.educationInfo) localStorage.setItem('cvEducationInfo', JSON.stringify(data.educationInfo));
          if (data.experienceInfo) localStorage.setItem('cvExperienceInfo', JSON.stringify(data.experienceInfo));
          if (data.skillsInfo) localStorage.setItem('cvskillsInfo', JSON.stringify(data.skillsInfo));
          if (data.otherInfo) localStorage.setItem('cvotherInfo', JSON.stringify(data.otherInfo));
          if (data.isDarkMode !== undefined) localStorage.setItem('isDarkMode', JSON.stringify(data.isDarkMode));
          
          // Reset the file input
          const fileInput = event.target;
          fileInput.value = '';
          
          // eslint-disable-next-line no-alert
          alert('CV data loaded successfully!');
          
          // Refresh the page to ensure all components update with the new data
          window.location.reload();
        } catch (parseError) {
          // eslint-disable-next-line no-alert
          alert(`Error parsing CV data file: ${parseError.message}`);
        }
      };
      
      reader.readAsText(file);
    } catch (error) {
      // eslint-disable-next-line no-alert
      alert(`Error loading CV data: ${error.message}`);
    }
  };

  const handleBasicInfoChanges = (e) => {
    const { name, value } = e.target;

    setFormData((prevFormData) => ({
      ...prevFormData,
      basicInfo: {
        ...prevFormData.basicInfo,
        [name]: value,
      },
    }));
  };

  const handleContactInfoChanges = (e) => {
    const { name, value } = e.target;

    setFormData((prevFormData) => ({
      ...prevFormData,
      contactInfo: {
        ...prevFormData.contactInfo,
        [name]: value,
      },
    }));
  };

  const submitBackgroundInfo = (e, type) => {
    e.preventDefault();

    const parentEl = e.target.closest('form');

    const newInfo = [...parentEl.querySelectorAll('input')]
      .map((field) => ({
        [field.name]: field.value,
      }))
      .reduce((obj, item) => Object.assign(obj, { ...item }));

    const addlInfo = [
      ...parentEl.querySelectorAll('.submitted-item__name'),
    ].map((el) => ({ id: el.dataset.id, content: el.textContent }));

    setFormData((prevFormData) => ({
      ...prevFormData,
      [type]: [
        ...prevFormData[type],
        {
          ...newInfo,
          id: nanoid(),
          additionalInfo: addlInfo,
          currentInfoItem: '',
        },
      ],
    }));
  };

  const deleteBackgroundInfo = (id, type) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [type]: prevFormData[type].filter((item) => item.id !== id),
    }));
  };

  const submitCategoryInfo = (e, type) => {
    e.preventDefault();

    const parentEl = e.target.closest('form');

    const category = parentEl.querySelector('.form-input__item-category').value;
    const submittedItems = [
      ...parentEl.querySelectorAll('.submitted-item__name'),
    ].map((el) => ({ content: el.textContent, id: el.dataset.id }));

    if (!category) return;

    setFormData((prevFormData) => ({
      ...prevFormData,
      [type]: [
        ...prevFormData[type],
        {
          category,
          items: submittedItems,
          id: nanoid(),
        },
      ],
    }));
  };

  const deleteCategoryInfo = (id, type) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [type]: prevFormData[type].filter((item) => item.id !== id),
    }));
  };

  return (
    <div className="App">
      <Editor
        formData={formData}
        handleBasicInfoChanges={handleBasicInfoChanges}
        handleContactInfoChanges={handleContactInfoChanges}
        submitBackgroundInfo={submitBackgroundInfo}
        deleteBackgroundInfo={deleteBackgroundInfo}
        submitCategoryInfo={submitCategoryInfo}
        deleteCategoryInfo={deleteCategoryInfo}
      />
      {previewVisible && <Preview ref={previewRef} formData={formData} />}
      <div className="btn-container__preview">
        <button
          className="btn__menu material-symbols-outlined"
          type="button"
          title="Menu"
        >
          menu
        </button>
        <div className="action-buttons">
          <button
            type="button"
            className="btn__toggle-preview material-symbols-outlined"
            onClick={togglePreview}
            title="Toggle Preview"
          >
            visibility
          </button>
          <button
            type="button"
            className="btn__print-preview material-symbols-outlined"
            onClick={printPreview}
            title="Print CV"
            disabled={!previewVisible}
            style={{ opacity: previewVisible ? 0.8 : 0.3 }}
          >
            print
          </button>
          <button
            type="button"
            className="btn__download-pdf material-symbols-outlined"
            onClick={downloadPdf}
            title="Download as PDF"
            disabled={!previewVisible}
            style={{ opacity: previewVisible ? 0.8 : 0.3 }}
          >
            download
          </button>
          <button
            type="button"
            className="btn__save-data material-symbols-outlined"
            onClick={saveToFile}
            title="Save CV Data"
          >
            save
          </button>
          <label className="btn__load-data material-symbols-outlined" title="Load CV Data">
            upload
            <input 
              type="file" 
              accept=".json" 
              onChange={loadFromFile} 
              style={{ display: 'none' }} 
            />
          </label>
        </div>
      </div>
    </div>
  );
}

export default App;
