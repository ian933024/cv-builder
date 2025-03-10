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
          className="btn__toggle-preview material-symbols-outlined"
          type="button"
          onClick={togglePreview}
        >
          visibility
        </button>
        {previewVisible && (
          <>
            <button
              type="button"
              className="btn__print-preview material-symbols-outlined"
              onClick={printPreview}
            >
              print
            </button>
            <button
              type="button"
              className="btn__download-pdf material-symbols-outlined"
              onClick={downloadPdf}
              title="Download as PDF"
            >
              download
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
