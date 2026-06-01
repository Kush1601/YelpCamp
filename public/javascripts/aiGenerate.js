document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('ai-generate-btn');
    if (!btn) return;

    btn.addEventListener('click', async () => {
        const title = document.getElementById('title').value.trim();
        const location = document.getElementById('location').value.trim();
        const descriptionField = document.getElementById('description');
        const statusMsg = document.getElementById('ai-status');

        if (!title || !location) {
            statusMsg.textContent = 'Fill in Title and Location first.';
            statusMsg.className = 'form-text text-danger';
            return;
        }

        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1" role="status"></span> Generating…';
        statusMsg.textContent = '';

        try {
            const res = await fetch('/campgrounds/generate-description', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, location }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Server error');
            }

            const data = await res.json();
            descriptionField.value = data.description;
            statusMsg.textContent = 'Description generated — feel free to edit it.';
            statusMsg.className = 'form-text text-success';
        } catch (e) {
            statusMsg.textContent = `Error: ${e.message}`;
            statusMsg.className = 'form-text text-danger';
        } finally {
            btn.disabled = false;
            btn.innerHTML = '✦ Generate with AI';
        }
    });
});
