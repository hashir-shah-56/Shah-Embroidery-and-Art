document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('customOrderPageForm');
  if (!form) return;

  const nameInput = document.getElementById('customName');
  const emailInput = document.getElementById('customEmail');
  const phoneInput = document.getElementById('customPhone');
  const typeInputs = [...form.querySelectorAll('input[name="customOrderType"]')];
  const typeError = document.getElementById('error-customOrderType');
  const submitButton = document.getElementById('customOrderSubmit');
  const timeline = document.getElementById('customTimeline');
  const dateGroup = document.getElementById('customDateGroup');
  const dateInput = document.getElementById('customDate');
  const fileInput = document.getElementById('customReferenceImages');
  const uploadZone = document.getElementById('customUploadZone');
  const previews = document.getElementById('customImagePreviews');
  const success = document.getElementById('customOrderSuccess');
  let selectedFiles = [];

  const getCurrentUser = () => {
    try { return JSON.parse(localStorage.getItem('shah_current_user')) || null; } catch { return null; }
  };

  const updateSubmitState = () => {
    const hasType = typeInputs.some(input => input.checked);
    const fieldsValid = [nameInput, emailInput, phoneInput, document.getElementById('customDetails')].every(field => field && !field.classList.contains('form-input-error') && field.value.trim());
    submitButton.disabled = !(hasType && fieldsValid);
  };

  const setTypeState = (showError = true) => {
    const hasType = typeInputs.some(input => input.checked);
    if (showError || hasType) typeError.textContent = hasType ? '' : 'Please choose an order type.';
    updateSubmitState();
  };

  const user = getCurrentUser();
  if (user) {
    nameInput.value = user.name || '';
    emailInput.value = user.email || '';
    try {
      const users = JSON.parse(localStorage.getItem('shah_users')) || [];
      phoneInput.value = users.find(item => item.email.toLowerCase() === user.email.toLowerCase())?.phone || '';
    } catch { phoneInput.value = ''; }
    [nameInput, emailInput, phoneInput].forEach(field => field.dispatchEvent(new Event('input', { bubbles: true })));
  }

  typeInputs.forEach(input => input.addEventListener('change', setTypeState));
  timeline.addEventListener('change', () => {
    dateGroup.hidden = timeline.value !== 'specific';
    dateInput.required = timeline.value === 'specific';
  });

  const renderPreviews = () => {
    previews.innerHTML = '';
    selectedFiles.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = event => {
        const item = document.createElement('div');
        item.className = 'custom-order-preview';
        item.innerHTML = `<img src="${event.target.result}" alt="Reference image ${index + 1}"><button type="button" aria-label="Remove reference image">&times;</button>`;
        item.querySelector('button').addEventListener('click', () => {
          selectedFiles.splice(index, 1);
          renderPreviews();
        });
        previews.appendChild(item);
      };
      reader.readAsDataURL(file);
    });
  };

  const addFiles = files => {
    selectedFiles = [...selectedFiles, ...files.filter(file => file.type.startsWith('image/'))];
    renderPreviews();
  };

  fileInput.addEventListener('change', () => addFiles([...fileInput.files]));
  ['dragenter', 'dragover'].forEach(eventName => uploadZone.addEventListener(eventName, event => { event.preventDefault(); uploadZone.classList.add('drag-over'); }));
  ['dragleave', 'drop'].forEach(eventName => uploadZone.addEventListener(eventName, event => { event.preventDefault(); uploadZone.classList.remove('drag-over'); }));
  uploadZone.addEventListener('drop', event => addFiles([...event.dataTransfer.files]));

  form.addEventListener('submit', event => {
    event.preventDefault();
    setTypeState();
    updateSubmitState();
    if (submitButton.disabled) return;

    const request = {
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      summary: `${form.querySelector('input[name="customOrderType"]:checked').value} request: ${document.getElementById('customDetails').value.trim()}`,
      details: document.getElementById('customDetails').value.trim(),
      status: 'Inquiry Received',
      name: nameInput.value.trim(),
      email: emailInput.value.trim(),
      phone: phoneInput.value.trim(),
      orderType: form.querySelector('input[name="customOrderType"]:checked').value,
      dimensions: document.getElementById('customDimensions').value.trim(),
      palette: document.getElementById('customPalette').value.trim(),
      occasion: document.getElementById('customOccasion').value,
      budget: form.querySelector('input[name="customBudget"]:checked')?.value || '',
      timeline: timeline.value,
      preferredDate: dateInput.value,
      referenceImageNames: selectedFiles.map(file => file.name)
    };

    // Files are previewed in the browser only; backend storage is required for persistence.
    const requests = (() => { try { return JSON.parse(localStorage.getItem('shah_custom_order_requests')) || {}; } catch { return {}; } })();
    const user = getCurrentUser();
    const key = user ? user.email.toLowerCase() : 'guest';
    requests[key] = [...(requests[key] || []), request];
    let saved = false;
    try {
      localStorage.setItem('shah_custom_order_requests', JSON.stringify(requests));
      saved = true;
    } catch (e) {
      saved = false;
    }

    if (!saved) {
      if (window.showToast) window.showToast("Couldn't save your request — please try again.", 'error');
      return;
    }

    if (user) {
      window.location.href = 'profile.html#custom-orders';
      return;
    }
    success.textContent = `Thank you! Your custom order request has been received. We'll contact you at ${request.email} soon.`;
    success.classList.add('visible');
    form.reset();
    selectedFiles = [];
    previews.innerHTML = '';
    dateGroup.hidden = true;
    submitButton.disabled = true;
  });

  setTypeState(false);
});
