document.addEventListener('DOMContentLoaded', async () => {
  await window.customerAuth.ready;
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
  let submitting = false;
  const uploadedFiles = new WeakMap();

  const updateSubmitState = () => {
    const hasType = typeInputs.some(input => input.checked);
    const fieldsValid = [nameInput, emailInput, phoneInput, document.getElementById('customDetails')].every(field => field && !field.classList.contains('form-input-error') && field.value.trim());
    submitButton.disabled = submitting || !(hasType && fieldsValid);
  };

  const setTypeState = (showError = true) => {
    const hasType = typeInputs.some(input => input.checked);
    if (showError || hasType) typeError.textContent = hasType ? '' : 'Please choose an order type.';
    updateSubmitState();
  };

  window.customerAuth.populateProfileFields({ name: 'customName', email: 'customEmail', phone: 'customPhone' });

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
    if (submitting) return;
    selectedFiles = [...selectedFiles, ...files.filter(file => file.type.startsWith('image/'))];
    renderPreviews();
  };

  fileInput.addEventListener('change', () => addFiles([...fileInput.files]));
  ['dragenter', 'dragover'].forEach(eventName => uploadZone.addEventListener(eventName, event => { event.preventDefault(); uploadZone.classList.add('drag-over'); }));
  ['dragleave', 'drop'].forEach(eventName => uploadZone.addEventListener(eventName, event => { event.preventDefault(); uploadZone.classList.remove('drag-over'); }));
  uploadZone.addEventListener('drop', event => addFiles([...event.dataTransfer.files]));

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (submitting) return;
    setTypeState();
    updateSubmitState();
    if (submitButton.disabled) return;

    submitting = true; form.dataset.busy = 'true'; form.setAttribute('aria-busy', 'true');
    success.classList.remove('visible');
    submitButton.disabled = true;
    const originalSubmitText = submitButton.textContent;
    submitButton.textContent = 'Submitting...';
    const controls = [...form.querySelectorAll('input, select, textarea, button')].filter(control => control !== submitButton);
    const disabled = controls.map(control => control.disabled);
    controls.forEach(control => { control.disabled = true; });

    try {
      const client = typeof supabaseClient !== 'undefined' ? supabaseClient : null;
      if (!client) throw new Error('Database service unavailable.');

      // 1. Determine whether submitter is logged in or guest
      const { data: identity, error: identityError } = await client.auth.getUser();
      // Only an explicitly missing session is a guest; network/expired-token errors must not change ownership.
      if (identityError && identityError.name !== 'AuthSessionMissingError') throw identityError;
      const authUser = identity?.user || null;
      if (!authUser && window.customerAuth.getCurrentUser()) throw new Error('Session changed');
      const referenceImageUrls = [];
      for (const file of selectedFiles) {
        const owner = authUser?.id || 'guests';
        let uploaded = uploadedFiles.get(file);
        if (!uploaded || uploaded.owner !== owner) {
          const ext = (file.name || 'image.jpg').split('.').pop() || 'jpg';
          const path = `${owner}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
          const bucket = client.storage.from('custom-order-images');
          const { error } = await bucket.upload(path, file, { contentType: file.type || 'image/jpeg', upsert: false });
          if (error) throw error;
          const url = bucket.getPublicUrl(path)?.data?.publicUrl;
          if (!url) throw new Error('Upload unavailable');
          uploaded = { owner, url }; uploadedFiles.set(file, uploaded);
        }
        referenceImageUrls.push(uploaded.url);
      }

      const selectedType = form.querySelector('input[name="customOrderType"]:checked')?.value || '';
      const selectedBudget = form.querySelector('input[name="customBudget"]:checked')?.value || null;
      const isSpecificDate = timeline.value === 'specific';
      const specificDateVal = isSpecificDate && dateInput.value ? dateInput.value : null;

      const payload = {
        user_id: authUser ? authUser.id : null,
        guest_email: authUser ? null : emailInput.value.trim().toLowerCase(),
        full_name: nameInput.value.trim(),
        email: emailInput.value.trim().toLowerCase(),
        phone: phoneInput.value.trim(),
        order_type: selectedType,
        dimensions: document.getElementById('customDimensions')?.value.trim() || null,
        color_palette: document.getElementById('customPalette')?.value.trim() || null,
        occasion: document.getElementById('customOccasion')?.value || null,
        description: document.getElementById('customDetails')?.value.trim() || '',
        budget_range: selectedBudget,
        timeline: timeline.value || null,
        specific_date: specificDateVal,
        status: 'Inquiry Received',
        reference_image_urls: referenceImageUrls
      };

      const verified = await client.auth.getUser();
      if ((verified.error && verified.error.name !== 'AuthSessionMissingError') || (verified.data?.user?.id || null) !== (authUser?.id || null)) throw new Error('Session changed');
      const { error } = await client
        .from('custom_order_requests')
        .insert(payload);

      if (error) throw error;

      if (authUser) {
        window.location.href = 'profile.html#custom-orders';
        return;
      }

      success.textContent = `Thank you! Your custom order request has been received. We'll contact you at ${payload.email} soon.`;
      success.classList.add('visible');
      form.reset();
      selectedFiles = [];
      previews.innerHTML = '';
      dateGroup.hidden = true;
      setTypeState(false);
      if (window.showToast) window.showToast('Your custom order request has been received!', 'success');
    } catch (error) {
      if (window.showToast) {
        window.showToast("Couldn't save your request — please try again.", 'error');
      } else {
        success.textContent = "Couldn't save your request — please try again.";
        success.classList.add('visible');
      }
    } finally {
      submitting = false; form.dataset.busy = 'false'; form.removeAttribute('aria-busy');
      controls.forEach((control, index) => { control.disabled = disabled[index]; });
      submitButton.textContent = originalSubmitText;
      updateSubmitState();
    }
  });

  setTypeState(false);
});
