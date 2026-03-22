export class ConfirmationModal {
  /**
   * Show a confirmation dialog.
   * @param {string} message
   * @returns {Promise<boolean>} true if confirmed, false if cancelled
   */
  static show(message) {
    return new Promise(resolve => {
      const overlay = document.createElement('div');
      overlay.className = 'modal-overlay';

      const dialog = document.createElement('div');
      dialog.className = 'modal-dialog';
      dialog.setAttribute('role', 'dialog');
      dialog.setAttribute('aria-modal', 'true');
      dialog.setAttribute('aria-label', 'Confirmation');

      dialog.innerHTML = `
        <p class="modal-message">${message}</p>
        <div class="modal-actions">
          <button class="btn-ghost js-cancel">Cancel</button>
          <button class="btn-danger js-confirm">Delete</button>
        </div>
      `;

      overlay.appendChild(dialog);
      document.body.appendChild(overlay);

      const close = value => {
        document.removeEventListener('keydown', onKeydown);
        overlay.remove();
        resolve(value);
      };

      const onKeydown = e => {
        if (e.key === 'Escape') close(false);
      };

      dialog.querySelector('.js-confirm').addEventListener('click', () => close(true));
      dialog.querySelector('.js-cancel').addEventListener('click', () => close(false));
      overlay.addEventListener('click', e => { if (e.target === overlay) close(false); });
      document.addEventListener('keydown', onKeydown);

      // Focus the cancel button by default (safer UX)
      dialog.querySelector('.js-cancel').focus();
    });
  }
}
